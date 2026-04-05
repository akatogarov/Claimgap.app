import type {
  ExtractedFacts,
  FullAnalysis,
  MissedMoney,
  PreviewAnalysis,
  PreviewGapArea,
} from "./types";

const HAIKU = "claude-haiku-4-5-20251001";
const SONNET = "claude-sonnet-4-6";

const UNKNOWN = "Unable to determine from provided documents";

function getKey(): string {
  const k = process.env.ANTHROPIC_API_KEY;
  if (!k) throw new Error("Missing ANTHROPIC_API_KEY");
  return k;
}

async function messagesCreate(body: Record<string, unknown>) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }
  return res.json() as Promise<{
    content: Array<{ type: string; text?: string }>;
  }>;
}

function extractFirstJsonObject(raw: string): string {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();

  const start = s.indexOf("{");
  if (start === -1) {
    throw new Error("Model response contained no JSON object");
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  throw new Error("Incomplete or invalid JSON object in model response");
}

function parseModelJson<T>(text: string): T {
  const jsonStr = extractFirstJsonObject(text);
  return JSON.parse(jsonStr) as T;
}

export function defaultExtractedFacts(): ExtractedFacts {
  return {
    insurer_name: UNKNOWN,
    policy_number: UNKNOWN,
    claimant_name: UNKNOWN,
    state: UNKNOWN,
    date_of_loss: UNKNOWN,
    claim_type: UNKNOWN,
    amount_offered_or_paid: UNKNOWN,
    denial_or_settlement_basis: UNKNOWN,
    coverage_limits: UNKNOWN,
    deductibles: UNKNOWN,
    exclusions_cited: UNKNOWN,
  };
}

/** Best-effort dollar parse for DB / benchmarks; 0 if unknown. */
export function parseOfferNumber(amountStr: string): number {
  const t = amountStr.trim();
  if (!t || t === UNKNOWN || /unable to determine/i.test(t)) return 0;
  const n = Number(String(t).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/* ─────────────────────────────────────────────────────────────────────
   PHASE 1: Extract structured facts from all document text
   ───────────────────────────────────────────────────────────────────── */

export async function runDocumentExtraction(combinedDocumentText: string): Promise<ExtractedFacts> {
  const userPrompt = `You read uploaded insurance documents (policy, letters, EOBs, bills, etc.).

First, extract the following. Use ONLY information that appears in the text below. If something is not stated clearly in the documents, use exactly this phrase for that field: "${UNKNOWN}"

Fields:
- insurer_name: The company that provides or pays the coverage (not the body shop or hospital unless they are the payer).
- policy_number
- claimant_name: The insured person or policyholder name if shown
- state: U.S. state tied to the policy or claim if stated
- date_of_loss or date of service (as written)
- claim_type: Short plain description (e.g. "wind damage to roof", "ER visit", "rear-end collision")
- amount_offered_or_paid: What the payer offered or paid, as a plain string including currency if given
- denial_or_settlement_basis: Why they denied or how they justified the payment
- coverage_limits: Main dollar limits that apply, as stated
- deductibles: Deductibles or member responsibility as stated
- exclusions_cited: Exclusions or carve-outs the payer relied on, if any

DOCUMENT TEXT:
${combinedDocumentText.slice(0, 180_000)}

Return ONLY valid JSON (no markdown):
{
  "insurer_name": "",
  "policy_number": "",
  "claimant_name": "",
  "state": "",
  "date_of_loss": "",
  "claim_type": "",
  "amount_offered_or_paid": "",
  "denial_or_settlement_basis": "",
  "coverage_limits": "",
  "deductibles": "",
  "exclusions_cited": ""
}`;

  const data = await messagesCreate({
    model: HAIKU,
    max_tokens: 2048,
    messages: [{ role: "user", content: userPrompt }],
  });
  const text = data.content.find((c) => c.type === "text")?.text ?? "{}";
  try {
    const parsed = parseModelJson<ExtractedFacts>(text);
    const d = defaultExtractedFacts();
    return { ...d, ...parsed };
  } catch {
    return defaultExtractedFacts();
  }
}

function mergeClarificationIntoExtracted(
  extracted: ExtractedFacts,
  answers: Record<string, string>
): ExtractedFacts {
  const next = { ...extracted };
  for (const [k, v] of Object.entries(answers)) {
    if (!v?.trim()) continue;
    if (k === "amount_offered_or_paid" || k === "offer_amount") {
      next.amount_offered_or_paid = v.trim();
    } else if (k === "state") next.state = v.trim();
    else if (k === "date_of_loss") next.date_of_loss = v.trim();
    else if (k === "policy_number") next.policy_number = v.trim();
    else if (k === "insurer_name") next.insurer_name = v.trim();
    else if (k in next) {
      (next as Record<string, string>)[k] = v.trim();
    }
  }
  return next;
}

export { mergeClarificationIntoExtracted };

/* ─────────────────────────────────────────────────────────────────────
   PHASE 2: Preview gap analysis (document-only; plain English)
   ───────────────────────────────────────────────────────────────────── */

function normalizePreviewAreas(raw: PreviewGapArea[], offerNum: number): PreviewGapArea[] {
  const defaultUpper = Math.max(100, Math.round(offerNum * 0.25) || 2500);
  const fallback = (i: number): PreviewGapArea => ({
    title: `Possible underpayment area ${i + 1}`,
    brief_explanation:
      "Your paperwork suggests the amount you were paid may not line up with every limit or rule shown in what you uploaded. The full report breaks down how to dispute it with a ready letter and evidence checklist.",
    estimated_gap_upper: defaultUpper,
    gap_anchor_label: `Up to ${formatUsd(defaultUpper)} (estimated)`,
  });

  const trimmed = raw?.length ? raw.filter((a) => a?.title?.trim()).slice(0, 3) : [];
  const list = trimmed.length ? trimmed : [];
  while (list.length < 2) list.push(fallback(list.length));
  if (list.length > 3) list.splice(3);

  return list.map((a) => {
    const upper =
      a.estimated_gap_upper > 0 ? a.estimated_gap_upper : Math.max(100, Math.round(offerNum * 0.28) || 2500);
    const label =
      a.gap_anchor_label?.trim() && a.gap_anchor_label.length > 4
        ? a.gap_anchor_label
        : `Up to ${formatUsd(upper)} (estimated)`;
    const brief =
      a.brief_explanation?.trim() ||
      a.why_may_be_wrong?.trim() ||
      "There may be a gap between what you were paid and what your paperwork suggests — details and next steps are in the paid report.";
    return {
      ...a,
      brief_explanation: brief,
      estimated_gap_upper: upper,
      gap_anchor_label: label,
    };
  });
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function runPreviewAnalysis(
  policyText: string,
  settlementText: string,
  optionalContext: string,
  insuranceType: string,
  extracted: ExtractedFacts,
  clarificationAnswers?: Record<string, string>
): Promise<PreviewAnalysis> {
  const merged = clarificationAnswers
    ? mergeClarificationIntoExtracted(extracted, clarificationAnswers)
    : extracted;
  const offerNum = parseOfferNumber(merged.amount_offered_or_paid);

  const userPrompt = `You are helping a user quickly understand if they are being underpaid.

Use ONLY the uploaded document text. Do not use outside knowledge about any company.

This is ONLY a preview — not the paid report. Give a teaser that creates urgency without handing them the full dispute playbook.

Include:
- 2 or 3 possible issues (not more than 3)
- Estimated total underpayment range (missed_amount_low and missed_amount_high as integers — conservative, plain dollars)
- brief_explanation per issue: exactly 1 sentence that names the issue area and signals why it matters, WITHOUT explaining the dispute strategy. Think of it as a teaser headline, not an explanation.

DO NOT include:
- How to dispute, argue, or challenge
- Policy quotes or clause citations
- "What to say" scripts, email text, or letter wording
- Step-by-step plans
- Checklists or evidence instructions
- Any strategic or legal guidance whatsoever

For each issue, only: title (plain English, under 10 words), brief_explanation (1 sentence, teaser only), estimated_gap_upper (integer, conservative), gap_anchor_label (e.g. "Up to $X (estimated)").

Goal: The user should think "I definitely have a problem and I need the full report to act on it." They must NOT be able to dispute without the paid report.

Extracted reference facts (may contain "${UNKNOWN}" — still rely on document text first):
${JSON.stringify(merged, null, 2)}

Claim category selected by user: ${insuranceType}

POLICY / PLAN DOCUMENT TEXT:
${policyText.slice(0, 120_000)}

PAYER LETTER / DENIAL / EOB / SETTLEMENT TEXT:
${settlementText.slice(0, 120_000)}

OTHER UPLOADED CONTEXT:
${optionalContext.slice(0, 60_000)}

TASK:
1. teaser_summary: one or two sentences, no dollar amounts.
2. missed_amount_low / missed_amount_high: overall range (integers). If amounts are unclear from documents, use conservative estimates and keep teaser_summary honest about uncertainty.
3. underpayment_areas: 2 or 3 objects only.
4. preview_areas: short titles matching each area (same count as underpayment_areas).

Return ONLY valid JSON:
{
  "teaser_summary": "",
  "missed_amount_low": 0,
  "missed_amount_high": 0,
  "preview_areas": ["", ""],
  "underpayment_areas": [
    {
      "title": "",
      "brief_explanation": "",
      "estimated_gap_upper": 0,
      "gap_anchor_label": ""
    }
  ]
}`;

  const data = await messagesCreate({
    model: HAIKU,
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
  });
  const text = data.content.find((c) => c.type === "text")?.text ?? "{}";
  const parsed = parseModelJson<{
    teaser_summary: string;
    missed_amount_low?: number;
    missed_amount_high?: number;
    preview_areas: string[];
    underpayment_areas: PreviewGapArea[];
  }>(text);

  const areas = normalizePreviewAreas(parsed.underpayment_areas ?? [], offerNum);
  const sumUpper = areas.reduce((s, a) => s + (a.estimated_gap_upper || 0), 0);
  const highFromModel = parsed.missed_amount_high || 0;
  const lowFromModel = parsed.missed_amount_low ?? 0;
  const maxGap = Math.max(
    highFromModel,
    sumUpper,
    ...areas.map((a) => a.estimated_gap_upper || 0),
    offerNum > 0 ? Math.round(offerNum * 0.35) : 2500
  );
  const minGap = Math.max(
    0,
    lowFromModel > 0
      ? Math.min(lowFromModel, maxGap)
      : Math.round(maxGap * 0.35)
  );

  const previewTitles = parsed.preview_areas?.filter(Boolean).length
    ? parsed.preview_areas.filter(Boolean).slice(0, 3)
    : areas.map((a) => a.title);

  return {
    teaser_summary:
      parsed.teaser_summary ||
      "Your uploaded paperwork suggests you may not have been paid everything the documents imply.",
    extracted: merged,
    underpayment_areas: areas,
    missed_amount_low: minGap,
    missed_amount_high: maxGap > 0 ? maxGap : 2500,
    preview_areas: previewTitles.length >= 2 ? previewTitles : areas.map((a) => a.title),
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Full analysis after payment
   ───────────────────────────────────────────────────────────────────── */

const FULL_REPORT_INSTRUCTION = `You are an insurance claim negotiation expert writing for a stressed homeowner or policyholder — NOT a lawyer.

The user paid for this report because they believe their insurer underpaid them. Your job is to help them actually recover money, not impress them with jargon.

Brand voice: knowledgeable friend. Direct, warm, plain English. No jargon without a plain-English explanation in parentheses immediately after.

Generate a FULL PAID REPORT in Markdown with these exact sections:

---

## 1. Executive Summary

- Total estimated underpayment range (clear $ numbers)
- 2–3 sentences explaining what happened in plain language (assume the user is smart but not an insurance expert)
- The single most important thing they should do first

---

## 2. Underpayment Areas

For each issue:

### [Issue title — plain English, e.g. "Roof damage valued below replacement cost"]

**What the insurer did:** One sentence, no jargon.

**Why this may be wrong:** Reference specific policy language only if it appears in the uploaded documents. If not found, say "Based on standard policy language — verify in your specific policy."

**Estimated financial impact:** Realistic dollar range.

**Strength of case: [Weak / Medium / Strong]**
In 2 sentences: explain what this rating means for THIS case specifically. If Medium or Developing, name one concrete thing the user could do to move it to Strong (e.g. "Get an independent contractor estimate — this alone often tips the balance").

---

## 3. Your Action Pipeline

Make this a clear step-by-step plan the user can follow starting today. Use plain timelines.

**This week (Days 1–3):**
- Exact action, who to contact, what to say or send

**Week 2 (Days 7–10):**
- Follow-up action with specific phone script or email template

**Week 3 (Day 14):**
- File complaint with state insurance regulator. Include the exact agency name for this state if known. Plain instruction: "Call [agency] at [number if known] or go to [typical URL format] and file online — it's free and insurers take these seriously."

**Week 4 (Day 21+):**
- If still unresolved: explain the appraisal clause in plain English ("this is like a tie-breaker process where each side picks an appraiser — costs $300–$1,500 but often results in higher payouts"), only if applicable to the claim type.

---

## 4. Dispute Letter

Write a complete, professional dispute letter ready to copy and send.

Requirements:
- Opening: date placeholder [DATE], claim number placeholder [CLAIM NUMBER], insurer address placeholder
- Reference specific policy language from the documents
- Firm but not emotional tone
- Explicitly state the amount you believe is owed
- Close by requesting a written response within 15 business days

At the end of the letter, include an Enclosures section listing each supporting document. For documents not yet obtained, write [TO OBTAIN: where to get it]. Example:
Enclosures:
1. Independent contractor estimate [TO OBTAIN: get quotes from 2–3 licensed contractors]
2. Weather verification report [TO OBTAIN: order at HailTrace.com or NOAA storm events database]
3. Photos of damage — [already have / TO OBTAIN: photograph before any repairs]

Length: 250–350 words.

---

## 5. Evidence Checklist

This is the most important practical section. For each piece of evidence:

□ **[Document name]**
  - *What it is:* One plain-English sentence.
  - *Where to get it:* Exact source — website, phone number, service name (e.g. "HailTrace.com for $29", "Call your contractor and ask for a line-item estimate", "Download from your insurer's online portal").
  - *Cost and time:* e.g. "Free, same day" or "$29, delivered by email in 24 hours"
  - *What a useful version looks like:* e.g. "Should include your address, date of loss, specific damage items, and replacement costs — not just a total number"

---

## 6. State-Specific Rights

If state is known from documents:
- Include the most relevant consumer protection rights (plain English, not legal citations unless you're certain)
- Name the state insurance commissioner's office and how to file a complaint (this is free and effective)
- If unsure about specific laws, say "These rights typically apply in most states — verify at your state's Department of Insurance website"

Do NOT fabricate statute numbers or dollar amounts.

---

## 7. FAQ — Plain Language

Write every answer as if texting a stressed friend. No legal language without an explanation.

**"What do I do this week, step by step?"**
Concrete 3–4 sentence answer.

**"I sent the letter — they haven't responded. Now what?"**
Concrete 3–4 sentence answer. Include the state complaint option as leverage.

**"They denied me again. What are my real options?"**
Concrete 3–4 sentence answer. Mention appraisal clause and hiring a public adjuster in plain terms.

**"Is it worth hiring a lawyer or public adjuster?"**
Honest answer: when it makes sense, when it doesn't, rough cost (public adjusters typically take 10–15% of any additional recovery).

**"What happens if I do nothing?"**
Be direct: most underpayments stay uncollected. Statute of limitations (typically 1–3 years depending on state and claim type). One plain sentence about what they'd be leaving on the table.

---

Tone throughout:
- Plain English always
- Practical, not preachy
- Never say "it is important to note" or "please be advised"
- No AI filler phrases
- This report must feel like something a human expert would charge $300 for

Rules:
- Use plain English. Quote policy/plan text only when it appears in the documents. If something is missing, say "${UNKNOWN}" for that part.
- Never invent claim numbers, dates, or dollar amounts not grounded in the text.
- Informational only — not legal advice.
- When documents are thin, say so and stay conservative with numbers.`;

type FullReportJson = {
  report_markdown: string;
  missed_money: MissedMoney;
  counter_offer_letter?: FullAnalysis["counter_offer_letter"];
  escalation_plan?: FullAnalysis["escalation_plan"];
};

export async function runFullAnalysis(
  policyText: string,
  settlementText: string,
  optionalContext: string,
  extracted: ExtractedFacts,
  offerAmount: number
): Promise<FullAnalysis> {
  const system = `You are an insurance claim negotiation expert. Follow the user's instructions precisely. Output valid JSON only.`;

  const user = `${FULL_REPORT_INSTRUCTION}

---

DOCUMENTS (use ONLY these; verify extracted facts against them):

Extracted facts (reference — verify against documents):
${JSON.stringify(extracted, null, 2)}

Reference paid amount (from extraction or 0 if unknown): ${offerAmount}

POLICY / PLAN:
${policyText.slice(0, 200_000)}

PAYER LETTER / DENIAL / EOB / SETTLEMENT:
${settlementText.slice(0, 200_000)}

OTHER DOCUMENTS:
${optionalContext.slice(0, 80_000)}

---

OUTPUT: Return ONLY valid JSON (no markdown fences). The JSON must include:

1) "report_markdown": A single string containing the FULL report in Markdown exactly as specified above. Escape newlines as \\n inside the JSON string.

2) "missed_money": {
     "total_payout_received": number (use ${offerAmount} if documents support it),
     "expected_payout": number,
     "missed_amount_low": number,
     "missed_amount_high": number,
     "strength_of_case": "Strong" | "Medium" | "Developing",
     "reasons": string[] (short bullets for the summary UI)
   }

3) "counter_offer_letter": { "subject": "", "body": "" } — MUST be the same letter as in section 4 of report_markdown (for copy buttons).

4) "escalation_plan": {
     "day_1": string (matches Day 1 in section 3),
     "day_7": string,
     "day_14": string,
     "day_21": string,
     "commissioner_template": string (short complaint draft)
   }

5) "disclaimer": "Informational only; not legal advice."`;

  const data = await messagesCreate({
    model: SONNET,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text = data.content.find((c) => c.type === "text")?.text ?? "{}";

  let parsed: FullReportJson;
  try {
    parsed = parseModelJson<FullReportJson>(text);
  } catch {
    throw new Error("Full analysis model returned JSON that could not be parsed");
  }

  if (!parsed.report_markdown?.trim()) {
    throw new Error("Full analysis missing report_markdown");
  }

  const mm = parsed.missed_money;
  const gapMin = mm?.missed_amount_low ?? 0;
  const gapMax = mm?.missed_amount_high ?? 0;
  const baseOffer = offerAmount > 0 ? offerAmount : Math.max(100, Math.round((gapMax || gapMin || 5000) * 0.5));

  const strength = mm?.strength_of_case;
  const strengthOk = strength === "Strong" || strength === "Medium" || strength === "Developing";

  const missed_money: MissedMoney = {
    total_payout_received: mm?.total_payout_received ?? offerAmount,
    expected_payout:
      mm?.expected_payout ?? (offerAmount + (gapMax > 0 ? Math.round(gapMax * 0.5) : Math.round(baseOffer * 0.2))),
    missed_amount_low: mm?.missed_amount_low || gapMin || Math.round(baseOffer * 0.12),
    missed_amount_high: mm?.missed_amount_high || gapMax || Math.round(baseOffer * 0.35),
    strength_of_case: strengthOk ? strength! : "Medium",
    reasons: mm?.reasons?.length
      ? mm.reasons
      : ["See the full report below for plain-English reasons tied to your documents."],
  };

  const esc = parsed.escalation_plan;
  const escalation_plan = {
    day_1: esc?.day_1 ?? "",
    day_7: esc?.day_7 ?? "",
    day_14: esc?.day_14 ?? "",
    day_21: esc?.day_21 ?? "",
    commissioner_template: esc?.commissioner_template ?? "",
  };

  const counter = parsed.counter_offer_letter ?? { subject: "", body: "" };

  const map = { Strong: 8, Medium: 6, Developing: 4 } as const;
  const s = missed_money.strength_of_case;
  const score = s === "Strong" || s === "Medium" || s === "Developing" ? map[s] : 6;

  const result: FullAnalysis = {
    report_markdown: parsed.report_markdown.trim(),
    missed_money,
    policy_coverage: {
      summary: "See the full report below for policy summary and citations.",
      key_provisions: [],
      relevant_quotes: [],
    },
    gap_analysis: {
      summary: "",
      underpayment_areas: [],
      estimated_gap_min: missed_money.missed_amount_low,
      estimated_gap_max: missed_money.missed_amount_high,
    },
    probability_score: {
      score,
      reasoning:
        "This score reflects how clearly your uploaded documents support a mistake or oversight by the payer — not your chance of winning a dispute.",
      confidence: "medium",
    },
    counter_offer_letter: counter,
    escalation_plan,
    disclaimer: "Informational only; not legal advice.",
  };

  return result;
}
