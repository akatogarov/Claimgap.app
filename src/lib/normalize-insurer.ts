/**
 * Normalize insurer names so "State Farm Mutual Auto" and "State Farm" map to the same key.
 * Used for aggregated analytics — never shown to users in place of the original name.
 */

const ALIASES: [RegExp, string][] = [
  [/state\s*farm/i, "State Farm"],
  [/geico|government employees ins/i, "GEICO"],
  [/allstate/i, "Allstate"],
  [/progressive/i, "Progressive"],
  [/usaa/i, "USAA"],
  [/farmers/i, "Farmers"],
  [/nationwide/i, "Nationwide"],
  [/liberty\s*mutual/i, "Liberty Mutual"],
  [/travelers/i, "Travelers"],
  [/american\s*family/i, "American Family"],
  [/auto[\s-]*owners/i, "Auto-Owners"],
  [/erie\s*ins/i, "Erie Insurance"],
  [/hartford/i, "The Hartford"],
  [/chubb/i, "Chubb"],
  [/aig/i, "AIG"],
  [/metlife/i, "MetLife"],
  [/prudential/i, "Prudential"],
  [/aetna/i, "Aetna"],
  [/cigna/i, "Cigna"],
  [/united\s*health/i, "UnitedHealth"],
  [/humana/i, "Humana"],
  [/anthem/i, "Anthem"],
  [/blue\s*cross|bcbs|blue\s*shield/i, "Blue Cross Blue Shield"],
  [/kaiser/i, "Kaiser Permanente"],
  [/paramount/i, "Paramount Insurance"],
  [/safeco/i, "Safeco"],
  [/esurance/i, "Esurance"],
  [/21st\s*century/i, "21st Century"],
  [/mercury\s*ins/i, "Mercury Insurance"],
  [/bristol\s*west/i, "Bristol West"],
  [/lemonade/i, "Lemonade"],
  [/root\s*ins/i, "Root Insurance"],
  [/hippo/i, "Hippo"],
  [/unable to determine|unknown/i, "Unknown"],
];

export function normalizeInsurer(raw: string): string {
  if (!raw?.trim()) return "Unknown";
  const s = raw.trim();
  for (const [re, canonical] of ALIASES) {
    if (re.test(s)) return canonical;
  }
  // Fallback: capitalize words, remove trailing legal suffixes
  return s
    .replace(/\b(inc|llc|corp|co|ltd|mutual|insurance|ins|group|company)\.?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
}
