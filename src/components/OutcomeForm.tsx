"use client";

import { useEffect, useState } from "react";
import { LoadingButton } from "./LoadingButton";

type Step = "letter" | "result" | null;

// Step 1 options
const LETTER_OPTIONS = [
  { value: "step1_sent", label: "Yes, I sent it", icon: "✓" },
  { value: "step1_pending", label: "Not yet — still working on it", icon: "○" },
  { value: "step1_dropped", label: "I decided not to dispute", icon: "✕" },
] as const;

// Step 2 options
const RESULT_OPTIONS = [
  { value: "step2_won", label: "The insurer offered more money", icon: "💰" },
  { value: "step2_waiting", label: "Still waiting for their response", icon: "⏳" },
  { value: "step2_denied", label: "They denied or refused", icon: "✕" },
  { value: "step2_no_action", label: "I never ended up sending the letter", icon: "—" },
] as const;

type LetterValue = (typeof LETTER_OPTIONS)[number]["value"];
type ResultValue = (typeof RESULT_OPTIONS)[number]["value"];
type AnyValue = LetterValue | ResultValue | "yes" | "no" | "negotiating";

function isLetterValue(v: string): v is LetterValue {
  return LETTER_OPTIONS.some((o) => o.value === v);
}
function isResultValue(v: string): v is ResultValue {
  return RESULT_OPTIONS.some((o) => o.value === v);
}

async function saveOutcome(claimId: string, result: string, additionalAmount?: number) {
  const res = await fetch("/api/outcome", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      claim_id: claimId,
      result,
      additional_amount: additionalAmount ?? null,
    }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? "Could not save.");
  }
}

export function OutcomeForm({
  claimId,
  step,
  answer,
}: {
  claimId: string;
  step?: string;
  answer?: string;
}) {
  const activeStep: Step =
    step === "letter" ? "letter" : step === "result" ? "result" : null;

  const [selected, setSelected] = useState<AnyValue | null>(null);
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-submit when answer arrives via email link
  useEffect(() => {
    if (!answer || !activeStep || done) return;
    const value =
      activeStep === "letter" && isLetterValue(answer)
        ? answer
        : activeStep === "result" && isResultValue(answer)
          ? answer
          : null;
    if (!value) return;
    setLoading(true);
    saveOutcome(claimId, value)
      .then(() => setDone(true))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed."))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    if (!selected) {
      setError("Please select an option.");
      return;
    }
    if (selected === "step2_won") {
      const n = Number(additionalAmount);
      if (!Number.isFinite(n) || n < 0) {
        setError("Enter a valid dollar amount.");
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const amt = selected === "step2_won" ? Number(additionalAmount) : undefined;
      await saveOutcome(claimId, selected, amt);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !selected) {
    return (
      <div className="mt-10 flex items-center gap-3 text-ink-muted">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        Recording your response…
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-8 rounded-lg border border-teal-700/20 bg-teal-50/90 px-5 py-4">
        <p className="font-semibold text-teal-900">Thank you — your response was recorded.</p>
        <p className="mt-1 text-sm text-teal-800">
          Your feedback helps us improve ClaimGap for everyone.
        </p>
      </div>
    );
  }

  // Step 1: letter sent?
  if (activeStep === "letter" || activeStep === null) {
    return (
      <div className="mt-10 space-y-8">
        <div className="space-y-3">
          <p className="font-semibold text-ink">Did you send the dispute letter?</p>
          <div className="flex flex-col gap-2">
            {LETTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left font-medium transition ${
                  selected === opt.value
                    ? "border-navy bg-navy text-white"
                    : "border-navy/15 bg-white text-navy hover:border-navy/30"
                }`}
              >
                <span className="w-5 shrink-0 text-center text-sm">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">
            {error}
          </div>
        )}

        {activeStep === "letter" && (
          <LoadingButton
            type="button"
            loading={loading}
            onClick={submit}
            className="w-full bg-navy py-4 text-white hover:bg-navy-800 sm:w-auto sm:px-10"
          >
            Submit
          </LoadingButton>
        )}

        {/* If no specific step, show both steps (direct visit to outcome page) */}
        {activeStep === null && (
          <>
            <div className="border-t border-navy/10 pt-6">
              <p className="font-semibold text-ink">What happened with your dispute?</p>
              <p className="mt-1 text-sm text-ink-muted">Skip if you haven&apos;t heard back yet.</p>
              <div className="mt-3 flex flex-col gap-2">
                {RESULT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelected(opt.value)}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left font-medium transition ${
                      selected === opt.value
                        ? "border-navy bg-navy text-white"
                        : "border-navy/15 bg-white text-navy hover:border-navy/30"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-center text-sm">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {selected === "step2_won" && (
              <div>
                <label htmlFor="add" className="block text-sm font-semibold text-ink">
                  How much additional did you receive? ($)
                </label>
                <input
                  id="add"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-lg border border-navy/15 px-4 py-3 text-ink outline-none ring-navy focus:ring-2"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">
                {error}
              </div>
            )}

            <LoadingButton
              type="button"
              loading={loading}
              onClick={submit}
              className="w-full bg-navy py-4 text-white hover:bg-navy-800 sm:w-auto sm:px-10"
            >
              Submit
            </LoadingButton>
          </>
        )}
      </div>
    );
  }

  // Step 2: what was the result?
  return (
    <div className="mt-10 space-y-8">
      <div className="space-y-3">
        <p className="font-semibold text-ink">What happened with your dispute?</p>
        <div className="flex flex-col gap-2">
          {RESULT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left font-medium transition ${
                selected === opt.value
                  ? "border-navy bg-navy text-white"
                  : "border-navy/15 bg-white text-navy hover:border-navy/30"
              }`}
            >
              <span className="w-5 shrink-0 text-center text-sm">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {selected === "step2_won" && (
        <div>
          <label htmlFor="add" className="block text-sm font-semibold text-ink">
            How much additional did you receive? ($)
          </label>
          <input
            id="add"
            inputMode="decimal"
            className="mt-2 w-full rounded-lg border border-navy/15 px-4 py-3 text-ink outline-none ring-navy focus:ring-2"
            value={additionalAmount}
            onChange={(e) => setAdditionalAmount(e.target.value)}
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">
          {error}
        </div>
      )}

      <LoadingButton
        type="button"
        loading={loading}
        onClick={submit}
        className="w-full bg-navy py-4 text-white hover:bg-navy-800 sm:w-auto sm:px-10"
      >
        Submit
      </LoadingButton>
    </div>
  );
}
