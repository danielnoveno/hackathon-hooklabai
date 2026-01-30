export const TOPIC_PROMPTS = {
  Holiday:
    "Write a short, viral hook about holidays that feels emotional, fun, and relatable.",

  Travel:
    "Generate a viral travel hook that sparks curiosity and makes people want to explore new places.",

  Business:
    "Create a high-performing business hook that challenges common assumptions and feels insightful.",

  Tech:
    "Write a viral tech hook that sounds smart but simple, focused on AI or trends.",

  Lifestyle:
    "Generate a lifestyle hook that feels personal, relatable, and aspirational.",

  Finance:
    "Create a finance hook that triggers curiosity or fear of missing out about money.",

  Health:
    "Write a health hook that feels practical, surprising, and easy to understand."
} as const;

export type TopicKey = keyof typeof TOPIC_PROMPTS;

export type PromptOptions = {
  tone: 'casual' | 'professional' | 'provocative';
  length: 'short' | 'medium';
  platform: 'LinkedIn' | 'Twitter';
};

export function buildPrompt(
  topic: TopicKey,
  options: PromptOptions
) {
  return `
Generate a ${options.length} ${options.tone} hook for ${options.platform}.
Topic: ${topic}

Rules:
- First sentence must stop scrolling
- No emojis
- Simple language
- Sounds human

Output only the hook text.
`;
}
