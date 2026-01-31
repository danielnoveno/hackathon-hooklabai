import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('text, total_engagement, author_display_name, author_username, author_pfp_url, timestamp, hash')
            .order('total_engagement', { ascending: false })
            .limit(6); // Get top 6 posts

        if (error) {
            console.error('❌ Supabase Error fetching posts:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ posts: posts || [] });
    } catch (error: any) {
        console.error('❌ Error fetching posts:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
