import { NextRequest, NextResponse } from 'next/server';
import { checkPremiumStatus, getPremiumExpiry } from '@/lib/contract';
import { updatePremiumStatus } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Read premium status from contract
    const isPremium = await checkPremiumStatus(walletAddress as `0x${string}`);
    const expiryTimestamp = await getPremiumExpiry(walletAddress as `0x${string}`);

    // Update Supabase with contract state
    await updatePremiumStatus(walletAddress, isPremium, expiryTimestamp);

    return NextResponse.json({
      success: true,
      isPremium,
      expiryTimestamp,
      expiryDate: expiryTimestamp > 0 
        ? new Date(expiryTimestamp * 1000).toISOString() 
        : null,
    });
  } catch (error: any) {
    console.error('Premium verification API error:', error);
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

    // Read premium status from contract
    const isPremium = await checkPremiumStatus(walletAddress as `0x${string}`);
    const expiryTimestamp = await getPremiumExpiry(walletAddress as `0x${string}`);

    return NextResponse.json({
      isPremium,
      expiryTimestamp,
      expiryDate: expiryTimestamp > 0 
        ? new Date(expiryTimestamp * 1000).toISOString() 
        : null,
    });
  } catch (error: any) {
    console.error('Premium verification GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
