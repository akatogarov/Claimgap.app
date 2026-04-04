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

/**
 * PDF text: try pdf-parse on Node (often better on tricky PDFs), then unpdf.
 * pdf-parse is loaded with `webpackIgnore` so Edge bundles skip it (no `fs`); on Cloudflare the import fails and we use unpdf only.
 */
async function extractPdfWithNodeParse(buffer: ArrayBuffer): Promise<string | null> {
  try {
    const { default: pdfParse } = await import(/* webpackIgnore: true */ "pdf-parse");
    const Buf = typeof Buffer !== "undefined" ? Buffer : null;
    if (!Buf || typeof pdfParse !== "function") return null;
    const data = await pdfParse(Buf.from(buffer));
    const t = (data?.text ?? "").trim();
    return t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const viaNode = await extractPdfWithNodeParse(buffer);
  if (viaNode) return viaNode;
  const { text } = await unpdfExtract(new Uint8Array(buffer), { mergePages: true });
  return (text ?? "").trim();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function extractImageText(buffer: ArrayBuffer, mediaType: "image/jpeg" | "image/png"): Promise<string> {
  return extractTextFromImage(arrayBufferToBase64(buffer), mediaType);
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
