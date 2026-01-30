
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase URL or Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing Supabase Connection...");
    console.log("URL:", supabaseUrl);

    try {
        const { data, error } = await supabase
            .from('posts')
            .select('text, total_engagement, author_display_name')
            .order('total_engagement', { ascending: false })
            .limit(5);

        if (error) {
            console.error("❌ Supabase Error:", error.message);
            return;
        }

        console.log(`✅ Connection Successful! Found ${data.length} posts.`);
        console.log("Top Post:", data[0]);

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testConnection();
