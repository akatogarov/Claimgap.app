"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "./LoadingButton";

type ClaimType = "Home" | "Auto" | "Health";

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

function AnalyzingScreen({ phase, uploadPct }: { phase: "upload" | "analyze"; uploadPct: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-2">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-navy/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-navy" />
      </div>
      <h2 className="mt-6 font-display text-xl font-medium text-ink">
        {phase === "upload" ? "Uploading your documents…" : "Analyzing documents…"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        {phase === "upload"
          ? "Sending files securely to our servers."
          : "Usually 30–60 seconds. We read every page and compare it to your other uploads."}
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
        <span className="text-sm text-ink-muted"> or drag and drop · PDF, JPG, PNG · max 10MB each</span>
        {files.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-left text-sm text-ink">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded bg-paper px-3 py-2">
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-ink-faint">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
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

  const slots = claimType ? SLOTS[claimType] : [];

  const addFiles = useCallback((slotKey: string, incoming: FileList | File[]) => {
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
  }, [filesBySlot]);

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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    }
    return null;
  }

  function postFormData(fd: FormData): Promise<{ id: string; needs_clarification?: boolean }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/analyze");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
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
      for (const d of SLOTS[claimType]) {
        const files = filesBySlot[d.key] ?? [];
        for (const f of files) fd.append(d.key, f);
      }

      const data = await postFormData(fd);
      router.push(`/preview/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const progress = useMemo(() => Math.round((step / STEPS) * 100), [step]);

  if (loading) {
    return <AnalyzingScreen phase={uploadPhase} uploadPct={uploadPct} />;
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
          <div className="h-full rounded-full bg-navy transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rust/30 bg-rust-faint px-4 py-3 text-sm text-rust" role="alert">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="font-display text-lg font-medium text-ink">What kind of claim is this?</p>
          <p className="text-sm text-ink-muted">Pick one. You can go back and change it later.</p>
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
                  claimType === t ? "border-navy bg-navy text-white shadow-sm" : "border-navy/15 bg-white text-navy hover:border-navy/30"
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
          <p className="font-display text-lg font-medium text-ink">Upload your documents</p>
          <p className="text-sm text-ink-muted">Optional documents increase analysis accuracy.</p>

          <div className="rounded-lg border border-teal-700/20 bg-teal-50/90 px-4 py-3 text-xs text-teal-950">
            <strong>Your files are secure.</strong> Encrypted in transit; deleted within 24 hours. Not sold or shared.
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
                  We match the rules in your policy or plan against the letter or payment notice from the company. Without both, we
                  cannot see what they promised you versus what they actually paid.
                </p>
                <p>
                  Extras like estimates, photos, or bills help us tighten the dollar estimate when the main documents are vague.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <p className="font-display text-lg font-medium text-ink">Where should we send your results?</p>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink">
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
            We will email your full report link after payment if you choose to unlock it. This preview is free.
          </p>
          <div className="rounded-lg border border-navy/10 bg-paper px-4 py-3 text-xs text-ink-muted">
            By continuing, you agree this tool gives{" "}
            <strong className="text-ink">informational analysis only</strong> — not legal advice. Recovery is not guaranteed.
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
