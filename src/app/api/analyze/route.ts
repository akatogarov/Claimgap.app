import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";
import {
  runDocumentExtraction,
  runPreviewAnalysis,
  parseOfferNumber,
  mergeClarificationIntoExtracted,
} from "@/lib/anthropic";
import { buildClarificationQuestions, needsCriticalClarification } from "@/lib/clarification";
import {
  combineChunks,
  extractManyFiles,
  type LabeledChunk,
} from "@/lib/document-ingest";
import { getBlobFromFormEntry } from "@/lib/pdf-validate";
import type { InsuranceType, StoredAnalysis } from "@/lib/types";

export const runtime = "edge";

const MAX_STORE = 400_000;

type SlotDef = { key: string; label: string; required: boolean };

function slotsForType(t: InsuranceType): SlotDef[] {
  switch (t) {
    case "Home":
      return [
        { key: "policy", label: "Policy", required: true },
        { key: "insurer_letter", label: "Insurer letter", required: true },
        { key: "optional_contractor", label: "Contractor estimate (optional)", required: false },
        { key: "optional_photos", label: "Photos / other (optional)", required: false },
      ];
    case "Auto":
      return [
        { key: "policy", label: "Policy", required: true },
        { key: "settlement_letter", label: "Settlement letter", required: true },
        { key: "optional_dealer", label: "Dealer appraisal (optional)", required: false },
        { key: "optional_repair", label: "Repair estimates (optional)", required: false },
        { key: "optional_vehicle_photos", label: "Vehicle photos (optional)", required: false },
        { key: "optional_other", label: "Other (optional)", required: false },
      ];
    case "Health":
      return [
        { key: "policy_or_card", label: "Policy / insurance card", required: true },
        { key: "denial_or_eob", label: "Denial letter or EOB", required: true },
        { key: "optional_doctor", label: "Doctor letter (optional)", required: false },
        { key: "optional_records", label: "Medical records (optional)", required: false },
        { key: "optional_itemized", label: "Itemized bill (optional)", required: false },
        { key: "optional_other", label: "Other (optional)", required: false },
      ];
    default:
      return [];
  }
}

function getFileList(form: FormData, key: string): { blob: Blob; fileName: string }[] {
  const entries = form.getAll(key);
  const out: { blob: Blob; fileName: string }[] = [];
  for (const e of entries) {
    const got = getBlobFromFormEntry(e);
    if (got) out.push(got);
  }
  return out;
}

