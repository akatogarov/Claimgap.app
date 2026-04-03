/** Client-side: quick check before upload (first 5 bytes of the file). */
export async function verifyPdfBlob(blob: Blob): Promise<boolean> {
  if (blob.size < 5) return false;
  const buf = await blob.slice(0, 5).arrayBuffer();
  return isPdfMagicBytes(buf);
}

/** First bytes of a valid PDF file (%PDF). */
export function isPdfMagicBytes(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 5) return false;
  const u = new Uint8Array(buf);
  return u[0] === 0x25 && u[1] === 0x50 && u[2] === 0x44 && u[3] === 0x46;
}

/** Browsers often omit MIME or send application/octet-stream for PDFs (esp. Windows). */
export function getBlobFromFormEntry(entry: FormDataEntryValue | null): { blob: Blob; fileName: string } | null {
  if (entry == null) return null;

  if (typeof Blob !== "undefined" && entry instanceof Blob) {
    if (entry.size <= 0) return null;
    const fileName =
      entry instanceof File && typeof entry.name === "string" && entry.name.length > 0 ? entry.name : "";
    return { blob: entry, fileName };
  }

  // Fallback: some runtimes return a File-like object that fails instanceof Blob (cross-realm).
  const duck = entry as { size?: number; arrayBuffer?: () => Promise<ArrayBuffer>; name?: string };
  if (typeof duck.arrayBuffer === "function" && typeof duck.size === "number" && duck.size > 0) {
    return {
      blob: entry as Blob,
      fileName: typeof duck.name === "string" && duck.name.length > 0 ? duck.name : "",
    };
  }

  return null;
}
