// api/_extract.js  -> reads PDF, PPTX and DOCX by their real file bytes
const JSZip = require('jszip');

const decode = function (s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); })
    .replace(/&amp;/g, '&');
};

function xmlText(xml) {
  return decode(
    xml
      .replace(/<\/a:p>|<\/w:p>/g, '\n')
      .replace(/<a:br\s*\/>|<w:br\s*\/>/g, '\n')
      .replace(/<w:tab\s*\/>/g, ' ')
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function num(name) {
  const m = name.match(/(\d+)\.xml$/);
  return m ? parseInt(m[1], 10) : 0;
}

function loadPdfParse() {
  try { return require('pdf-parse/lib/pdf-parse.js'); }
  catch (e) { return require('pdf-parse'); }
}

async function extractText(buf) {
  if (!buf || !buf.length) throw new Error('The file is empty.');
  const head = buf.slice(0, 5).toString();

  // PDF
  if (head === '%PDF-') {
    const pdfParse = loadPdfParse();
    const r = await pdfParse(buf);
    return { text: r.text || '' };
  }

  // PPTX / DOCX are zip files ("PK")
  if (buf[0] === 0x50 && buf[1] === 0x4b) {
    const zip = await JSZip.loadAsync(buf);
    const names = Object.keys(zip.files);

    // PowerPoint
    const slides = names
      .filter(function (n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); })
      .sort(function (a, b) { return num(a) - num(b); });
    if (slides.length) {
      let out = '';
      for (const s of slides) {
        const i = num(s);
        out += '\n' + xmlText(await zip.file(s).async('string')) + '\n';
        const notes = zip.file('ppt/notesSlides/notesSlide' + i + '.xml');
        if (notes) out += xmlText(await notes.async('string')) + '\n';
      }
      return { text: out };
    }

    // Word
    if (zip.file('word/document.xml')) {
      return { text: xmlText(await zip.file('word/document.xml').async('string')) };
    }
  }

  throw new Error('Unsupported file. Use PDF, PPTX or DOCX. Old .ppt / .doc files must be saved as .pptx / .docx first.');
}

module.exports = { extractText };
