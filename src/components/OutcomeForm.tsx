"use client";

import { useState } from "react";
import { LoadingButton } from "./LoadingButton";

export function OutcomeForm({ claimId }: { claimId: string }) {
  const [result, setResult] = useState<"yes" | "no" | "negotiating" | null>(null);
  const [additional, setAdditional] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!result) {
      setError("Please select an option.");
      return;
    }
    if (result === "yes") {
      const n = Number(additional);
      if (!Number.isFinite(n) || n < 0) {
        setError("Enter a valid dollar amount.");
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/outcome", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          claim_id: claimId,
          result,
          additional_amount: result === "yes" ? Number(additional) : null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Could not save.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="mt-8 rounded-lg border border-teal-700/20 bg-teal-50/90 px-4 py-3 text-teal-950">
        Thank you — your response was recorded.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      <div className="space-y-3">
        <p className="font-medium text-ink">Did you get more money?</p>
        <div className="flex flex-col gap-2">
          {(
            [
              ["yes", "Yes"],
              ["no", "No"],
              ["negotiating", "Still negotiating"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setResult(v)}
              className={`rounded-lg border-2 px-4 py-3 text-left font-medium transition ${
                result === v
                  ? "border-navy bg-navy text-white"
                  : "border-navy/15 bg-white text-navy hover:border-navy/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {result === "yes" && (
        <div>
          <label htmlFor="add" className="block text-sm font-semibold text-ink">
            How much additional did you receive? ($)
          </label>
          <input
            id="add"
            inputMode="decimal"
            className="mt-2 w-full rounded-lg border border-navy/15 px-4 py-3 text-ink outline-none ring-navy focus:ring-2"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
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
