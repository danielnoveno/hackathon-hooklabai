
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'frontend', '.env.local') });

const INPUT_FILE = path.join(process.cwd(), 'data/posts.json');
const OUTPUT_FILE = path.join(process.cwd(), 'data/analyzed_posts.json');

async function main() {
    console.log("🚀 Starting Data Analysis with AI Prompts...");

    if (!fs.existsSync(INPUT_FILE)) {
        console.error("❌ Input file not found:", INPUT_FILE);
        process.exit(1);
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const jsonData = JSON.parse(rawData);

    if (!jsonData.posts || !Array.isArray(jsonData.posts)) {
        console.error("❌ Invalid JSON format in posts.json");
        process.exit(1);
    }

    // 1. Sort by Engagement
    const sortedPosts = jsonData.posts.sort((a: any, b: any) => {
        const engageA = (a.metrics?.totalEngagement || 0);
        const engageB = (b.metrics?.totalEngagement || 0);
        return engageB - engageA;
    });

    const postsToAnalyze = sortedPosts.slice(0, 15); // Analyze top 15
    console.log(`🔍 Analyzing top ${postsToAnalyze.length} posts...`);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const analyzedPosts = [];
    // Store valid prompts for each category. Key = Category Name, Value = Prompt String
    const categoryPrompts = new Map<string, string>();

    for (const post of postsToAnalyze) {
        if (!post.text) continue;

        const prompt = `
    Analyze this post and provide:
    1. A Category (e.g. Meme, DeFi, Advice, etc.)
    2. A "Suggested Prompt" that a user would type to generate content like this.

    POST: "${post.text.substring(0, 300)}"...

    Output STRICT JSON:
    {
      "category": "CategoryName",
      "suggestedPrompt": "Write a [format] about [topic] that mentions [key elements]..."
    }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
            const json = JSON.parse(text);

            const category = json.category || "Uncategorized";
            const userPrompt = json.suggestedPrompt || "Write a viral post about this.";

            console.log(`✅ [${category}]: ${userPrompt.substring(0, 40)}...`);

            analyzedPosts.push({
                ...post,
                category: category
            });

            // Only save the first (likely best/most viral) prompt we find for this category
            if (!categoryPrompts.has(category)) {
                categoryPrompts.set(category, userPrompt);
            }

            await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit

        } catch (error) {
            console.error(`⚠️ Failed to analyze post:`, error);
            analyzedPosts.push({ ...post, category: "Uncategorized" });
        }
    }

    // Convert Map to Array of Objects
    const categoriesList = Array.from(categoryPrompts.entries()).map(([name, prompt]) => ({
        name,
        prompt
    }));

    const resultData = {
        timestamp: new Date().toISOString(),
        categories: categoriesList, // Now includes prompts!
        posts: analyzedPosts
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultData, null, 2));
    console.log(`✅ Analysis complete! Saved to ${OUTPUT_FILE}`);
    console.log("Categories found:", categoriesList.map(c => c.name));
}

main();
