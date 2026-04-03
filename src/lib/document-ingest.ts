import { Buffer } from "node:buffer";
import { extractText as unpdfExtract } from "unpdf";
import { extractTextFromImage } from "./claude-vision";
import { isPdfMagicBytes } from "./pdf-validate";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export function extMime(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  return null;
}

export function validateFileMeta(size: number, fileName: string, mime: string): string | null {
  if (size <= 0) return "File is empty.";
  if (size > MAX_FILE_BYTES) return "Each file must be 10MB or smaller.";
  const byName = extMime(fileName);
  const m = mime || "";
  const mimeOk = m && ALLOWED_MIME.has(m);
  if (!byName && !mimeOk) return "Use PDF, JPG, or PNG only.";
  return null;
}

async function extractPdfWithPdfParse(buffer: ArrayBuffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(Buffer.from(buffer));
  return (data.text ?? "").trim();
}

async function extractPdfFallbackUnpdf(buffer: ArrayBuffer): Promise<string> {
  const { text } = await unpdfExtract(new Uint8Array(buffer), { mergePages: true });
  return (text ?? "").trim();
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const t = await extractPdfWithPdfParse(buffer);
    if (t.length > 0) return t;
  } catch {
    /* fall through */
  }
  return extractPdfFallbackUnpdf(buffer);
}

async function extractImageText(buffer: ArrayBuffer, mediaType: "image/jpeg" | "image/png"): Promise<string> {
  const b64 = Buffer.from(buffer).toString("base64");
  return extractTextFromImage(b64, mediaType);
}

export async function extractTextFromUpload(
  buffer: ArrayBuffer,
  fileName: string,
  mimeHint: string
): Promise<string> {
  const mime = mimeHint || extMime(fileName) || "";
  if (isPdfMagicBytes(buffer.slice(0, 5))) {
    return extractPdfText(buffer);
  }
  if (mime === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return extractPdfText(buffer);
  }
  if (mime === "image/jpeg" || mime === "image/jpg" || /\.jpe?g$/i.test(fileName)) {
    return extractImageText(buffer, "image/jpeg");
  }
  if (mime === "image/png" || /\.png$/i.test(fileName)) {
    return extractImageText(buffer, "image/png");
  }
  throw new Error(`Unsupported file type for extraction: ${fileName}`);
}

export interface LabeledChunk {
  label: string;
  fileName: string;
  text: string;
}

export async function extractManyFiles(
  files: { buffer: ArrayBuffer; fileName: string; mime: string }[],
  label: string
): Promise<LabeledChunk[]> {
  const out: LabeledChunk[] = [];
  for (const f of files) {
    const err = validateFileMeta(f.buffer.byteLength, f.fileName, f.mime);
    if (err) throw new Error(`${f.fileName}: ${err}`);
    const text = await extractTextFromUpload(f.buffer, f.fileName, f.mime);
    out.push({ label, fileName: f.fileName, text });
  }
  return out;
}

export function combineChunks(chunks: LabeledChunk[]): string {
  const parts: string[] = [];
  for (const c of chunks) {
    parts.push(`=== ${c.label} (${c.fileName}) ===\n${c.text || "[No extractable text]"}`);
  }
  return parts.join("\n\n");
}
