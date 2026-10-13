// api/_generate.js
// Makes exam questions strictly from ONE uploaded PDF and saves them to the `questions` table.
// The leading underscore keeps Vercel from exposing this file as its own endpoint.
// Needs:  npm i pdf-parse   and the env var ANTHROPIC_API_KEY.

const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

// lower-case, letters and digits only, single spaces. Used to compare text safely.
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const SYSTEM = [
  'You write multiple-choice exam questions for university students.',
  'You work ONLY from the attached PDF. The PDF is the single source of truth.',
  '',
  'Strict rules:',
  '1. Use only facts, definitions, figures and explanations that are written in the PDF. Never use outside knowledge, never guess, never fill gaps.',
  '2. Every question must be answerable from one specific passage in the PDF. Copy that passage into "source_quote" EXACTLY as it appears (max 300 characters, no paraphrasing, no ellipses).',
  '3. Exactly 4 options. Exactly one is correct according to the PDF. The 3 wrong options must be plausible but clearly wrong according to the PDF.',
  '4. The question must make sense on its own. Never write "according to the text", "in the document", "on page X", or ask about the author, title or layout.',
  '5. Do not repeat a question. Spread the questions across the whole PDF, not only the first pages.',
  '6. The "explanation" must say why the answer is correct, using only the PDF.',
  '7. If the PDF does not contain enough material for the requested number, return fewer questions. Never pad.',
  '8. Skip tables of contents, references, acknowledgements and blank or unreadable parts.'
].join('\n');

const TOOL = {
  name: 'submit_questions',
  description: 'Submit the exam questions written from the PDF.',
  input_schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
            correct_index: { type: 'integer', minimum: 0, maximum: 3 },
            explanation: { type: 'string' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            source_quote: { type: 'string' }
          },
          required: ['question', 'options', 'correct_index', 'explanation', 'difficulty', 'source_quote']
        }
      }
    },
    required: ['questions']
  }
};

async function generateFromMaterial(supabase, args) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set on the server.');
  const count = Math.min(40, Math.max(5, parseInt(args.count, 10) || 20));

  const { data: mat, error: mErr } = await supabase.from('materials').select('id,title,file_url').eq('id', args.material_id).single();
  if (mErr || !mat) throw new Error('Material not found.');
  const { data: course, error: cErr } = await supabase.from('courses').select('id,title,code').eq('id', args.course_id).single();
  if (cErr || !course) throw new Error('Course not found.');

  // 1. download the PDF
  const dl = await fetch(mat.file_url);
  if (!dl.ok) throw new Error('Could not download the PDF (' + dl.status + '). Is the storage bucket public?');
  const buf = Buffer.from(await dl.arrayBuffer());
  if (buf.slice(0, 4).toString() !== '%PDF') throw new Error('This file is not a PDF.');
  if (buf.length > 30 * 1024 * 1024) throw new Error('This PDF is over 30 MB. Compress or split it.');

  // 2. read its text so every question can be checked against it afterwards
  let pdfText = '', pages = 0;
  try { const p = await pdfParse(buf); pdfText = norm(p.text); pages = p.numpages; } catch (e) { /* handled below */ }
  if (pdfText.length < 200) throw new Error('No readable text found. This PDF looks scanned. Upload a text-based PDF.');
  if (pages > 100) throw new Error('This PDF has ' + pages + ' pages. The limit is 100. Split it into smaller PDFs.');

  // 3. ask Claude, forcing a structured answer
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 12000,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'submit_questions' },
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') } },
          { type: 'text', text: 'Course: ' + course.title + (course.code ? ' (' + course.code + ')' : '') + '\nWrite up to ' + count + ' questions from this PDF only. Follow every rule.' }
        ]
      }]
    })
  });
  const out = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error((out.error && out.error.message) || 'The AI request failed (' + resp.status + ').');
  const block = (out.content || []).find((b) => b.type === 'tool_use');
  const raw = (block && block.input && block.input.questions) || [];

  // 4. strict checks. Anything that fails is thrown away.
  const { data: existing } = await supabase.from('questions').select('question').eq('course_id', course.id).limit(5000);
  const seen = new Set((existing || []).map((q) => norm(q.question)));
  const keep = [];
  let rejected = 0, duplicates = 0;

  for (const q of raw) {
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o || '').trim()) : [];
    const quote = norm(q.source_quote);
    const valid =
      q.question && String(q.question).trim().length > 10 &&
      options.length === 4 && options.every(Boolean) &&
      new Set(options.map(norm)).size === 4 &&
      Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index <= 3 &&
      quote.length >= 20 && pdfText.indexOf(quote) !== -1;       // the supporting passage must really exist in the PDF
    if (!valid) { rejected++; continue; }
    const key2 = norm(q.question);
    if (seen.has(key2)) { duplicates++; continue; }
    seen.add(key2);
    keep.push({
      course_id: course.id,
      question: String(q.question).trim(),
      options,
      correct_index: q.correct_index,
      explanation: String(q.explanation || '').trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      source_material_id: mat.id,
      source_quote: String(q.source_quote).trim().slice(0, 400),
      ai_generated: true
    });
  }

  if (keep.length) {
    const { error: iErr } = await supabase.from('questions').insert(keep);
    if (iErr) throw new Error('Could not save the questions: ' + iErr.message);
  }
  return { saved: keep.length, rejected, duplicates };
}

module.exports = { generateFromMaterial };
