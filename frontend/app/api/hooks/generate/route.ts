import { NextRequest, NextResponse } from 'next/server';
import { fetchBaseTrendingPosts, summarizeTrendData } from '@/lib/neynar';
import { generateHooks, generateFallbackHooks } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic required' },
        { status: 400 }
      );
    }

    // Fetch trending posts from Neynar
    let trendSummary = '';
    try {
      const trendingPosts = await fetchBaseTrendingPosts(50);
      trendSummary = summarizeTrendData(trendingPosts);
    } catch (error) {
      console.error('Error fetching Neynar data:', error);
      trendSummary = 'Unable to fetch trend data. Generate generic hooks.';
    }

    // Generate hooks using AI
    let hooks;
    try {
      hooks = await generateHooks(topic, trendSummary);
    } catch (error) {
      console.error('Error generating hooks with AI:', error);
      // Fallback to template-based hooks
      hooks = generateFallbackHooks(topic);
    }

    return NextResponse.json({
      success: true,
      hooks,
      trendDataAvailable: trendSummary !== 'Unable to fetch trend data. Generate generic hooks.',
    });
  } catch (error: any) {
    console.error('Hook generation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
