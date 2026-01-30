import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPosts() {
    console.log("🌱 Starting to seed posts from analyzed_posts.json...");

    try {
        // Read the analyzed posts file
        const dataPath = path.resolve(__dirname, '../../data/analyzed_posts.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        if (!data.posts || !Array.isArray(data.posts)) {
            console.error("❌ Invalid data format in analyzed_posts.json");
            process.exit(1);
        }

        console.log(`📊 Found ${data.posts.length} posts to process`);

        // Transform posts to match our schema
        const postsToInsert = data.posts.map((post: any) => ({
            hash: post.hash,
            text: post.text,
            author_display_name: post.author?.display_name || 'Unknown',
            author_username: post.author?.username || 'unknown',
            author_pfp_url: post.author?.pfp_url || null,
            author_fid: post.author?.fid || null,
            timestamp: post.timestamp,
            total_engagement: post.metrics?.totalEngagement || 0,
            likes_count: post.metrics?.likes || 0,
            recasts_count: post.metrics?.recasts || 0,
            replies_count: post.metrics?.replies || 0,
            category: post.category || null
        }));

        // Insert in batches to avoid timeout
        const batchSize = 100;
        let inserted = 0;
        let skipped = 0;

        for (let i = 0; i < postsToInsert.length; i += batchSize) {
            const batch = postsToInsert.slice(i, i + batchSize);

            const { data: result, error } = await supabase
                .from('posts')
                .upsert(batch, {
                    onConflict: 'hash',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
                skipped += batch.length;
            } else {
                inserted += batch.length;
                console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} posts)`);
            }
        }

        console.log("\n🎉 Seeding complete!");
        console.log(`✅ Successfully inserted/updated: ${inserted} posts`);
        console.log(`⚠️ Skipped: ${skipped} posts`);

        // Verify the data
        const { data: verifyData, error: verifyError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        if (!verifyError) {
            console.log(`\n📊 Total posts in database: ${verifyData?.length || 0}`);
        }

    } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        process.exit(1);
    }
}

seedPosts();
