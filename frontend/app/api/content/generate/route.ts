import { NextRequest, NextResponse } from 'next/server';
import { fetchBaseTrendingPosts, summarizeTrendData } from '@/lib/neynar';
import { generateFullContent, generateFallbackContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { selectedHook, topic } = await request.json();

    if (!selectedHook || !topic) {
      return NextResponse.json(
        { error: 'Selected hook and topic required' },
        { status: 400 }
      );
    }

    // Fetch trend data for context
    let trendSummary = '';
    try {
      const trendingPosts = await fetchBaseTrendingPosts(50);
      trendSummary = summarizeTrendData(trendingPosts);
    } catch (error) {
      console.error('Error fetching Neynar data:', error);
      trendSummary = 'No trend data available.';
    }

    // Generate full content using AI
    let fullContent;
    try {
      fullContent = await generateFullContent(selectedHook, topic, trendSummary);
    } catch (error) {
      console.error('Error generating full content with AI:', error);
      // Fallback to template-based content
      fullContent = generateFallbackContent(selectedHook, topic);
    }

    return NextResponse.json({
      success: true,
      fullContent,
      hook: selectedHook,
    });
  } catch (error: any) {
    console.error('Content generation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
