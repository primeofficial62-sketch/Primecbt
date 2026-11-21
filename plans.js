export const PLANS = {
  free: {
    enabled: true,
    ai_explanations: 3,
    practice: {
      general:  { sessions: 2, max_questions: 20 },
      quick:    { sessions: 1 },
      topic:    { sessions: 2 },
      timed:    { sessions: 1 },
      mock:     { sessions: 1 },
      past:     { sessions: 1 },
    },
  },
  pro: { enabled: false /* filled in later */ },
};
export const PRO_BENEFITS = [
  "30 AI explanations daily",
  "More practice sessions in every mode",
  "AI revision notes & expanded summaries",
  "Offline learning packs",
  "Advanced analytics",
];