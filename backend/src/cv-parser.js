const { inflateRawSync, inflateSync } = require("node:zlib");

function decodePdfLiteral(value) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_match, char) => ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" })[char])
    .replace(/\\([0-7]{1,3})/g, (_match, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\\r?\n/g, "");
}

function decodePdfHex(value) {
  const hex = value.replace(/\s/g, "");
  if (!hex || !/^[\da-f]+$/i.test(hex)) return "";
  const even = hex.length % 2 ? `${hex}0` : hex;
  const bytes = Buffer.from(even, "hex");
  if (bytes.length > 1 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = Buffer.from(bytes.subarray(2));
    for (let index = 0; index + 1 < swapped.length; index += 2) {
      const current = swapped[index];
      swapped[index] = swapped[index + 1];
      swapped[index + 1] = current;
    }
    return swapped.toString("utf16le");
  }
  return bytes.toString("latin1");
}

function extractPdfText(buffer) {
  const source = buffer.toString("latin1");
  const pieces = [];
  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamPattern.exec(source))) {
    const dictionary = source.slice(Math.max(0, match.index - 500), match.index);
    let stream = Buffer.from(match[1], "latin1");
    try {
      if (/\/FlateDecode/.test(dictionary)) stream = inflateSync(stream, { maxOutputLength: 20 * 1024 * 1024 });
      else if (/\/ASCII85Decode/.test(dictionary)) continue;
    } catch {
      continue;
    }
    const content = stream.toString("latin1");
    const textPattern = /\(((?:\\.|[^\\)])*)\)\s*Tj|<([\da-f\s]+)>\s*Tj|\[((?:\\.|[^\]])*)\]\s*TJ/g;
    let textMatch;
    while ((textMatch = textPattern.exec(content))) {
      if (textMatch[1] !== undefined) pieces.push(decodePdfLiteral(textMatch[1]));
      else if (textMatch[2] !== undefined) pieces.push(decodePdfHex(textMatch[2]));
      else {
        const array = textMatch[3];
        const atoms = /\(((?:\\.|[^\\)])*)\)|<([\da-f\s]+)>/g;
        let atom;
        while ((atom = atoms.exec(array))) pieces.push(atom[1] !== undefined ? decodePdfLiteral(atom[1]) : decodePdfHex(atom[2]));
      }
      pieces.push("\n");
    }
  }
  return pieces.join("").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ").replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{2,}/g, "\n").trim();
}

function extractDocxText(buffer) {
  const eocdSignature = 0x06054b50;
  let eocd = -1;
  for (let offset = Math.max(0, buffer.length - 65557); offset <= buffer.length - 22; offset += 1) {
    if (buffer.readUInt32LE(offset) === eocdSignature) eocd = offset;
  }
  if (eocd < 0) throw new Error("This Word document could not be opened.");
  const entries = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);
  let xml = null;
  for (let index = 0; index < entries; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error("This Word document has an invalid archive.");
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    if (name === "word/document.xml") {
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(start, start + compressedSize);
      xml = method === 0 ? compressed : method === 8 ? inflateRawSync(compressed, { maxOutputLength: 20 * 1024 * 1024 }) : null;
      break;
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (!xml) throw new Error("This Word document could not be read.");
  return xml.toString("utf8")
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:br\b[^>]*\/>|<\/w:p>/g, "\n")
    .replace(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{2,}/g, "\n").trim();
}

function extractCvText(buffer, extension) {
  const text = extension === "pdf" ? extractPdfText(buffer) : extractDocxText(buffer);
  if (text.length < 40) {
    const error = new Error("No selectable text was found in this CV. If it is a scanned PDF, upload a text-based PDF or DOCX.");
    error.statusCode = 422;
    throw error;
  }
  return text.slice(0, 24000);
}

function parseFallbackProfile(text) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = text.match(/(?:\+?254|0)(?:\s*\d){9,10}/)?.[0]?.replace(/\s+/g, "") || "";
  const cleanLines = text.split(/\r?\n|(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
  const skip = /^(curriculum vitae|resume|cv|profile|contact|experience|work experience|employment history|education|academic background|skills|references)$/i;
  const headline = cleanLines.find((line) => line.length >= 5 && line.length <= 100 && !skip.test(line) && !line.includes("@")) || "";
  const skillVocabulary = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL", "PostgreSQL", "Excel", "Microsoft Office", "Accounting", "Customer Service", "Project Management", "Communication", "Marketing", "Sales", "Data Analysis", "AutoCAD", "Electrician", "Plumbing", "Welding", "Driving", "Teaching", "First Aid"];
  const foundSkills = skillVocabulary.filter((skill) => new RegExp(`\\b${skill}\\b`, "i").test(text));
  const summaryStart = text.search(/(?:professional summary|career summary|personal profile|objective)\s*[:\-]?/i);
  const professionalSummary = summaryStart >= 0 ? text.slice(summaryStart).replace(/^(?:professional summary|career summary|personal profile|objective)\s*[:\-]?/i, "").split(/\b(?:work experience|employment history|education|skills)\b/i)[0].trim().slice(0, 1200) : "";
  return {
    personal: { headline, phone, email },
    employment: { desiredTitles: [], industries: [] },
    education: [], experience: [],
    skills: { technicalSkills: foundSkills, professionalSkills: [], languages: [], certifications: [], training: [] },
    professionalSummary,
    source: "text-extraction",
  };
}

module.exports = { extractCvText, parseFallbackProfile };
