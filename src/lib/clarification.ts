import type { ClarificationQuestion, ExtractedFacts } from "./types";
import { parseOfferNumber } from "./anthropic";

const UNKNOWN = "Unable to determine from provided documents";

export function buildClarificationQuestions(extracted: ExtractedFacts): ClarificationQuestion[] {
  const q: ClarificationQuestion[] = [];

  const offerMissing =
    !extracted.amount_offered_or_paid?.trim() ||
    extracted.amount_offered_or_paid === UNKNOWN ||
    parseOfferNumber(extracted.amount_offered_or_paid) === 0;

  if (offerMissing) {
    q.push({
      id: "amount_offered_or_paid",
      critical: true,
      question:
        "What dollar amount did the insurance company offer or pay you? If nothing has been paid yet, enter 0 and add one short sentence in the next box if needed.",
    });
  }

  if (!extracted.state?.trim() || extracted.state === UNKNOWN) {
    q.push({
      id: "state",
      critical: true,
      question: "What U.S. state is your policy issued in? (This affects where to send complaints.)",
    });
  }

  if (!extracted.date_of_loss?.trim() || extracted.date_of_loss === UNKNOWN) {
    q.push({
      id: "date_of_loss",
      critical: false,
      question: "What is the date of the loss, damage, or medical service? (Best estimate is fine.)",
    });
  }

  if (!extracted.policy_number?.trim() || extracted.policy_number === UNKNOWN) {
    q.push({
      id: "policy_number",
      critical: false,
      question: "What is your policy or member ID number, if you know it?",
    });
  }

  return q;
}

export function needsCriticalClarification(questions: ClarificationQuestion[]): boolean {
  return questions.some((x) => x.critical);
}
