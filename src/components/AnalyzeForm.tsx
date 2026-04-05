"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "./LoadingButton";
import type { ExtractedFacts } from "@/lib/types";

type ClaimType = "Home" | "Auto" | "Health";

const UNKNOWN = "Unable to determine from provided documents";
const STEPS = 3;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

type SlotDef = { key: string; label: string; required: boolean; hint?: string };

const SLOTS: Record<ClaimType, SlotDef[]> = {
  Home: [
    { key: "policy", label: "Upload policy", required: true },
    { key: "insurer_letter", label: "Upload insurer letter", required: true },
    { key: "optional_contractor", label: "Add contractor estimate", required: false },
    { key: "optional_photos", label: "Add photos / other", required: false },
  ],
  Auto: [
    { key: "policy", label: "Upload policy", required: true },
    { key: "settlement_letter", label: "Upload settlement letter", required: true },
    { key: "optional_dealer", label: "Add dealer appraisal", required: false },
    { key: "optional_repair", label: "Add repair estimates", required: false },
    { key: "optional_vehicle_photos", label: "Add vehicle photos", required: false },
    { key: "optional_other", label: "Add other", required: false },
  ],
  Health: [
    { key: "policy_or_card", label: "Upload policy or insurance card", required: true },
    { key: "denial_or_eob", label: "Upload denial letter or EOB", required: true },
    { key: "optional_doctor", label: "Add doctor letter", required: false },
    { key: "optional_records", label: "Add medical records", required: false },
    { key: "optional_itemized", label: "Add itemized bill", required: false },
    { key: "optional_other", label: "Add other", required: false },
  ],
};

// Fields shown for user verification — ordered by importance for report quality
const VERIFY_FIELDS: {
  key: keyof ExtractedFacts;
  label: string;
  required: boolean;
  placeholder: string;
  hint?: string;
}[] = [
  {
    key: "amount_offered_or_paid",
    label: "Amount paid by insurer",
    required: true,
    placeholder: "e.g. $9,500 or 9500",
    hint: "Most important for accurate dollar estimates",
  },
  {
    key: "insurer_name",
    label: "Insurance company",
    required: true,
    placeholder: "e.g. State Farm",
  },
  {
    key: "state",
    label: "State",
    required: true,
    placeholder: "e.g. Texas",
    hint: "Needed for state-specific rights and regulator contacts",
  },
  {
    key: "date_of_loss",
    label: "Date of loss / incident",
    required: false,
    placeholder: "e.g. March 12, 2024",
  },
  {
    key: "claim_type",
    label: "What happened (claim type)",
    required: false,
    placeholder: "e.g. Hail damage to roof",
  },
  {
    key: "policy_number",
    label: "Policy number",
    required: false,
    placeholder: "e.g. HO-123456789",
  },
];

function isUnknown(v: string | undefined) {
  return !v || v === UNKNOWN || /unable to determine/i.test(v);
}

function validateFile(f: File): string | null {
  if (f.size > MAX_BYTES) return `${f.name} is larger than 10MB.`;
  const ok =
    f.type === "application/pdf" ||
    f.type === "image/jpeg" ||
    f.type === "image/png" ||
    /\.pdf$/i.test(f.name) ||
    /\.jpe?g$/i.test(f.name) ||
    /\.png$/i.test(f.name);
  if (!ok) return `${f.name} must be PDF, JPG, or PNG.`;
  return null;
}

