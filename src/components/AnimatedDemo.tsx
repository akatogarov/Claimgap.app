"use client";

import { useEffect, useState } from "react";

function CursorSVG({ clicking }: { clicking: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      style={{
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
        transform: clicking ? "scale(0.8)" : "scale(1)",
        transition: "transform 0.15s ease",
      }}
    >
      <path
        d="M4 2L18 9.5L11.5 11.5L8.5 18.5L4 2Z"
        fill="white"
        stroke="#0F2D6B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STAGES = ["intake", "loading", "preview", "report"] as const;
type Stage = (typeof STAGES)[number];

const DURATIONS: Record<Stage, number> = {
  intake: 3800,
  loading: 2200,
  preview: 3800,
  report: 3800,
};

const URLS: Record<Stage, string> = {
  intake: "claimgap.app/analyze",
  loading: "claimgap.app/analyze",
  preview: "claimgap.app/preview/…",
  report: "claimgap.app/result/…",
};

// Cursor end positions [left%, top%] within the content area
const CURSOR: Record<Stage, [number, number]> = {
  intake: [73, 84],
  loading: [50, 52],
  preview: [72, 89],
  report: [62, 82],
};

export function AnimatedDemo() {
  const [idx, setIdx] = useState(0);
  const [clicking, setClicking] = useState(false);

  const stage = STAGES[idx];
  const [cx, cy] = CURSOR[stage];

  useEffect(() => {
    const t = setTimeout(() => {
      setClicking(true);
      setTimeout(() => {
        setClicking(false);
        setIdx((i) => (i + 1) % STAGES.length);
      }, 380);
    }, DURATIONS[stage] - 380);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div className="mx-auto w-full max-w-[340px] md:max-w-none">
      {/* Browser frame */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-full border border-slate-200 bg-white px-3 py-1 text-center text-xs text-slate-400">
            {URLS[stage]}
          </div>
        </div>

        {/* Screens */}
        <div className="relative h-[280px] overflow-hidden">
          {/* Stage 0 — Intake form */}
          <div
            className={`absolute inset-0 p-5 transition-opacity duration-500 ${
              stage === "intake" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/5 rounded-full bg-navy" />
            </div>
            <p className="mt-3 text-xs font-bold text-navy">What type of insurance?</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {(["Auto", "Home", "Health"] as const).map((t) => (
                <div
                  key={t}
                  className={`rounded-xl border-2 py-2.5 text-center text-[11px] font-semibold ${
                    t === "Auto"
                      ? "border-navy bg-navy text-white"
                      : "border-navy/20 text-navy"
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-slate-200 px-2.5 py-2">
                <p className="text-[9px] font-medium text-slate-400">INSURER</p>
                <p className="text-xs font-medium text-slate-800">State Farm</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-2.5 py-2">
                <p className="text-[9px] font-medium text-slate-400">STATE</p>
                <p className="text-xs font-medium text-slate-800">Texas (TX)</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-2.5 py-2">
                <p className="text-[9px] font-medium text-slate-400">CLAIM TYPE</p>
                <p className="text-xs font-medium text-slate-800">Collision</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="rounded-full bg-navy px-5 py-1.5 text-[11px] font-semibold text-white">
                Continue →
              </div>
            </div>
          </div>

          {/* Stage 1 — Loading */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
              stage === "loading" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-navy">Analyzing your claim…</p>
            <p className="mt-1 text-xs text-slate-500">Comparing policy vs. settlement offer</p>
            <div className="mt-5 space-y-1.5 w-48">
              {["Reading policy document", "Extracting coverage terms", "Comparing settlement offer"].map(
                (t, i) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500">{t}</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Stage 2 — Preview */}
          <div
            className={`absolute inset-0 p-5 transition-opacity duration-500 ${
              stage === "preview" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <p className="text-sm font-bold text-navy">Your free preview</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              3 potential underpayment areas identified
            </p>
            <div className="relative mt-2 overflow-hidden rounded-xl border border-navy/10 bg-slate-50 p-3">
              <div className="select-none blur-[3px]">
                {[
                  "Coverage limit misapplied to claim",
                  "Excluded repair category triggered",
                  "Depreciation calculation contested",
                ].map((a) => (
                  <div key={a} className="mb-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[10px] text-slate-600">
                    {a}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent" />
              <p className="relative text-center text-[10px] font-medium text-navy/70 mt-1">
                Full details locked
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-navy/10 bg-white px-3 py-2 shadow-sm">
              <div>
                <p className="text-[9px] font-semibold uppercase text-slate-400">Full unlock</p>
                <p className="text-lg font-bold text-navy">$149</p>
              </div>
              <div className="rounded-full bg-navy px-3 py-1.5 text-[10px] font-semibold text-white">
                Unlock report →
              </div>
            </div>
          </div>

          {/* Stage 3 — Report */}
          <div
            className={`absolute inset-0 p-5 transition-opacity duration-500 ${
              stage === "report" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                Analysis complete
              </p>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-slate-500">Estimated underpayment</p>
              <p className="text-2xl font-bold text-navy">$4,200 – $6,800</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <p className="text-base font-bold text-navy">73%</p>
                <p className="text-[9px] text-slate-500">Recovery probability</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <p className="text-base font-bold text-navy">3</p>
                <p className="text-[9px] text-slate-500">Underpayment areas</p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {["Diminished value not included", "OEM parts clause triggered"].map((t, i) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700"
                >
                  <span className="flex-shrink-0 font-semibold">0{i + 1}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-800">
              ✓ Counter-offer letter ready — click to copy
            </div>
          </div>

          {/* Cursor */}
          <div
            className="pointer-events-none absolute z-50"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transition: "left 0.75s cubic-bezier(0.4,0,0.2,1), top 0.75s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <CursorSVG clicking={clicking} />
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 py-2.5">
          {STAGES.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                idx === i ? "w-5 bg-navy" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">Live product demo</p>
    </div>
  );
}
