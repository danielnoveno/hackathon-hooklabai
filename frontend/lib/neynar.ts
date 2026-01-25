// Neynar API integration for Farcaster data

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

// ============ Types ============

export interface FarcasterPost {
  hash: string;
  text: string;
  author: {
    username: string;
    display_name: string;
    follower_count: number;
  };
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
  timestamp: string;
}

export interface HookPattern {
  hook: string;
  strength: number;
  engagement: number;
}

// ============ API Functions ============

/**
 * Fetch trending posts from Base channel on Farcaster
 * @param limit Number of posts to fetch (default: 50)
 */
export async function fetchBaseTrendingPosts(
  limit: number = 50
): Promise<FarcasterPost[]> {
  try {
    // Fetch posts from Base channel
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/feed/channels?channel_ids=base&limit=${limit}&with_recasts=false`,
      {
        headers: {
          'api_key': NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform to our format
    return data.casts?.map((cast: any) => ({
      hash: cast.hash,
      text: cast.text,
      author: {
        username: cast.author.username,
        display_name: cast.author.display_name,
        follower_count: cast.author.follower_count || 1,
      },
      reactions: {
        likes_count: cast.reactions?.likes_count || 0,
        recasts_count: cast.reactions?.recasts_count || 0,
      },
      replies: {
        count: cast.replies?.count || 0,
      },
      timestamp: cast.timestamp,
    })) || [];
  } catch (error) {
    console.error('Error fetching Neynar data:', error);
    throw error;
  }
}

/**
 * Calculate hook strength based on engagement metrics
 * Formula: (likes + recasts + replies) / follower_count
 */
export function calculateHookStrength(post: FarcasterPost): number {
  const totalEngagement =
    post.reactions.likes_count +
    post.reactions.recasts_count +
    post.replies.count;

  const followerCount = Math.max(post.author.follower_count, 1);
  
  return totalEngagement / followerCount;
}

/**
 * Extract hook (first sentence or ≤120 chars) from post text
 */
export function extractHook(text: string): string {
  // Try to get first sentence
  const firstSentence = text.split(/[.!?]\s/)[0];
  
  // If first sentence is too long, truncate to 120 chars
  if (firstSentence.length <= 120) {
    return firstSentence;
  }
  
  return text.substring(0, 120).trim() + '...';
}

/**
 * Analyze posts and extract high-performing hook patterns
 */
export function extractHookPatterns(
  posts: FarcasterPost[]
): HookPattern[] {
  return posts
    .map((post) => {
      const hook = extractHook(post.text);
      const strength = calculateHookStrength(post);
      const engagement =
        post.reactions.likes_count +
        post.reactions.recasts_count +
        post.replies.count;

      return { hook, strength, engagement };
    })
    .filter((pattern) => pattern.engagement > 0)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 20); // Top 20 patterns
}

/**
 * Summarize trend data for AI consumption
 */
export function summarizeTrendData(posts: FarcasterPost[]): string {
  const patterns = extractHookPatterns(posts);
  
  if (patterns.length === 0) {
    return 'No trending patterns found. Generate generic crypto-native hooks.';
  }

  const topPatterns = patterns.slice(0, 10);
  
  const summary = topPatterns
    .map((p, i) => `${i + 1}. "${p.hook}" (strength: ${p.strength.toFixed(3)})`)
    .join('\n');

  return `Top performing hook patterns from Base channel:\n${summary}\n\nUse these patterns as inspiration for structure and tone, but generate original content.`;
}