function AnalyzingScreen({
  phase,
  uploadPct,
}: {
  phase: "upload" | "analyze";
  uploadPct: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-2">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-navy/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-navy" />
      </div>
      <h2 className="mt-6 font-display text-xl font-medium text-ink">
        {phase === "upload" ? "Uploading your documents…" : "Reading your documents…"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        {phase === "upload"
          ? "Sending files securely to our servers."
          : "Extracting key details from your policy and insurer letter. Usually 20–30 seconds."}
      </p>
      {phase === "upload" && (
        <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full rounded-full bg-navy transition-all duration-300"
            style={{ width: `${uploadPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function VerificationScreen({
  claimId,
  extractedFacts,
  onDone,
}: {
  claimId: string;
  extractedFacts: ExtractedFacts;
  onDone: () => void;
}) {
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of VERIFY_FIELDS) {
      init[f.key] = isUnknown(extractedFacts[f.key]) ? "" : (extractedFacts[f.key] ?? "");
    }
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingRequired = VERIFY_FIELDS.filter(
    (f) => f.required && !fields[f.key]?.trim()
  );

  async function confirm() {
    if (missingRequired.length > 0) {
      setError(
        `Please fill in: ${missingRequired.map((f) => f.label).join(", ")}`
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/claim/${claimId}/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmed_facts: fields }),
      });
      let j: { error?: string };
      try {
        j = await res.json();
      } catch {
        throw new Error(`Server error (${res.status}). Please try again.`);
      }
      if (!res.ok) throw new Error(j.error ?? "Could not confirm details.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const unknownCount = VERIFY_FIELDS.filter((f) =>
    isUnknown(extractedFacts[f.key])
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-lg font-medium text-ink">
          Confirm your claim details
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          We read your documents and pre-filled what we found. Check each field — especially the payment amount, which drives all the dollar calculations.
          {unknownCount > 0 && (
            <span className="text-rust font-medium">
              {" "}
              {unknownCount} field
              {unknownCount > 1 ? "s" : ""} couldn&apos;t be read — please fill
              {unknownCount > 1 ? " them" : " it"} in.
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {VERIFY_FIELDS.map((f) => {
          const wasUnknown = isUnknown(extractedFacts[f.key]);
          const isEmpty = !fields[f.key]?.trim();
          const showWarning = f.required && isEmpty;
          return (
            <div key={f.key}>
              <label
                htmlFor={`vf-${f.key}`}
                className="flex items-center gap-1.5 text-sm font-semibold text-ink"
              >
                {f.label}
                {f.required ? (
                  <span className="text-rust">*</span>
                ) : (
                  <span className="font-normal text-ink-faint">(optional)</span>
                )}
                {wasUnknown && !isEmpty && (
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
                    Entered
                  </span>
                )}
                {wasUnknown && isEmpty && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    Not found in docs
                  </span>
                )}
              </label>
              {f.hint && (
                <p className="mt-0.5 text-xs text-ink-faint">{f.hint}</p>
              )}
              <input
                id={`vf-${f.key}`}
                type="text"
                className={`mt-1.5 w-full rounded-lg border px-4 py-3 text-ink outline-none ring-navy focus:ring-2 ${
                  showWarning
                    ? "border-rust/50 bg-rust-faint/30"
                    : "border-navy/15"
                }`}
                value={fields[f.key] ?? ""}
                onChange={(e) =>
                  setFields((s) => ({ ...s, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-navy/10 bg-paper px-4 py-3 text-xs text-ink-muted leading-relaxed">
        These details are used to personalize your report and write the dispute letter. You can edit them here — they won&apos;t affect the underlying documents you uploaded.
      </div>

      <LoadingButton
        type="button"
        loading={loading}
        onClick={confirm}
        className="w-full bg-navy py-4 text-base font-semibold text-white hover:bg-navy-800"
      >
        Looks good — show my preview →
      </LoadingButton>
    </div>
  );
}

function FileSlotRow({
  def,
  files,
  onAdd,
  onRemove,
  disabled,
}: {
  def: SlotDef;
  files: File[];
  onAdd: (list: FileList | File[]) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
}) {
  const [drag, setDrag] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) onAdd(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          {def.label}
          {def.required ? (
            <span className="text-rust"> *</span>
          ) : (
            <span className="ml-1 font-normal text-ink-faint">(optional)</span>
          )}
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          drag ? "border-navy bg-navy/5" : "border-navy/20 bg-white"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          id={`slot-${def.key}`}
          disabled={disabled}
          onChange={(e) => e.target.files && onAdd(e.target.files)}
        />
        <label
          htmlFor={`slot-${def.key}`}
          className="cursor-pointer text-sm text-navy font-semibold underline-offset-2 hover:underline"
        >
          Click to upload
        </label>
        <span className="text-sm text-ink-muted">
          {" "}
          or drag and drop · PDF, JPG, PNG · max 10MB each
        </span>
        {files.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-left text-sm text-ink">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded bg-paper px-3 py-2"
              >
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-ink-faint">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  className="shrink-0 text-rust text-xs font-semibold"
                  onClick={() => onRemove(i)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AnalyzeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [claimType, setClaimType] = useState<ClaimType | null>(null);
  const [filesBySlot, setFilesBySlot] = useState<Record<string, File[]>>({});
  const [email, setEmail] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"upload" | "analyze">("upload");
  const [uploadPct, setUploadPct] = useState(0);

  // Verification state
  const [verifyData, setVerifyData] = useState<{
    id: string;
    facts: ExtractedFacts;
  } | null>(null);

  const slots = claimType ? SLOTS[claimType] : [];

  const addFiles = useCallback(
    (slotKey: string, incoming: FileList | File[]) => {
      const next: File[] = [...(filesBySlot[slotKey] ?? [])];
      const arr = Array.from(incoming);
      for (const f of arr) {
        const err = validateFile(f);
        if (err) {
          setError(err);
          return;
        }
        next.push(f);
      }
      setError(null);
      setFilesBySlot((s) => ({ ...s, [slotKey]: next }));
    },
    [filesBySlot]
  );

  const removeFile = useCallback((slotKey: string, index: number) => {
    setFilesBySlot((s) => {
      const cur = [...(s[slotKey] ?? [])];
      cur.splice(index, 1);
      return { ...s, [slotKey]: cur };
    });
  }, []);

  function validateStep(): string | null {
    if (step === 1 && !claimType) return "Choose Home, Auto, or Health.";
    if (step === 2 && claimType) {
      for (const d of SLOTS[claimType]) {
        if (d.required && (filesBySlot[d.key]?.length ?? 0) === 0) {
          return `Add at least one file for: ${d.label}.`;
        }
      }
    }
    if (step === 3) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Enter a valid email address.";
    }
    return null;
  }

  function postFormData(fd: FormData): Promise<{
    id: string;
    needs_verification?: boolean;
    needs_clarification?: boolean;
    extracted_facts?: ExtractedFacts;
  }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/analyze");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setUploadPct(Math.round((e.loaded / e.total) * 100));
      };
      xhr.upload.addEventListener("load", () => {
        setUploadPhase("analyze");
        setUploadPct(100);
      });
      xhr.onload = () => {
        try {
          const j = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) resolve(j);
          else reject(new Error(j.error ?? "Request failed."));
        } catch {
          reject(new Error("Invalid response from server."));
        }
      };
      xhr.onerror = () => reject(new Error("Network error."));
      xhr.send(fd);
    });
  }

  async function submit() {
    const v = validateStep();
    if (v) {
      setError(v);
      return;
    }
    if (!claimType) return;

    setLoading(true);
    setError(null);
    setUploadPhase("upload");
    setUploadPct(0);

    try {
      const fd = new FormData();
      fd.append("insurance_type", claimType);
      fd.append("email", email.trim().toLowerCase());
      fd.append("mode", "extract_only"); // New: extract first, show verification before preview
      for (const d of SLOTS[claimType]) {
        const files = filesBySlot[d.key] ?? [];
        for (const f of files) fd.append(d.key, f);
      }

      const data = await postFormData(fd);

      if (data.needs_verification && data.extracted_facts) {
        // Show verification step
        setVerifyData({ id: data.id, facts: data.extracted_facts });
        setLoading(false);
      } else {
        // Legacy flow fallback
        router.push(`/preview/${data.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const progress = useMemo(() => Math.round((step / STEPS) * 100), [step]);

  if (loading) {
    return <AnalyzingScreen phase={uploadPhase} uploadPct={uploadPct} />;
  }

  // Step 4: Verification form
  if (verifyData) {
    return (
      <div className="mt-10">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-ink-muted">
            <span>Step 4 of 4 — Confirm details</span>
            <span>Almost there</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy/10">
            <div
              className="h-full rounded-full bg-navy transition-all duration-300"
              style={{ width: "90%" }}
            />
          </div>
        </div>
        <VerificationScreen
          claimId={verifyData.id}
          extractedFacts={verifyData.facts}
          onDone={() => router.push(`/preview/${verifyData.id}`)}
        />
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-ink-muted">
          <span>
            Step {step} of {STEPS}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full rounded-full bg-navy transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-6 rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust"
          role="alert"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="font-display text-lg font-medium text-ink">
            What kind of claim is this?
          </p>
          <p className="text-sm text-ink-muted">
            Pick one. You can go back and change it later.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["Home", "Auto", "Health"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setClaimType(t);
                  setFilesBySlot({});
                }}
                className={`min-h-[120px] rounded-xl border-2 px-4 py-8 text-center text-xl font-semibold transition ${
                  claimType === t
                    ? "border-navy bg-navy text-white shadow-sm"
                    : "border-navy/15 bg-white text-navy hover:border-navy/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && claimType && (
        <div className="space-y-6">
          <p className="font-display text-lg font-medium text-ink">
            Upload your documents
          </p>
          <p className="text-sm text-ink-muted">
            Optional documents increase analysis accuracy.
          </p>

          <div className="rounded-lg border border-teal-700/20 bg-teal-50/90 px-4 py-3 text-xs text-teal-950">
            <strong>Your files are secure.</strong> Encrypted in transit; deleted
            within 24 hours. Not sold or shared.
          </div>

          {slots.map((def) => (
            <FileSlotRow
              key={def.key}
              def={def}
              files={filesBySlot[def.key] ?? []}
              onAdd={(list) => addFiles(def.key, list)}
              onRemove={(i) => removeFile(def.key, i)}
              disabled={loading}
            />
          ))}

          <div className="rounded-lg border border-navy/10 bg-paper">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy"
              onClick={() => setFaqOpen(!faqOpen)}
            >
              Why do we need these documents?
              <span className="text-ink-faint">{faqOpen ? "−" : "+"}</span>
            </button>
            {faqOpen && (
              <div className="border-t border-navy/10 px-4 py-3 text-sm text-ink-muted leading-relaxed">
                <p className="mb-2">
                  We match the rules in your policy or plan against the letter or
                  payment notice from the company. Without both, we cannot see
                  what they promised you versus what they actually paid.
                </p>
                <p>
                  Extras like estimates, photos, or bills help us tighten the
                  dollar estimate when the main documents are vague.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <p className="font-display text-lg font-medium text-ink">
            Where should we send your results?
          </p>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-navy/15 px-4 py-3 text-ink outline-none ring-navy focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            We will email your full report link after payment if you choose to
            unlock it. This preview is free.
          </p>
          <div className="rounded-lg border border-navy/10 bg-paper px-4 py-3 text-xs text-ink-muted">
            By continuing, you agree this tool gives{" "}
            <strong className="text-ink">informational analysis only</strong> —
            not legal advice. Recovery is not guaranteed.
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            setError(null);
            if (step > 1) setStep((s) => s - 1);
          }}
          disabled={step === 1 || loading}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-ink-muted hover:text-navy disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS ? (
          <LoadingButton
            type="button"
            loading={false}
            onClick={() => {
              const v = validateStep();
              if (v) {
                setError(v);
                return;
              }
              setStep((s) => s + 1);
            }}
            className="bg-navy px-8 py-3 text-white shadow-sm hover:bg-navy-800"
          >
            Continue
          </LoadingButton>
        ) : (
          <LoadingButton
            type="button"
            loading={loading}
            onClick={submit}
            className="bg-navy px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-navy-800"
          >
            Get Free Preview →
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
