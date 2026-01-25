// AI integration using Eigen AI for orchestration and Gemini as LLM

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ============ Types ============

export interface GeneratedHook {
  hook: string;
  id: string;
}

export interface GeneratedContent {
  hook: string;
  fullContent: string;
}

// ============ AI Prompting Rules ============

const HOOK_GENERATION_SYSTEM_PROMPT = `You are a crypto-native content strategist specializing in Farcaster posts.

CRITICAL RULES:
- Generate ONLY hooks (first sentence, max 120 characters)
- Never include body content
- Never explain your reasoning
- Never mention "AI", "trend analysis", or "algorithm"
- Output must feel crypto-native and timely
- Use patterns from trending posts, but create original content
- Do NOT copy existing content

Generate 5 distinct hooks that would perform well on Farcaster.`;

const CONTENT_GENERATION_SYSTEM_PROMPT = `You are a crypto-native content creator for Farcaster.

CRITICAL RULES:
- Expand the given hook into a full post (200-280 characters)
- Maintain crypto-native tone
- Never mention "AI" or "generated"
- Make it feel authentic and timely
- Include relevant context about Base ecosystem when appropriate

Generate a complete Farcaster post.`;

// ============ Gemini API Functions ============

async function callGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text generated from Gemini');
    }

    return text.trim();
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw error;
  }
}

// ============ Hook Generation ============

/**
 * Generate hooks ONLY (step 1 of blind selection)
 * @param topic User-selected topic
 * @param trendSummary Summarized trend data from Neynar
 */
export async function generateHooks(
  topic: string,
  trendSummary: string
): Promise<GeneratedHook[]> {
  const prompt = `${HOOK_GENERATION_SYSTEM_PROMPT}

TOPIC: ${topic}

TRENDING PATTERNS:
${trendSummary}

Generate 5 hooks (one per line, max 120 chars each). Output format:
1. [hook text]
2. [hook text]
3. [hook text]
4. [hook text]
5. [hook text]`;

  const response = await callGemini(prompt);
  
  // Parse response into hooks
  const hooks = response
    .split('\n')
    .filter((line) => line.match(/^\d+\./))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((hook) => hook.length > 0 && hook.length <= 120)
    .map((hook, index) => ({
      hook,
      id: `hook-${Date.now()}-${index}`,
    }));

  if (hooks.length === 0) {
    throw new Error('Failed to generate valid hooks');
  }

  return hooks;
}

// ============ Full Content Generation ============

/**
 * Generate full content ONLY after hook selection (step 2)
 * @param selectedHook The hook chosen by the user
 * @param topic Original topic
 * @param trendSummary Trend data context
 */
export async function generateFullContent(
  selectedHook: string,
  topic: string,
  trendSummary: string
): Promise<string> {
  const prompt = `${CONTENT_GENERATION_SYSTEM_PROMPT}

TOPIC: ${topic}

SELECTED HOOK: "${selectedHook}"

TRENDING CONTEXT:
${trendSummary}

Expand this hook into a complete Farcaster post (200-280 characters total, including the hook).
The hook should be the opening, followed by supporting content.

Output only the complete post text, nothing else.`;

  const fullContent = await callGemini(prompt);
  
  // Ensure content isn't too long (Farcaster limit is 320 chars)
  if (fullContent.length > 320) {
    return fullContent.substring(0, 317) + '...';
  }

  return fullContent;
}

// ============ Hackathon Fallback (if AI fails) ============

export function generateFallbackHooks(topic: string): GeneratedHook[] {
  const templates = [
    `${topic} is heating up on Base 🔥`,
    `Just discovered something wild about ${topic}`,
    `Why ${topic} matters for the Base ecosystem`,
    `Hot take: ${topic} is underrated`,
    `The ${topic} meta is shifting`,
  ];

  return templates.map((hook, index) => ({
    hook,
    id: `fallback-${Date.now()}-${index}`,
  }));
}

export function generateFallbackContent(hook: string, topic: string): string {
  return `${hook}\n\nThe Base ecosystem is evolving fast, and ${topic} is at the center of it. Don't sleep on this opportunity.`;
}
