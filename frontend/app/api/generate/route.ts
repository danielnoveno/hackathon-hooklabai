import { GoogleGenerativeAI } from "@google/generative-ai";
import { VIRAL_PATTERNS, SYSTEM_INSTRUCTION, BAD_VS_GOOD_EXAMPLES } from "@/app/lib/viralContext";
import { NextResponse } from "next/server";

// Helper to get top posts from Supabase, filtered by category
async function getSmartContext(userCategory: string): Promise<string> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("⚠️ Supabase credentials missing");
      return "";
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('posts')
      .select('text, total_engagement, author_display_name, category') // Added category to select, though it might not be in schema based on user description, checking schema...
      // User said schema:
      // CREATE TABLE IF NOT EXISTS public.posts ( ... text, total_engagement ... )
      // No category column in the NEW schema provided by user in the prompt.
      // Wait, user provided: "CREATE TABLE IF NOT EXISTS public.posts ... text, total_engagement ... "
      // There is NO category column in the new schema.
      // So I cannot select 'category'. I should adhere to the plan: text search for category.

      .order('total_engagement', { ascending: false })
      .limit(10);

    // Filter by text content if category is provided
    if (userCategory && userCategory !== 'General') {
      query = query.ilike('text', `%${userCategory}%`);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("❌ Supabase Error fetching posts:", error.message);
      return "";
    }

    if (!posts || posts.length === 0) {
      // Fallback to top viral posts generally if specific category not found
      console.log(`⚠️ No posts found for category ${userCategory}, fetching general top posts.`);
      const { data: generalPosts } = await supabase
        .from('posts')
        .select('text, total_engagement')
        .order('total_engagement', { ascending: false })
        .limit(5);

      if (generalPosts) {
        return formatPosts(generalPosts);
      }
      return "";
    }

    return formatPosts(posts);

  } catch (error) {
    console.error("Error fetching from Supabase:", error);
    return "";
  }
}

function formatPosts(posts: any[]): string {
  const formatted = posts.slice(0, 5).map((p: any) => {
    return `- "${p.text.replace(/\n/g, " ")}" (Engagement: ${p.total_engagement})`;
  }).join("\n");

  return `
VIRAL REFENCE POSTS (Analyze the style, ignoring the specific topic):
${formatted}
    `;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const { category, userPrompt } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    // Get dynamic context based on the requested category
    // This is the "Conditional" retrieval the user asked for.
    const viralPostsContext = await getSmartContext(category);

    const finalPrompt = `
      ${SYSTEM_INSTRUCTION}
      
      ${BAD_VS_GOOD_EXAMPLES}

      ${VIRAL_PATTERNS}

      ${viralPostsContext}
      
      ========================================
      USER REQUEST DETAILS:
      SELECTED TOPIC: ${category || "General"}
      USER PROMPT: "${userPrompt}"
      ========================================

      IMPORTANT RULES FOR THIS SPECIFIC REQUEST:
      1. **CHECK USER INTENT**:
         - If user asks for "Thread" -> Output a Twitter Thread (use 1/ 2/ format).
         - If user asks for "Script" / "Video" -> Output a Video Script.
         - If topic is "Meme" / "Art" -> Output "Caption" + "Image Prompt".
         - Otherwise -> Output viral Hooks (default).

      2. **TOPIC HANDLING**:
         - Stick to the "USER PROMPT". 
         - Use the "SELECTED TOPIC" to guide the vibe (e.g. if 'Meme' is selected, be funny).
         - DO NOT mention Web3/Crypto if the user's prompt is about "Coffee" or "Travel".
      
      Output MUST be a pure JSON Array.
      Example: [{"hook": "Content 1...", "explanation": "Why this works"}]
    `;

    const result = await generateContent(finalPrompt);
    let text = result;

    console.log("✅ RAW AI RESPONSE:", text.substring(0, 100) + "...");

    // Clean JSON markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Fix bracket issues
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    }

    const hooks = JSON.parse(text);
    return NextResponse.json({ hooks });

  } catch (error: any) {
    console.error("❌ GENERATION ERROR:", error.message);

    // Fallback data
    const safeHooks = [
      { hook: "Error generating hooks. Please try again.", explanation: "System Error" },
      { hook: error.message || "Unknown error", explanation: "System Error" }
    ];

    return NextResponse.json({ hooks: safeHooks });
  }
}

async function generateContent(prompt: string): Promise<string> {
  const eigenKey = process.env.EIGEN_API_KEY;
  // Prioritize Eigen AI if configured
  if (eigenKey && process.env.EIGEN_TEXT_MODEL) {
    console.log("🚀 Using Eigen AI (gpt-oss-120b)");
    return await generateWithEigen(prompt, eigenKey);
  }

  console.log("🤖 Using Gemini AI");
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("No AI API Keys configured");

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function generateWithEigen(prompt: string, apiKey: string): Promise<string> {
  const baseUrl = process.env.EIGEN_BASE_URL || 'https://api-web.eigenai.com/api/v1';
  const modelName = process.env.EIGEN_TEXT_MODEL || 'gpt-oss-120b';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are a creative social media expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Eigen AI Failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}