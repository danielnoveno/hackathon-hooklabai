import { NextRequest, NextResponse } from 'next/server';
import { checkPremiumStatus } from '@/lib/contract';
import { getUserQuota, deductQuota, logUsage } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, selectedHook, topic } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Check premium status from contract
    const isPremium = await checkPremiumStatus(walletAddress as `0x${string}`);

    if (isPremium) {
      // Premium users have unlimited quota
      // Still log usage for analytics
      if (selectedHook && topic) {
        await logUsage(walletAddress, topic, selectedHook);
      }

      return NextResponse.json({
        success: true,
        isPremium: true,
        remainingCredits: -1, // -1 indicates unlimited
        message: 'Premium user - unlimited access',
      });
    }

    // Free user - check and deduct quota
    const currentQuota = await getUserQuota(walletAddress);

    if (currentQuota <= 0) {
      return NextResponse.json(
        {
          error: 'Insufficient quota',
          isPremium: false,
          remainingCredits: 0,
          message: 'Subscribe to get unlimited access',
        },
        { status: 403 }
      );
    }

    // Deduct quota
    const newQuota = await deductQuota(walletAddress);

    // Log usage
    if (selectedHook && topic) {
      await logUsage(walletAddress, topic, selectedHook);
    }

    return NextResponse.json({
      success: true,
      isPremium: false,
      remainingCredits: newQuota,
      message: `Quota deducted. ${newQuota} credits remaining.`,
    });
  } catch (error: any) {
    console.error('Quota API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Check premium status
    const isPremium = await checkPremiumStatus(walletAddress as `0x${string}`);

    if (isPremium) {
      return NextResponse.json({
        isPremium: true,
        remainingCredits: -1, // Unlimited
      });
    }

    // Get quota for free users
    const quota = await getUserQuota(walletAddress);

    return NextResponse.json({
      isPremium: false,
      remainingCredits: quota,
    });
  } catch (error: any) {
    console.error('Quota GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
