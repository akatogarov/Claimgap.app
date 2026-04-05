export type InsuranceType = "Auto" | "Home" | "Health";

export type ClaimStatus = "preview" | "paid" | "failed" | "awaiting_clarification" | "awaiting_verification";

/** Facts taken from documents (or placeholders). */
export interface ExtractedFacts {
  insurer_name: string;
  policy_number: string;
  claimant_name: string;
  state: string;
  date_of_loss: string;
  claim_type: string;
  amount_offered_or_paid: string;
  denial_or_settlement_basis: string;
  coverage_limits: string;
  deductibles: string;
  exclusions_cited: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  critical: boolean;
}

/** Free preview only — teaser fields; no scripts, quotes, or legal positioning. */
export interface PreviewGapArea {
  title: string;
  /** 2–3 sentences max; high level only */
  brief_explanation: string;
  estimated_gap_upper: number;
  gap_anchor_label: string;
  /** @deprecated Older previews */
  what_insurer_did?: string;
  policy_quote?: string;
  why_may_be_wrong?: string;
  strength_of_case?: "Strong" | "Medium" | "Developing";
  what_to_say?: string;
}

export interface PreviewAnalysis {
  teaser_summary: string;
  extracted: ExtractedFacts;
  underpayment_areas: PreviewGapArea[];
  /** Total estimated underpayment range (preview). */
  missed_amount_low: number;
  missed_amount_high: number;
  /** @deprecated Omit in new previews — paid report has full strength analysis */
  overall_strength?: "Strong" | "Medium" | "Developing";
  /** Short labels (e.g. for compact lists). */
  preview_areas: string[];
}

export interface GapArea {
  area: string;
  what_insurer_did?: string;
  policy_says: string;
  policy_quote?: string;
  offered?: string;
  why_may_be_wrong?: string;
  gap?: string;
  estimated_gap_upper?: number;
  gap_anchor_label?: string;
  strength_of_case?: "Strong" | "Medium" | "Developing";
  what_to_say?: string;
  missed_low?: number;
  missed_high?: number;
}

export interface MissedMoney {
  total_payout_received: number;
  expected_payout: number;
  missed_amount_low: number;
  missed_amount_high: number;
  strength_of_case?: "Strong" | "Medium" | "Developing";
  reasons: string[];
  /** @deprecated Older stored reports only */
  confidence_score?: number;
}

export interface FullAnalysis {
  /** When set, this is the primary paid deliverable (sections 1–7). */
  report_markdown?: string;
  missed_money: MissedMoney;
  policy_coverage: {
    summary: string;
    key_provisions: string[];
    relevant_quotes: string[];
  };
  gap_analysis: {
    summary: string;
    underpayment_areas: GapArea[];
    estimated_gap_min: number;
    estimated_gap_max: number;
  };
  /** @deprecated Use missed_money.strength_of_case; kept for older rows */
  probability_score?: {
    score: number;
    reasoning: string;
    confidence: string;
  };
  counter_offer_letter: {
    subject: string;
    body: string;
  };
  escalation_plan: {
    day_1?: string;
    day_7: string;
    day_14: string;
    day_21: string;
    commissioner_template: string;
  };
  disclaimer: string;
}

export interface StoredAnalysis {
  preview: PreviewAnalysis | null;
  full: FullAnalysis | null;
  /** Persisted for post-payment full analysis (truncated server-side). */
  extracted?: {
    policy_text: string;
    settlement_text: string;
    optional_context?: string;
  };
  extracted_facts?: ExtractedFacts;
  clarification?: {
    pending: boolean;
    questions: ClarificationQuestion[];
  };
  /** ISO timestamp set when the claim moves to paid status. Used by outcome reminder cron. */
  paid_at?: string;
}

export interface ClaimRow {
  id: string;
  email: string;
  insurance_type: string;
  insurer: string;
  state: string;
  description: string;
  offer_amount: number | null;
  status: ClaimStatus;
  stripe_session_id: string | null;
  analysis: StoredAnalysis | null;
  created_at: string;
}
