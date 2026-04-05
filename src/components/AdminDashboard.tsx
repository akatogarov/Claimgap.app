"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingButton } from "./LoadingButton";

/* ─── Types ────────────────────────────────────────────────────────────── */

type ClaimRow = {
  id: string;
  email: string;
  insurance_type: string;
  insurer: string;
  state: string;
  status: string;
  offer_amount: number | null;
  created_at: string;
};

type DailyPoint = { date: string; total: number; paid: number };

type OutcomeStats = {
  step1Total: number;
  step1Sent: number;
  step1Pending: number;
  step1Dropped: number;
  step2Total: number;
  step2Won: number;
  step2Waiting: number;
  step2Denied: number;
  step2NoAction: number;
  totalRecovered: number;
};

type Stats = {
  total: number;
  paid: number;
  preview: number;
  failed: number;
  revenue: number;
  avgGap: number;
  conversionRate: number;
  byType: Record<string, number>;
  topStates: { state: string; count: number }[];
  dailyChart: DailyPoint[];
  outcomeStats?: OutcomeStats;
};

type Health = {
  anthropic: boolean;
  supabase: boolean;
  stripe: boolean;
  stripeWebhook: boolean;
  resend: boolean;
  resendFrom: boolean;
  adminSecret: boolean;
  adminJwt: boolean;
  adminEmails: boolean;
  cronSecret: boolean;
  publicUrl: string | null;
};

type OutcomeRow = {
  id: string;
  claim_id: string;
  result: string;
  additional_amount: number | null;
  reported_at: string;
};

type ClaimWithOutcomes = ClaimRow & {
  outcomes?: OutcomeRow[];
};

