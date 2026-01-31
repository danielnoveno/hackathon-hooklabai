import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ history: data });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { walletAddress, prompt } = await request.json();

    if (!walletAddress || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('history')
      .insert([{ wallet_address: walletAddress, prompt: prompt, media_url: null }])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ historyId: data.id });
  } catch (error: any) {
    console.error('Error saving initial history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
