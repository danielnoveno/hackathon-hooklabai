export const TOPIC_PROMPTS = {
  'NFT':
    "Write a social media post announcing that I just minted a custom NFT. Mention that its DNA was generated from my Farcaster profile and include a call to action for others to join the 'Warplet' family.",

  'Web3 Update':
    "Write a bulleted update about Farcaster's new Solana integration. Include details on wallet and mini app support, instant bridging for Solana tokens, and a recommendation to fund SOL for increased airdrop chances.",

  'Platform Update':
    "Write an announcement about changes to a platform's creator reward program that mentions the discontinuation of the current version, its past payouts, and the strategic reason for the change.",

  'Seasonal Greeting':
    "Write a brief post for a holiday greeting from [Your Company/Project Name].",

  'Founder Profile':
    "Write a concise founder spotlight post introducing a web3 entrepreneur. Include their name, their company, their journey from a crypto experiment to building a significant project, and what they built for the community.",

  'Inspiration':
    "Write a short, optimistic social media post about new beginnings, opportunities, and the importance of seizing them.",

  'Community':
    "Write a short social media post about a specific holiday greeting that mentions a blockchain project as the sender.",

  'Product Update':
    "Write a social media post about a product update, indicating ongoing development and future features, and conclude with a call for user feedback on top requests."
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