type Tab = "claims" | "outcomes" | "analytics" | "health";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${color ?? "border-navy/10 bg-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-navy">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function HealthRow({ label, ok, note, optional }: { label: string; ok: boolean; note?: string; optional?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          ok ? "bg-emerald-100 text-emerald-700" : optional ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
        }`}
      >
        {ok ? "OK" : optional ? "OPTIONAL" : "MISSING"}
      </span>
    </div>
  );
}

function MiniBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 truncate text-xs text-slate-600">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-xs text-slate-500">{value}</span>
    </div>
  );
}

function DailyBars({ data }: { data: DailyPoint[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="mt-4 flex items-end gap-2 h-28">
      {data.map((d) => {
        const totalH = Math.round((d.total / maxTotal) * 96);
        const paidH = Math.round((d.paid / maxTotal) * 96);
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full flex justify-center" style={{ height: 96 }}>
              <div
                className="absolute bottom-0 w-full rounded-t bg-slate-200"
                style={{ height: totalH || 2 }}
              />
              <div
                className="absolute bottom-0 w-full rounded-t bg-emerald-400"
                style={{ height: paidH || 0 }}
              />
            </div>
            <span className="text-[9px] text-slate-400 whitespace-nowrap">
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */

const OUTCOME_LABELS: Record<string, string> = {
  step1_sent: "✓ Sent letter",
  step1_pending: "○ Not yet",
  step1_dropped: "✕ Dropped",
  step2_won: "💰 Got more money",
  step2_waiting: "⏳ Waiting",
  step2_denied: "✕ Denied",
  step2_no_action: "— No action",
  pf_expensive: "Too expensive",
  pf_trust: "Didn't trust estimate",
  pf_not_ready: "Not ready yet",
  pf_resolved: "Already resolved",
  pf_other: "Other",
};

type OutcomeTrackRow = {
  id: string;
  email: string;
  insurance_type: string;
  insurer: string;
  state: string;
  status: string;
  offer_amount: number | null;
  created_at: string;
  step1_result: string | null;
  step1_at: string | null;
  step2_result: string | null;
  step2_at: string | null;
  step2_recovered: number | null;
  preview_feedback: string | null;
  feedback_at: string | null;
  reminder_step1_sent: boolean;
  reminder_step2_sent: boolean;
};

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("claims");
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Claims tab
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Outcomes tab
  const [outcomeRows, setOutcomeRows] = useState<OutcomeTrackRow[]>([]);
  const [outcomeLoaded, setOutcomeLoaded] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  // Analytics + Health
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);

  const loadClaims = useCallback(async () => {
    const res = await fetch("/api/admin/claims");
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "Unauthorized");
    setClaims(j.claims ?? []);
    setAdminEmail((prev) => prev ?? j.admin ?? null);
  }, []);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "Error loading stats");
    setStats(j.stats);
    setHealth(j.health);
  }, []);

  const loadOutcomes = useCallback(async () => {
    if (outcomeLoaded) return;
    const res = await fetch("/api/admin/outcomes");
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "Error loading outcomes");
    setOutcomeRows(j.rows ?? []);
    setOutcomeLoaded(true);
  }, [outcomeLoaded]);

  async function deleteClaim(id: string) {
    if (!confirm("Delete this claim permanently? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/claims/${id}`, { method: "DELETE" });
      if (!res.ok) { alert("Delete failed."); return; }
      setClaims((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    window.open("/api/admin/export", "_blank");
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadClaims(), loadStats()]);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          router.push("/admin/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadClaims, loadStats, router]);

  // Load outcomes lazily when tab is clicked
  useEffect(() => {
    if (tab === "outcomes") loadOutcomes().catch(console.error);
  }, [tab, loadOutcomes]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600 py-20 justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        Loading…
      </div>
    );
  }

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  const filteredClaims = claims.filter((c) => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.email.toLowerCase().includes(q) ||
      c.insurer.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const healthIssues = health
    ? [
        health.anthropic,
        health.supabase,
        health.stripe,
        health.stripeWebhook,
        health.resend,
        health.resendFrom,
        health.adminSecret,
        health.adminJwt,
        health.adminEmails,
        // cronSecret is optional — not counted as a blocker
        health.publicUrl !== null,
      ].filter((v) => !v).length
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">ClaimGap Admin</h1>
          {adminEmail && <p className="text-sm text-slate-500">Signed in as {adminEmail}</p>}
        </div>
        <LoadingButton
          type="button"
          className="border border-navy px-4 py-2 text-navy text-sm"
          onClick={logout}
        >
          Sign out
        </LoadingButton>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
        {(["claims", "outcomes", "analytics", "health"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize rounded-t transition-colors ${
              tab === t
                ? "border-b-2 border-navy text-navy bg-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
            {t === "health" && healthIssues > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                {healthIssues}
              </span>
            )}
            {t === "claims" && (
              <span className="ml-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5">
                {claims.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CLAIMS ─────────────────────────────────────────────────────────── */}
      {tab === "claims" && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Search email, insurer, state, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="preview">Preview</option>
              <option value="failed">Failed</option>
              <option value="awaiting_clarification">Awaiting clarification</option>
            </select>
            <span className="self-center text-sm text-slate-500">{filteredClaims.length} results</span>
            <button
              onClick={exportCsv}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              ↓ Export CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-navy/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Insurer</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Offer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((c) => (
                  <tr key={c.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
                      {new Date(c.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{c.email}</td>
                    <td className="px-4 py-3 text-slate-700">{c.insurer}</td>
                    <td className="px-4 py-3">{c.state}</td>
                    <td className="px-4 py-3">{c.insurance_type}</td>
                    <td className="px-4 py-3 font-medium">
                      {c.offer_amount != null ? usd(Number(c.offer_amount)) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "preview"
                              ? "bg-amber-100 text-amber-800"
                              : c.status === "awaiting_clarification"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/result/${c.id}`} className="text-navy underline text-xs mr-3">
                        Result
                      </Link>
                      <Link href={`/preview/${c.id}`} className="text-slate-400 underline text-xs mr-3">
                        Preview
                      </Link>
                      <button
                        onClick={() => deleteClaim(c.id)}
                        disabled={deletingId === c.id}
                        className="text-red-400 hover:text-red-600 text-xs transition disabled:opacity-40"
                      >
                        {deletingId === c.id ? "…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClaims.length === 0 && (
              <p className="px-4 py-8 text-center text-slate-500">No claims match your filter.</p>
            )}
          </div>
        </div>
      )}

      {/* ── OUTCOMES ───────────────────────────────────────────────────────── */}
      {tab === "outcomes" && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <p className="text-sm text-slate-500 flex-1">
              Tracks follow-up responses from paid users (letter sent? result?) and preview abandonment feedback.
            </p>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
            >
              <option value="all">All</option>
              <option value="paid">Paid — no response yet</option>
              <option value="paid_responded">Paid — responded</option>
              <option value="preview_feedback">Preview feedback received</option>
              <option value="preview_no_feedback">Preview — no feedback</option>
            </select>
          </div>

          {!outcomeLoaded ? (
            <div className="flex items-center gap-2 py-10 justify-center text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
              Loading…
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-navy/10">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-3 py-3">Created</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Offer</th>
                    <th className="px-3 py-3">Day 7 (Letter)</th>
                    <th className="px-3 py-3">Day 30 (Result)</th>
                    <th className="px-3 py-3">Recovered</th>
                    <th className="px-3 py-3">Preview Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outcomeRows
                    .filter((r) => {
                      if (outcomeFilter === "paid") return r.status === "paid" && !r.step1_result;
                      if (outcomeFilter === "paid_responded") return r.status === "paid" && (!!r.step1_result || !!r.step2_result);
                      if (outcomeFilter === "preview_feedback") return !!r.preview_feedback;
                      if (outcomeFilter === "preview_no_feedback") return r.status === "preview" && !r.preview_feedback;
                      return true;
                    })
                    .map((r) => (
                      <tr key={r.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap text-slate-500 text-xs">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-3 py-3 text-slate-700 max-w-[160px] truncate text-xs">{r.email}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            r.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-3 py-3 text-xs font-medium">
                          {r.offer_amount != null ? usd(Number(r.offer_amount)) : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {r.step1_result
                            ? <span className="text-slate-700">{OUTCOME_LABELS[r.step1_result] ?? r.step1_result}</span>
                            : r.reminder_step1_sent
                              ? <span className="text-slate-400">Reminder sent</span>
                              : <span className="text-slate-300">—</span>
                          }
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {r.step2_result
                            ? <span className={r.step2_result === "step2_won" ? "text-emerald-700 font-semibold" : "text-slate-700"}>
                                {OUTCOME_LABELS[r.step2_result] ?? r.step2_result}
                              </span>
                            : r.reminder_step2_sent
                              ? <span className="text-slate-400">Reminder sent</span>
                              : <span className="text-slate-300">—</span>
                          }
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-emerald-700">
                          {r.step2_recovered != null ? usd(r.step2_recovered) : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {r.preview_feedback
                            ? <span className="text-slate-700">{OUTCOME_LABELS[r.preview_feedback] ?? r.preview_feedback}</span>
                            : <span className="text-slate-300">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {outcomeRows.length === 0 && (
                <p className="px-4 py-8 text-center text-slate-500">No outcome data yet — responses appear here as users reply to follow-up emails.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ──────────────────────────────────────────────────────── */}
      {tab === "analytics" && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Claims" value={String(stats.total)} />
            <StatCard
              label="Revenue"
              value={usd(stats.revenue)}
              sub={`${stats.paid} paid × $149`}
              color="border-emerald-200 bg-emerald-50"
            />
            <StatCard
              label="Conversion"
              value={`${stats.conversionRate}%`}
              sub={`${stats.paid} paid / ${stats.total} total`}
            />
            <StatCard
              label="Avg Gap Found"
              value={stats.avgGap > 0 ? usd(stats.avgGap) : "N/A"}
              sub="from paid analyses"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-navy/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Status Breakdown
              </p>
              <div className="space-y-2">
                {[
                  { label: "Paid", value: stats.paid, color: "bg-emerald-400" },
                  { label: "Preview", value: stats.preview, color: "bg-amber-400" },
                  { label: "Failed", value: stats.failed, color: "bg-red-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="text-sm text-slate-700 flex-1">{label}</span>
                    <span className="text-sm font-semibold text-slate-800">{value}</span>
                    <span className="text-xs text-slate-400">
                      ({stats.total > 0 ? Math.round((value / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-navy/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                By Insurance Type
              </p>
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <MiniBar key={type} label={type} value={count} max={stats.total} />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-navy/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Top States
              </p>
              <div className="space-y-2">
                {stats.topStates.map(({ state, count }) => (
                  <MiniBar
                    key={state}
                    label={state}
                    value={count}
                    max={stats.topStates[0]?.count ?? 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {stats.outcomeStats && (stats.outcomeStats.step1Total > 0 || stats.outcomeStats.step2Total > 0) && (
            <div className="rounded-xl border border-navy/10 bg-white p-5 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
                Outcome Tracking
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {stats.outcomeStats.step1Total > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Day 7 — Letter sent? ({stats.outcomeStats.step1Total} responses)</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-slate-700">✓ Sent it</span><span className="font-semibold">{stats.outcomeStats.step1Sent}</span></div>
                      <div className="flex justify-between"><span className="text-slate-700">○ Not yet</span><span className="font-semibold">{stats.outcomeStats.step1Pending}</span></div>
                      <div className="flex justify-between"><span className="text-slate-700">✕ Decided not to</span><span className="font-semibold">{stats.outcomeStats.step1Dropped}</span></div>
                    </div>
                  </div>
                )}
                {stats.outcomeStats.step2Total > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Day 30 — Result ({stats.outcomeStats.step2Total} responses)</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-slate-700">💰 Got more money</span><span className="font-semibold text-emerald-700">{stats.outcomeStats.step2Won}</span></div>
                      <div className="flex justify-between"><span className="text-slate-700">⏳ Still waiting</span><span className="font-semibold">{stats.outcomeStats.step2Waiting}</span></div>
                      <div className="flex justify-between"><span className="text-slate-700">✕ Denied</span><span className="font-semibold">{stats.outcomeStats.step2Denied}</span></div>
                      <div className="flex justify-between"><span className="text-slate-700">— No action</span><span className="font-semibold">{stats.outcomeStats.step2NoAction}</span></div>
                    </div>
                    {stats.outcomeStats.totalRecovered > 0 && (
                      <p className="mt-3 text-xs text-emerald-700 font-semibold">
                        Total reported recovered: {usd(stats.outcomeStats.totalRecovered)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-navy/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Last 7 Days
            </p>
            <p className="text-xs text-slate-400 mb-3">
              <span className="inline-block w-3 h-2 rounded bg-slate-200 mr-1" />
              Gray = signups&nbsp;&nbsp;
              <span className="inline-block w-3 h-2 rounded bg-emerald-400 mr-1" />
              Green = paid
            </p>
            <DailyBars data={stats.dailyChart} />
          </div>
        </div>
      )}

      {/* ── HEALTH ─────────────────────────────────────────────────────────── */}
      {tab === "health" && health && (
        <div className="max-w-2xl">
          {healthIssues > 0 ? (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800">
              <strong>{healthIssues} issue{healthIssues > 1 ? "s" : ""} found.</strong> Missing env
              vars will break the workflow.
            </div>
          ) : (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800">
              All environment variables are set. Workflow is healthy.
            </div>
          )}

          <div className="rounded-xl border border-navy/10 bg-white px-5 py-2">
            <HealthRow
              label="ANTHROPIC_API_KEY"
              ok={health.anthropic}
              note="Required for AI analysis. Without this nothing works."
            />
            <HealthRow
              label="SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY"
              ok={health.supabase}
              note="Required for saving claims to database."
            />
            <HealthRow
              label="STRIPE_SECRET_KEY"
              ok={health.stripe}
              note="Required for creating payment sessions ($149)."
            />
            <HealthRow
              label="STRIPE_WEBHOOK_SECRET"
              ok={health.stripeWebhook}
              note="Required for payment confirmation. Without this users pay but get nothing."
            />
            <HealthRow
              label="RESEND_API_KEY"
              ok={health.resend}
              note="Required for sending report emails after payment."
            />
            <HealthRow
              label="RESEND_FROM_EMAIL"
              ok={health.resendFrom}
              note="Must be a verified domain in Resend (e.g. reports@claimgap.app)."
            />
            <HealthRow
              label="ADMIN_SECRET"
              ok={health.adminSecret}
              note="Password for admin login."
            />
            <HealthRow
              label="ADMIN_JWT_SECRET"
              ok={health.adminJwt}
              note="Secret for signing admin session tokens."
            />
            <HealthRow
              label="ADMIN_EMAILS"
              ok={health.adminEmails}
              note="Comma-separated admin emails, e.g. info@globaldeal.app — required to log in to this panel."
            />
            <HealthRow
              label="CRON_SECRET"
              ok={health.cronSecret}
              note="Optional — secures /api/cron/outcome-emails manual trigger. Not required for normal operation (outcome emails are scheduled via Resend)."
              optional
            />
          </div>

          <div className="mt-4 rounded-xl border border-navy/10 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              NEXT_PUBLIC_URL
            </p>
            <p
              className={`text-sm font-mono ${
                health.publicUrl ? "text-slate-800" : "text-red-600"
              }`}
            >
              {health.publicUrl ??
                "NOT SET — set to https://claimgap.app in Cloudflare Pages env vars"}
            </p>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-700 mb-2">Setup checklist:</p>
            <p>1. <strong>Resend:</strong> resend.com → verify domain → copy API key → set RESEND_API_KEY and RESEND_FROM_EMAIL</p>
            <p>2. <strong>Stripe webhook:</strong> Stripe Dashboard → Webhooks → Add endpoint
              <code className="bg-slate-200 px-1 rounded mx-1">https://claimgap.app/api/webhook</code>
              → select <em>checkout.session.completed</em> → copy Signing Secret → set STRIPE_WEBHOOK_SECRET
            </p>
            <p>3. <strong>Cloudflare Pages:</strong> Pages → claimgap → Settings → Environment Variables → add missing vars → Redeploy</p>
            <p>4. <strong>Outcome emails:</strong> scheduled automatically via Resend when user pays — Day 7, 14, 21, 28 (letter check) + Day 35, 60 (result check).</p>
            <p>5. <strong>Preview feedback:</strong> 1 email 24h after preview — asks why they didn&apos;t buy.</p>
          </div>
        </div>
      )}
    </div>
  );
}
