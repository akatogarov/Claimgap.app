"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingButton } from "./LoadingButton";
import type { ClarificationQuestion, PreviewGapArea } from "@/lib/types";

type PreviewPayload = {
  id: string;
  status: string;
  insurance_type?: string;
  insurer?: string;
  offer_amount?: number | null;
  clarification?: { pending: boolean; questions: ClarificationQuestion[] } | null;
  preview: {
    teaser_summary: string;
    underpayment_areas?: PreviewGapArea[];
    preview_areas?: string[];
    missed_amount_low?: number;
    missed_amount_high?: number;
    extracted?: {
      insurer_name?: string;
      amount_offered_or_paid?: string;
    };
  } | null;
};

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PreviewClient({ claimId }: { claimId: string }) {
  const [data, setData] = useState<PreviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyErr, setClarifyErr] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/claim/${claimId}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j.error ?? "Failed to load preview.");
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((j) => { if (j.admin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  async function pay() {
    setPayLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ claim_id: claimId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Could not start checkout.");
      if (j.url) window.location.href = j.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setPayLoading(false);
    }
  }

  async function testPay() {
    setPayLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/test-payment/${claimId}`, { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Test payment failed.");
      window.location.href = `/result/${claimId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test payment failed.");
    } finally {
      setPayLoading(false);
    }
  }

  async function submitClarification() {
    setClarifyLoading(true);
    setClarifyErr(null);
    try {
      const res = await fetch(`/api/claim/${claimId}/clarify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Could not save answers.");
      const refresh = await fetch(`/api/claim/${claimId}`);
      const payload = await refresh.json();
      if (!refresh.ok) throw new Error(payload.error ?? "Failed to reload.");
      setData(payload);
    } catch (e) {
      setClarifyErr(e instanceof Error ? e.message : "Failed.");
    } finally {
      setClarifyLoading(false);
    }
  }

  if (error && !data) {
    return (
      <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-rust">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-3 py-12 justify-center text-ink-muted">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        Loading your results…
      </div>
    );
  }

  if (data.status === "awaiting_clarification" && data.clarification?.questions?.length) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-lg border border-amber-500/30 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">A few details were not clear from the uploads alone.</p>
          <p className="mt-1 text-amber-900/90">
            Your answers below matter for dollar estimates and for naming the right state contact. This usually takes under a minute.
          </p>
        </div>
        <div className="space-y-4">
          {data.clarification.questions.map((q) => (
            <div key={q.id}>
              <label htmlFor={q.id} className="block text-sm font-semibold text-ink">
                {q.question}
                {q.critical && <span className="text-rust"> *</span>}
              </label>
              <input
                id={q.id}
                className="mt-2 w-full rounded-lg border border-navy/15 px-4 py-3 text-ink outline-none ring-navy focus:ring-2"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        {clarifyErr && (
          <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">{clarifyErr}</div>
        )}
        <LoadingButton
          type="button"
          loading={clarifyLoading}
          onClick={submitClarification}
          className="w-full bg-navy py-4 text-base font-semibold text-white hover:bg-navy-800 sm:w-auto sm:px-10"
        >
          Continue to my preview
        </LoadingButton>
      </div>
    );
  }

  const areas = data.preview?.underpayment_areas?.length
    ? data.preview.underpayment_areas
    : [];
  const titles =
    data.preview?.preview_areas?.length === 3
      ? data.preview.preview_areas
      : areas.map((a) => a.title);

  const gapLow = data.preview?.missed_amount_low ?? 0;
  const gapHigh = data.preview?.missed_amount_high ?? 0;

  function previewBlurb(area: PreviewGapArea): string {
    if (area.brief_explanation?.trim()) return area.brief_explanation.trim();
    if (area.why_may_be_wrong?.trim()) return area.why_may_be_wrong.trim();
    return "There may be a gap between what you were paid and what your paperwork suggests.";
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-start gap-4 border-l-4 border-rust bg-rust-faint px-5 py-4">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-rust" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
        </svg>
        <div>
          <p className="font-display text-lg font-medium text-ink">
            {titles.length} possible underpayment area{titles.length !== 1 ? "s" : ""} in your documents
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {data.preview?.teaser_summary ??
              "You may have been paid less than your paperwork supports. The preview below is a quick read — the paid report is built to help you recover money."}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.offer_amount != null && data.offer_amount > 0 && (
            <div className="rounded border border-navy/10 bg-paper p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Amount recorded from documents</p>
              <p className="mt-1 font-display text-2xl font-medium text-ink">{usd(data.offer_amount)}</p>
              <p className="mt-1 text-xs text-ink-faint">From your uploads or follow-up answers — not typed in manually on the form.</p>
            </div>
          )}
          <div
            className={`rounded border border-rust/30 bg-rust-faint p-4 ${!(data.offer_amount && data.offer_amount > 0) ? "sm:col-span-2" : ""}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rust">Estimated underpayment range</p>
            <p className="mt-1 font-display text-2xl font-medium text-rust">
              {gapHigh > 0 ? `${usd(gapLow)} – ${usd(gapHigh)}` : "See details below"}
            </p>
            <p className="mt-1 text-xs text-rust/90">Conservative estimate from your uploads — not a guarantee.</p>
          </div>
        </div>

        <div className="mb-4 space-y-4">
          {areas.length === 0 && titles.length > 0 && (
            <ul className="space-y-2 text-left">
              {titles.map((t, i) => (
                <li key={i} className="flex items-center gap-3 border border-rust/15 bg-white px-4 py-3 text-sm font-medium text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-rust/25 bg-rust-faint text-xs font-semibold text-rust">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          )}
          {areas.map((area, i) => (
            <div key={i} className="rounded-lg border border-rust/15 bg-white p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-rust">{area.title || titles[i] || `Area ${i + 1}`}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{previewBlurb(area)}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-2 overflow-hidden rounded border border-navy/10 bg-paper">
          <div className="select-none space-y-2 p-4" style={{ filter: "blur(5px)" }}>
            <div className="border border-navy/10 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-navy">Full policy citations</p>
              <p className="mt-0.5 text-xs text-ink-muted">Unlock for line-by-line arguments and dollar math...</p>
            </div>
            <div className="border border-teal-700/20 bg-teal-50/80 px-4 py-3">
              <p className="text-sm font-semibold text-teal-900">Ready-to-send letter</p>
              <p className="mt-0.5 text-xs text-teal-800">Included in paid report...</p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper via-paper/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-5 pt-10">
            <div className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-lift">
              Full detail locked
            </div>
            <p className="mt-2 text-xs text-ink-faint">Letter draft · Escalation steps · Complaint template</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy/15 bg-white p-6 shadow-lift">
        <p className="mb-4 text-sm leading-relaxed text-ink">
          You&apos;ve already seen where you may be underpaid. Now get the execution package:
        </p>
        <ul className="mb-6 space-y-2 text-sm text-ink">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-700" aria-hidden>
              ✔
            </span>
            <span>A ready-to-send dispute letter</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-700" aria-hidden>
              ✔
            </span>
            <span>Step-by-step plan to recover your money</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-700" aria-hidden>
              ✔
            </span>
            <span>Exact documents and evidence to prove your case</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-teal-700" aria-hidden>
              ✔
            </span>
            <span>State-specific leverage (laws and regulators, where we can identify them)</span>
          </li>
        </ul>
        <p className="mb-6 text-sm font-medium text-navy">
          Many users who move forward are disputing gaps in the{" "}
          <span className="whitespace-nowrap">$2,000–$6,000</span> range — your case depends on your documents.
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-faint">Full report</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-5xl font-medium text-navy">$149</span>
              <span className="text-sm text-ink-muted">once</span>
            </div>
            <p className="mt-1 text-sm text-ink-muted">One-time · If your report doesn&apos;t identify a real gap, email us and we refund in full within 30 days.</p>
          </div>
          <div className="flex flex-col gap-2">
            <LoadingButton
              onClick={pay}
              loading={payLoading}
              className="bg-navy px-10 py-4 text-base font-semibold text-white hover:bg-navy-800"
            >
              Get my full report — $149
            </LoadingButton>
            <p className="text-center text-xs text-ink-faint">Secure Stripe checkout · 30-day refund</p>
            {isAdmin && (
              <LoadingButton
                onClick={testPay}
                loading={payLoading}
                className="mt-1 border border-amber-400 bg-amber-50 px-6 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                [Admin] Skip Payment — Test Mode
              </LoadingButton>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">
          {error}
        </div>
      )}

      <div className="mt-6 border border-navy/10 bg-paper px-5 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink">Before you pay — read this</p>
        <ul className="space-y-2 text-xs leading-relaxed text-ink-muted">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-navy/40">✔</span>
            <span>
              <strong className="text-ink">Not legal advice.</strong> Informational analysis only — not legal, adjuster, or insurance advice.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-navy/40">✔</span>
            <span>
              <strong className="text-ink">No guarantees.</strong> We do not guarantee any financial recovery. Results depend on your documents and the company&apos;s response.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-navy/40">✔</span>
            <span>
              See{" "}
              <Link href="/terms" className="font-medium text-navy underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-navy underline underline-offset-2">
                Privacy
              </Link>
              .
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