async function blobsToChunks(
  files: { blob: Blob; fileName: string }[],
  label: string
): Promise<LabeledChunk[]> {
  const prepared: { buffer: ArrayBuffer; fileName: string; mime: string }[] = [];
  for (const f of files) {
    const buf = await f.blob.arrayBuffer();
    const mime = f.blob.type || "";
    prepared.push({ buffer: buf, fileName: f.fileName || "upload", mime });
  }
  return extractManyFiles(prepared, label);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const insurance_type = String(form.get("insurance_type") ?? "") as InsuranceType;
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const clarificationRaw = form.get("clarification_answers");
    let clarificationAnswers: Record<string, string> | undefined;
    if (typeof clarificationRaw === "string" && clarificationRaw.trim()) {
      try {
        clarificationAnswers = JSON.parse(clarificationRaw) as Record<string, string>;
      } catch {
        return NextResponse.json({ error: "Invalid clarification data.", code: "bad_clarification" }, { status: 400 });
      }
    }

    if (!["Auto", "Home", "Health"].includes(insurance_type)) {
      return NextResponse.json({ error: "Invalid insurance type.", code: "invalid_insurance_type" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address.", code: "invalid_email" }, { status: 400 });
    }

    const slots = slotsForType(insurance_type);
    const slotChunks: LabeledChunk[] = [];

    for (const s of slots) {
      const files = getFileList(form, s.key);
      if (s.required && files.length === 0) {
        return NextResponse.json(
          { error: `Missing required upload: ${s.label}.`, code: "missing_slot", slot: s.key },
          { status: 400 }
        );
      }
      if (files.length === 0) continue;
      const chunks = await blobsToChunks(files, s.label);
      slotChunks.push(...chunks);
    }

    const combined = combineChunks(slotChunks);
    if (combined.length < 80) {
      return NextResponse.json(
        {
          error:
            "We could not read enough text from your uploads. Try clearer PDFs or photos, or remove password protection.",
          code: "insufficient_text",
        },
        { status: 400 }
      );
    }

    const POLICY_LABELS =
      insurance_type === "Health" ? new Set(["Policy / insurance card"]) : new Set(["Policy"]);
    const LETTER_LABELS = new Set(
      insurance_type === "Home"
        ? ["Insurer letter"]
        : insurance_type === "Auto"
          ? ["Settlement letter"]
          : ["Denial letter or EOB"]
    );

    const policy_text = slotChunks
      .filter((c) => POLICY_LABELS.has(c.label))
      .map((c) => `=== ${c.label} (${c.fileName}) ===\n${c.text}`)
      .join("\n\n")
      .slice(0, MAX_STORE);

    const settlement_text = slotChunks
      .filter((c) => LETTER_LABELS.has(c.label))
      .map((c) => `=== ${c.label} (${c.fileName}) ===\n${c.text}`)
      .join("\n\n")
      .slice(0, MAX_STORE);

    const optional_context = slotChunks
      .filter((c) => !POLICY_LABELS.has(c.label) && !LETTER_LABELS.has(c.label))
      .map((c) => `=== ${c.label} (${c.fileName}) ===\n${c.text}`)
      .join("\n\n")
      .slice(0, MAX_STORE);

    let policyTextFinal = policy_text.length >= 40 ? policy_text : combined.slice(0, MAX_STORE / 2);
    let settlementTextFinal = settlement_text.length >= 40 ? settlement_text : combined.slice(MAX_STORE / 2, MAX_STORE);
    let optionalFinal = optional_context;
    if (policy_text.length < 40 || settlement_text.length < 40) {
      policyTextFinal = combined.slice(0, Math.floor(combined.length / 2)).slice(0, MAX_STORE);
      settlementTextFinal = combined.slice(Math.floor(combined.length / 2)).slice(0, MAX_STORE);
      optionalFinal = "";
    }

    let extracted = await runDocumentExtraction(combined.slice(0, MAX_STORE));
    if (clarificationAnswers && Object.keys(clarificationAnswers).length > 0) {
      extracted = mergeClarificationIntoExtracted(extracted, clarificationAnswers);
    }
    const questions = buildClarificationQuestions(extracted);

    const criticalNeed = needsCriticalClarification(questions);
    const hasAnswers = clarificationAnswers && Object.keys(clarificationAnswers).length > 0;

    if (criticalNeed && !hasAnswers) {
      const partial: StoredAnalysis = {
        preview: null,
        full: null,
        extracted: {
          policy_text: policyTextFinal,
          settlement_text: settlementTextFinal,
          optional_context: optionalFinal,
        },
        extracted_facts: extracted,
        clarification: { pending: true, questions },
      };

      const supabase = getServiceSupabase();
      const offer_amount = parseOfferNumber(extracted.amount_offered_or_paid) || null;
      const { data, error } = await supabase
        .from("claims")
        .insert({
          email,
          insurance_type,
          insurer: extracted.insurer_name || "Unable to determine from provided documents",
          state: extracted.state || "Unable to determine from provided documents",
          description: `Awaiting clarification. Claim type: ${insurance_type}`,
          offer_amount,
          status: "awaiting_clarification",
          analysis: partial as unknown as Record<string, unknown>,
        })
        .select("id")
        .single();

      if (error || !data?.id) {
        console.error("Supabase claims insert:", error);
        return NextResponse.json({ error: "Could not save your claim. Please try again.", code: "db_insert_failed" }, { status: 500 });
      }

      return NextResponse.json({
        id: data.id,
        needs_clarification: true,
        questions,
      });
    }

    const preview = await runPreviewAnalysis(
      policyTextFinal,
      settlementTextFinal,
      optionalFinal,
      insurance_type,
      extracted,
      clarificationAnswers
    );

    const offerNum =
      parseOfferNumber(preview.extracted.amount_offered_or_paid) ||
      parseOfferNumber(extracted.amount_offered_or_paid) ||
      Math.max(100, Math.round(preview.missed_amount_high * 0.4));

    const analysis: StoredAnalysis = {
      preview,
      full: null,
      extracted: {
        policy_text: policyTextFinal,
        settlement_text: settlementTextFinal,
        optional_context: optionalFinal,
      },
      extracted_facts: preview.extracted,
    };

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("claims")
      .insert({
        email,
        insurance_type,
        insurer: preview.extracted.insurer_name || "Unable to determine from provided documents",
        state: preview.extracted.state || "Unable to determine from provided documents",
        description: preview.teaser_summary.slice(0, 2000),
        offer_amount: offerNum,
        status: "preview",
        analysis: analysis as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("Supabase claims insert:", error);
      return NextResponse.json({ error: "Could not save your claim. Please try again.", code: "db_insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, needs_clarification: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed." },
      { status: 500 }
    );
  }
}
