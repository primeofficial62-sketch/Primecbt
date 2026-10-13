// api/_extract.js
// Reads the text out of a PDF, a PowerPoint (.pptx) or a Word (.docx) file.
// The leading underscore keeps Vercel from exposing this file as its own endpoint.
// Needs in package.json:  "pdf-parse": "1.1.1"  and  "jszip": "3.10.1"

let pdfParse = null;
try { pdfParse = require('pdf-parse/lib/pdf-parse.js'); } catch (e) { pdfParse = null; }
let JSZip = null;
try { JSZip = require('jszip'); } catch (e) { JSZip = null; }

const decode = (s) => String(s)
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
  .replace(/&amp;/g, '&');

// Turns Office XML into plain lines: one line per paragraph.
function paragraphs(xml, pTag, tTag) {
  const pRe = new RegExp('<' + pTag + '(?:\\s[^>]*)?>[\\s\\S]*?<\\/' + pTag + '>', 'g');
  const tRe = new RegExp('<' + tTag + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + tTag + '>', 'g');
  const lines = [];
  (xml.match(pRe) || []).forEach((p) => {
    let line = '', m;
    tRe.lastIndex = 0;
    while ((m = tRe.exec(p))) line += decode(m[1]);
    if (line.trim()) lines.push(line.trim());
  });
  return lines;
}

const num = (name) => parseInt((name.match(/(\d+)\.xml$/) || [])[1], 10) || 0;

async function readZip(buf) {
  if (!JSZip) throw new Error('The PowerPoint/Word reader is not installed (add "jszip": "3.10.1" to package.json).');
  const zip = await JSZip.loadAsync(buf);
  const names = Object.keys(zip.files);

  // PowerPoint
  const slides = names.filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => num(a) - num(b));
  if (slides.length) {
    const out = [];
    for (const name of slides) {
      const n = num(name);
      const lines = paragraphs(await zip.files[name].async('string'), 'a:p', 'a:t');
      const notesName = 'ppt/notesSlides/notesSlide' + n + '.xml';
      const notes = zip.files[notesName] ? paragraphs(await zip.files[notesName].async('string'), 'a:p', 'a:t') : [];
      if (lines.length || notes.length) {
        out.push('Slide ' + n + ':\n' + lines.join('\n') + (notes.length ? '\nSpeaker notes: ' + notes.join(' ') : ''));
      }
    }
    return { text: out.join('\n\n'), kind: 'pptx' };
  }

  // Word
  if (zip.files['word/document.xml']) {
    return { text: paragraphs(await zip.files['word/document.xml'].async('string'), 'w:p', 'w:t').join('\n'), kind: 'docx' };
  }

  throw new Error('This file is not a PowerPoint (.pptx), Word (.docx) or PDF file.');
}

// Returns { text, kind, pages? }. Throws an Error with a plain-language message.
async function extractText(buf) {
  const head = buf.slice(0, 4);
  if (head.toString() === '%PDF') {
    if (!pdfParse) throw new Error('The PDF reader is not installed (add "pdf-parse": "1.1.1" to package.json).');
    const p = await pdfParse(buf);
    return { text: String(p.text || ''), kind: 'pdf', pages: p.numpages };
  }
  if (head[0] === 0x50 && head[1] === 0x4b) return readZip(buf);
  if (head[0] === 0xd0 && head[1] === 0xcf) {
    throw new Error('Old PowerPoint (.ppt) and Word (.doc) files are not supported. Save the file as .pptx, .docx or PDF and upload it again.');
  }
  throw new Error('This file type cannot be read. Use a PDF, PowerPoint (.pptx) or Word (.docx) file.');
}

module.exports = { extractText };
