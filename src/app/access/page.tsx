"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccessPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm font-semibold text-navy underline underline-offset-2">
          ← ClaimGap
        </Link>
      </div>

      <h1 className="font-display text-2xl font-medium text-navy mb-2">
        Access your report
      </h1>
      <p className="text-sm text-ink-muted mb-8 leading-relaxed">
        Enter the email you used when you purchased your report. We&apos;ll send you a link to view it again.
      </p>

      {sent ? (
        <div className="rounded-lg border border-teal-700/20 bg-teal-50/90 px-5 py-6 text-center">
          <p className="text-base font-semibold text-teal-900">Check your inbox</p>
          <p className="mt-2 text-sm text-teal-800 leading-relaxed">
            If we found a report for <strong>{email}</strong>, we&apos;ve sent the link. Check your spam folder if it doesn&apos;t arrive within a minute.
          </p>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail(""); }}
            className="mt-4 text-xs font-semibold text-teal-700 underline underline-offset-2"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-navy/15 px-4 py-3 text-ink outline-none ring-navy focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send my report link →"}
          </button>
        </form>
      )}

      <p className="mt-8 text-xs text-ink-faint leading-relaxed">
        Reports are accessible for up to 90 days from purchase. After that, email{" "}
        <a href="mailto:info@globaldeal.app" className="underline text-navy">
          info@globaldeal.app
        </a>{" "}
        for help.
      </p>
    </main>
  );
}
