"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { FullAnalysis, StoredAnalysis } from "@/lib/types";
import { LoadingButton } from "./LoadingButton";

/* ─── Types ───────────────────────────────────────────────────── */

type ClaimResponse = {
  id: string;
  status: string;
  analysis: StoredAnalysis | null;
  insurance_type?: string;
  insurer?: string;
  state?: string;
  description?: string;
  offer_amount?: number | null;
  error?: string;
};

/* ─── Helpers ─────────────────────────────────────────────────── */

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function today() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── Small components ────────────────────────────────────────── */

function SectionHeader({
  n,
  title,
  sub,
}: {
  n: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-navy/20 bg-navy text-xs font-bold text-white">
        {n}
      </span>
      <div>
        <h2 className="font-display text-xl font-medium text-navy">{title}</h2>
        {sub && <p className="mt-0.5 text-sm text-ink-muted">{sub}</p>}
      </div>
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        {label && <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</p>}
        <button
          type="button"
          onClick={copy}
          className="print:hidden flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-1 text-xs font-semibold text-navy transition hover:bg-navy/5"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-teal-700">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="whitespace-pre-wrap rounded-lg border border-navy/10 bg-paper p-5 text-sm leading-relaxed text-ink font-sans">
        {text}
      </pre>
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color =
    score >= 7 ? "bg-teal-600" : score >= 5 ? "bg-amber-500" : "bg-rust";
  const label =
    score >= 7 ? "Strong case" : score >= 5 ? "Moderate case" : "Challenging";
  return (
    <div className="mt-2">
      <div className="flex items-end gap-3 mb-2">
        <span className="font-display text-6xl font-medium leading-none text-navy">{score}</span>
        <span className="mb-1 text-lg text-ink-faint">/10</span>
        <span
          className={`mb-1 rounded px-2 py-1 text-xs font-semibold ${
            score >= 7
              ? "bg-teal-100 text-teal-800"
              : score >= 5
                ? "bg-amber-100 text-amber-800"
                : "bg-rust-faint text-rust"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Processing screen ────────────────────────────────────────── */

const PROCESSING_STEPS = [
  "Payment confirmed",
  "Reviewing your policy...",
  "Checking coverage limits...",
  "Comparing insurer offer...",
  "Calculating your gap...",
  "Generating your report...",
] as const;

function ProcessingScreen({ sessionId, claimId }: { sessionId?: string; claimId: string }) {
  const [done, setDone] = useState(1);
  useEffect(() => {
    const max = PROCESSING_STEPS.length - 1;
    const t = setInterval(() => setDone((d) => Math.min(d + 1, max)), 3500);
    return () => clearInterval(t);
  }, []);

  if (!sessionId) {
    return (
      <div className="rounded-lg border border-rust/25 bg-rust-faint px-4 py-4 text-rust">
        <Link href={`/preview/${claimId}`} className="font-semibold underline">
          This report is not unlocked yet. Return to preview.
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="relative h-16 w-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-navy/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-navy" />
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-navy/5 text-navy text-lg font-bold">
          ✓
        </div>
      </div>
      <h2 className="font-display text-xl font-medium text-ink">Finding what they didn&apos;t tell you…</h2>
      <p className="mt-1 text-sm text-ink-muted">This page refreshes automatically — stay here</p>
      <div className="mt-8 w-full max-w-xs space-y-3 text-left">
        {PROCESSING_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                i < done
                  ? "bg-teal-700 text-white"
                  : i === done
                    ? "border-2 border-navy bg-white"
                    : "border border-navy/10 bg-paper"
              }`}
            >
              {i < done ? "✓" : i === done ? <span className="block h-2 w-2 rounded-full bg-navy" /> : null}
            </div>
            <span
              className={`text-sm ${
                i < done ? "font-semibold text-teal-800" : i === done ? "font-semibold text-navy" : "text-ink-faint"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main report ─────────────────────────────────────────────── */

function MarkdownPaidReport({
  full,
  claim,
}: {
  full: FullAnalysis;
  claim: ClaimResponse;
}) {
  const mm = full.missed_money;
  const offerAmount = claim.offer_amount ?? 0;
  const md = full.report_markdown ?? "";

  return (
    <div id="result-print-root">
      <div className="border-b border-navy/10 pb-8 mb-10 print:pb-4 print:mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-1">ClaimGap — Full Paid Report</p>
            <h1 className="font-display text-3xl font-medium text-navy md:text-4xl">Dispute & recovery report</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {claim.insurer} · {claim.insurance_type} · {claim.state} · Generated {today()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border-2 border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path d="M2.5 8a.5.5 0 100 1 .5.5 0 000-1z" />
                <path d="M5 1a2 2 0 00-2 2v2H2a2 2 0 00-2 2v3a2 2 0 002 2h1v1a2 2 0 002 2h6a2 2 0 002-2v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a2 2 0 00-2-2H5zM4 3a1 1 0 011-1h6a1 1 0 011 1v2H4V3zm1 5a2 2 0 00-2 2v1H2a1 1 0 01-1-1V7a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1h-1v-1a2 2 0 00-2-2H5zm7 2v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3a1 1 0 011-1h6a1 1 0 011 1z" />
              </svg>
              Print / Save PDF
            </button>
            <Link
              href={`/outcome/${claim.id}`}
              className="flex items-center gap-2 rounded-lg border border-navy/15 px-4 py-2 text-sm font-semibold text-ink-muted transition hover:border-navy/30"
            >
              Report outcome
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Paid by insurer</p>
          <p className="mt-1 font-display text-3xl font-medium text-ink">{mm ? usd(mm.total_payout_received) : usd(offerAmount)}</p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Policy entitlement (est.)</p>
          <p className="mt-1 font-display text-3xl font-medium text-navy">
            {mm && mm.expected_payout > 0 ? usd(mm.expected_payout) : "See report"}
          </p>
        </div>
        <div className="rounded-lg border border-rust/30 bg-rust-faint p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-rust">Estimated gap</p>
          <p className="mt-1 font-display text-3xl font-medium text-rust">
            {mm ? `${usd(mm.missed_amount_low)} – ${usd(mm.missed_amount_high)}` : "—"}
          </p>
          {mm?.strength_of_case && (
            <p className="mt-1 text-xs font-semibold text-rust/80">Strength of case: {mm.strength_of_case}</p>
          )}
        </div>
      </div>

      {mm?.reasons && mm.reasons.length > 0 && (
        <div className="mb-10 rounded-lg border border-rust/20 bg-rust-faint p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-rust">At a glance</p>
          <ul className="space-y-2">
            {mm.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-rust/25 bg-white text-[10px] font-bold text-rust">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <article className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm print:border-0 print:shadow-none [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:border-navy/10 [&_h2]:pb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-navy [&_h2]:first:mt-0 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1 [&_ol]:pl-5 [&_li]:text-sm [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-navy/20 [&_blockquote]:bg-paper [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:text-sm [&_blockquote]:italic [&_hr]:my-8 [&_hr]:border-navy/10 [&_strong]:text-ink">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </article>

      {(full.counter_offer_letter?.subject || full.counter_offer_letter?.body) && (
        <section className="mt-10 rounded-lg border-2 border-navy bg-white p-6 shadow-sm print:mt-8">
          <SectionHeader n="+" title="Copy dispute letter" sub="Same text as in your report — quick copy" />
          {full.counter_offer_letter.subject ? <CopyBlock label="Subject Line" text={full.counter_offer_letter.subject} /> : null}
          <CopyBlock label="Letter Body" text={full.counter_offer_letter.body || ""} />
        </section>
      )}

      <div className="mt-10 rounded-lg border border-navy/10 bg-paper p-5">
        <p className="mb-1 text-xs font-semibold text-ink-muted">Legal disclaimer</p>
        <p className="text-xs leading-relaxed text-ink-faint">{full.disclaimer}</p>
        <p className="mt-3 text-xs text-ink-faint">
          Questions?{" "}
          <a href="mailto:info@globaldeal.app" className="underline text-navy">
            info@globaldeal.app
          </a>
        </p>
      </div>
    </div>
  );
}

function FullReport({
  full,
  claim,
}: {
  full: FullAnalysis;
  claim: ClaimResponse;
}) {
  const mm = full.missed_money;
  const offerAmount = claim.offer_amount ?? 0;

  if (full.report_markdown?.trim()) {
    return <MarkdownPaidReport full={full} claim={claim} />;
  }

  return (
    <div id="result-print-root">
      {/* ── REPORT HEADER ───────────────────────────────────── */}
      <div className="border-b border-navy/10 pb-8 mb-10 print:pb-4 print:mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-1">
              ClaimGap — Insurance Dispute Report
            </p>
            <h1 className="font-display text-3xl font-medium text-navy md:text-4xl">
              Full Claim Analysis
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              {claim.insurer} · {claim.insurance_type} · {claim.state} · Generated {today()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border-2 border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path d="M2.5 8a.5.5 0 100 1 .5.5 0 000-1z"/><path d="M5 1a2 2 0 00-2 2v2H2a2 2 0 00-2 2v3a2 2 0 002 2h1v1a2 2 0 002 2h6a2 2 0 002-2v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a2 2 0 00-2-2H5zM4 3a1 1 0 011-1h6a1 1 0 011 1v2H4V3zm1 5a2 2 0 00-2 2v1H2a1 1 0 01-1-1V7a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1h-1v-1a2 2 0 00-2-2H5zm7 2v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3a1 1 0 011-1h6a1 1 0 011 1z"/>
              </svg>
              Print / Save PDF
            </button>
            <Link
              href={`/outcome/${claim.id}`}
              className="flex items-center gap-2 rounded-lg border border-navy/15 px-4 py-2 text-sm font-semibold text-ink-muted transition hover:border-navy/30"
            >
              Report outcome
            </Link>
          </div>
        </div>
      </div>

      {/* ── EXECUTIVE SUMMARY ───────────────────────────────── */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Paid by insurer</p>
          <p className="mt-1 font-display text-3xl font-medium text-ink">
            {mm ? usd(mm.total_payout_received) : usd(offerAmount)}
          </p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Policy entitlement</p>
          <p className="mt-1 font-display text-3xl font-medium text-navy">
            {mm && mm.expected_payout > 0 ? usd(mm.expected_payout) : "See report"}
          </p>
        </div>
        <div className="rounded-lg border border-rust/30 bg-rust-faint p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-rust">Estimated gap</p>
          <p className="mt-1 font-display text-3xl font-medium text-rust">
            {mm
              ? `${usd(mm.missed_amount_low)} – ${usd(mm.missed_amount_high)}`
              : `${usd(full.gap_analysis.estimated_gap_min)} – ${usd(full.gap_analysis.estimated_gap_max)}`}
          </p>
          {mm && (
            <p className="mt-1 text-xs font-semibold text-rust/80">
              Strength of case:{" "}
              {mm.strength_of_case ??
                (typeof mm.confidence_score === "number" ? `see score ${mm.confidence_score}/10 (older format)` : "—")}
            </p>
          )}
        </div>
      </div>

      {/* ── REASONS ─────────────────────────────────────────── */}
      {mm?.reasons && mm.reasons.length > 0 && (
        <div className="mb-10 rounded-lg border border-rust/20 bg-rust-faint p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-rust">Why you were underpaid</p>
          <ul className="space-y-2">
            {mm.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-rust/25 bg-white text-[10px] font-bold text-rust">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-10">

        {/* ── SECTION 1: CLAIM SUMMARY ──────────────────────── */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <SectionHeader n="1" title="Claim Summary" sub="Policy coverage and key provisions" />

          <p className="text-ink leading-relaxed mb-5">{full.policy_coverage.summary}</p>

          <div className="space-y-2 mb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Key Policy Provisions</p>
            {full.policy_coverage.key_provisions.map((p, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-paper px-4 py-2.5">
                <span className="shrink-0 text-teal-700 font-bold mt-0.5">✓</span>
                <span className="text-sm text-ink">{p}</span>
              </div>
            ))}
          </div>

          {full.policy_coverage.relevant_quotes.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Policy Quotes</p>
              {full.policy_coverage.relevant_quotes.map((q, i) => (
                <blockquote
                  key={i}
                  className="border-l-4 border-navy/30 pl-4 py-1 text-sm italic text-ink-muted bg-paper rounded-r-lg"
                >
                  {`\u201C${q}\u201D`}
                </blockquote>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 2: IDENTIFIED DISCREPANCIES ─────────── */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <SectionHeader
            n="2"
            title="Identified Discrepancies"
            sub={`${full.gap_analysis.underpayment_areas.length} specific areas where coverage was misapplied`}
          />

          <p className="text-ink leading-relaxed mb-6">{full.gap_analysis.summary}</p>

          <div className="space-y-4">
            {full.gap_analysis.underpayment_areas.map((u, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-rust/20">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-rust-faint px-5 py-3">
                  <h3 className="text-sm font-bold text-navy">{u.area}</h3>
                  {(u.gap_anchor_label || u.missed_high) && (
                    <span className="font-display text-sm font-medium text-rust">
                      {u.gap_anchor_label ||
                        (u.missed_low && u.missed_high
                          ? `${usd(u.missed_low)} – ${usd(u.missed_high)}`
                          : u.missed_high
                            ? `Up to ${usd(u.missed_high)}`
                            : "")}
                    </span>
                  )}
                </div>
                <div className="space-y-4 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint mb-1">
                      What the payer did
                    </p>
                    <p className="text-sm text-ink">{u.what_insurer_did ?? u.offered ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint mb-1">
                      What your policy or plan paperwork says
                    </p>
                    <blockquote className="border-l-4 border-navy/25 pl-3 text-sm italic text-ink leading-relaxed">
                      {u.policy_quote ?? u.policy_says}
                    </blockquote>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint mb-1">
                      Why this may be wrong
                    </p>
                    <p className="text-sm text-ink">{u.why_may_be_wrong ?? u.gap}</p>
                  </div>
                  {u.what_to_say && (
                    <div className="rounded-lg border border-teal-700/20 bg-teal-50/90 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-teal-900 mb-1">
                        What to say to the payer
                      </p>
                      <p className="text-sm text-teal-950 whitespace-pre-wrap">{u.what_to_say}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: FINANCIAL IMPACT ─────────────────── */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <SectionHeader
            n="3"
            title="Financial Impact"
            sub="Total estimated underpayment and recovery probability"
          />

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-3">
                Strength of case (paperwork clarity)
              </p>
              {full.probability_score ? (
                <ScoreMeter score={full.probability_score.score} />
              ) : (
                <p className="font-display text-3xl font-medium text-navy">{mm?.strength_of_case ?? "—"}</p>
              )}
            </div>
            <div className="rounded-lg border border-rust/20 bg-rust-faint p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-rust">Estimated underpayment range</p>
              <p className="font-display text-3xl font-medium text-rust">
                {usd(full.gap_analysis.estimated_gap_min)}
              </p>
              <p className="my-1 text-sm text-ink-faint">to</p>
              <p className="font-display text-3xl font-medium text-rust">
                {usd(full.gap_analysis.estimated_gap_max)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-navy/10 bg-paper p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Analysis notes</p>
            <p className="text-sm text-ink leading-relaxed">
              {full.probability_score?.reasoning ??
                "This reflects how clearly your uploaded documents support a mistake or oversight by the payer — not your chance of winning a dispute."}
            </p>
          </div>
        </section>

        {/* ── SECTION 4: POLICY REFERENCES ─────────────────── */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <SectionHeader
            n="4"
            title="Policy References & Legal Basis"
            sub="Exact clauses your dispute is grounded in"
          />

          <div className="space-y-4">
            {full.policy_coverage.relevant_quotes.map((q, i) => (
              <div key={i} className="rounded-lg border-l-4 border-navy bg-navy/5 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-navy/50 mb-2">
                  Policy Reference {i + 1}
                </p>
                <p className="text-sm italic text-ink leading-relaxed">{`\u201C${q}\u201D`}</p>
              </div>
            ))}
            {full.gap_analysis.underpayment_areas.map((u, i) => (
              <div key={i} className="rounded-lg bg-paper px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-1">
                  Argument {i + 1}: {u.area}
                </p>
                <p className="text-sm text-ink">{u.policy_quote ?? u.policy_says}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 5: APPEAL LETTER ─────────────────────── */}
        <section className="rounded-lg border-2 border-navy bg-white p-6 shadow-sm">
          <SectionHeader
            n="5"
            title="Ready-to-Send Appeal Letter"
            sub="Professional, assertive, legally structured — copy and send today"
          />

          <div className="mb-4 flex items-start gap-2 rounded-lg border border-teal-700/20 bg-teal-50/90 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-teal-700">·</span>
            <p className="text-sm text-teal-950">
              This letter references your specific policy provisions and requests a formal review. Send via certified mail or email with read receipt to create a paper trail.
            </p>
          </div>

          <CopyBlock label="Subject Line" text={full.counter_offer_letter.subject} />
          <CopyBlock label="Letter Body" text={full.counter_offer_letter.body} />
        </section>

        {/* ── SECTION 6: ESCALATION PLAN ───────────────────── */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <SectionHeader
            n="6"
            title="21-Day Escalation Plan"
            sub="If the insurer ignores or denies your appeal"
          />

          <div className="space-y-4 mb-8">
            {[
              ...(full.escalation_plan.day_1
                ? [{ day: "Day 1", action: full.escalation_plan.day_1, color: "border-navy/40 bg-navy/5" }]
                : []),
              { day: "Day 7", action: full.escalation_plan.day_7, color: "border-teal-600/40 bg-teal-50/80" },
              { day: "Day 14", action: full.escalation_plan.day_14, color: "border-amber-500/40 bg-amber-50/80" },
              { day: "Day 21", action: full.escalation_plan.day_21, color: "border-rust/40 bg-rust-faint" },
            ].map(({ day, action, color }) => (
              <div key={day} className={`rounded-lg border-l-4 ${color} px-5 py-4`}>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
                  {day}
                </p>
                <p className="text-sm text-ink">{action}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">
              State Insurance Commissioner — Formal Complaint Template
            </p>
            <CopyBlock label="" text={full.escalation_plan.commissioner_template} />
          </div>
        </section>

      </div>

      {/* ── FOOTER / DISCLAIMER ─────────────────────────────── */}
      <div className="mt-10 rounded-lg border border-navy/10 bg-paper p-5">
        <p className="mb-1 text-xs font-semibold text-ink-muted">Legal disclaimer</p>
        <p className="text-xs leading-relaxed text-ink-faint">{full.disclaimer}</p>
        <p className="mt-3 text-xs text-ink-faint">
          Questions?{" "}
          <a href="mailto:info@globaldeal.app" className="underline text-navy">
            info@globaldeal.app
          </a>
        </p>
      </div>
    </div>
  );
}

/* ─── Root component ──────────────────────────────────────────── */

export function ResultClient({
  claimId,
  sessionId,
}: {
  claimId: string;
  sessionId?: string;
}) {
  const [claim, setClaim] = useState<ClaimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClaim = useCallback(async () => {
    const res = await fetch(`/api/claim/${claimId}`);
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "Failed to load.");
    return j as ClaimResponse;
  }, [claimId]);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function tick() {
      try {
        const c = await fetchClaim();
        if (cancelled) return;
        setClaim(c);
        setError(null);
        if (c.status === "paid" || c.status === "failed") {
          if (interval) clearInterval(interval);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      }
    }

    tick();
    if (sessionId) {
      interval = setInterval(tick, 4000);
    }
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [fetchClaim, sessionId]);

  if (error && !claim) {
    return (
      <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-4 text-rust">
        {error}
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex items-center gap-3 text-ink-muted py-12 justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        Loading your report…
      </div>
    );
  }

  if (claim.status === "preview") {
    return <ProcessingScreen sessionId={sessionId} claimId={claimId} />;
  }

  if (claim.status === "failed" || claim.error) {
    return (
      <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-4">
        <p className="mb-1 font-semibold text-rust">Analysis failed</p>
        <p className="text-sm text-rust">
          {claim.error ?? "We could not complete the analysis."}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          Email{" "}
          <a href="mailto:info@globaldeal.app" className="underline text-navy">
            info@globaldeal.app
          </a>{" "}
          for a full refund.
        </p>
      </div>
    );
  }

  const full = claim.analysis?.full as FullAnalysis | null | undefined;
  if (!full) {
    return (
      <div className="space-y-4 text-ink-muted py-8">
        <p>Full analysis is still being prepared.</p>
        <LoadingButton
          type="button"
          className="bg-navy px-5 py-2 text-sm text-white"
          onClick={async () => {
            setError(null);
            try {
              setClaim(await fetchClaim());
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          }}
        >
          Refresh
        </LoadingButton>
        {error && <p className="text-sm text-rust">{error}</p>}
      </div>
    );
  }

  return <FullReport full={full} claim={claim} />;
}
