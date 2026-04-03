/**
 * OCR-style text extraction from images using Claude Vision (Haiku).
 */

function getKey(): string {
  const k = process.env.ANTHROPIC_API_KEY;
  if (!k) throw new Error("Missing ANTHROPIC_API_KEY");
  return k;
}

export async function extractTextFromImage(
  base64: string,
  mediaType: "image/jpeg" | "image/png"
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Extract every word of readable text from this image (policy pages, letters, forms, EOBs, etc.).
Return plain text only. Preserve approximate line breaks. If there is no readable text, reply exactly: NO_TEXT_FOUND.`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vision OCR failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
  if (/^NO_TEXT_FOUND\.?$/i.test(text)) return "";
  return text;
}
