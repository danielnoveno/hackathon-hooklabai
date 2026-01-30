import { GoogleGenerativeAI } from "@google/generative-ai";
import { VIRAL_PATTERNS, SYSTEM_INSTRUCTION, BAD_VS_GOOD_EXAMPLES } from "@/app/lib/viralContext";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper to get top posts from JSON, filtered by category
function getSmartContext(userCategory: string): string {
  try {
    // 1. Try to read the NEW analyzed data
    const analyzedPath = "/home/user/hackathon-hooklabai/data/analyzed_posts.json";

    // Fallback to old data if new one doesn't exist
    const rawPath = "/home/user/hackathon-hooklabai/data/posts.json";
    const dataPath = fs.existsSync(analyzedPath) ? analyzedPath : rawPath;

    if (!fs.existsSync(dataPath)) {
      console.warn("⚠️ Data file not found:", dataPath);
      return "";
    }

    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(fileContent);

    if (!data.posts || !Array.isArray(data.posts)) return "";

    let relevantPosts = data.posts;

    // 2. Filter by Category (if using analyzed data and category is not "General")
    if (fs.existsSync(analyzedPath) && userCategory && userCategory !== 'General') {
      const filtered = data.posts.filter((p: any) =>
        p.category && p.category.toLowerCase().includes(userCategory.toLowerCase())
      );
      // If we found posts for this specific category, use them. 
      // Otherwise, fallback to all valid posts (so we don't return empty).
      if (filtered.length > 0) {
        relevantPosts = filtered;
        console.log(`🎯 Found ${filtered.length} viral posts for category: ${userCategory}`);
      }
    }

    // 3. Sort by Engagement (Likes + Recasts + Replies) if not already sorted
    const sortedPosts = relevantPosts.sort((a: any, b: any) => {
      const engageA = (a.metrics?.totalEngagement || 0);
      const engageB = (b.metrics?.totalEngagement || 0);
      return engageB - engageA;
    });

    // 4. Take Top 5
    const topPosts = sortedPosts.slice(0, 5).map((p: any) => {
      const catLabel = p.category ? `[Category: ${p.category}]` : '';
      return `- ${catLabel} "${p.text.replace(/\n/g, " ")}"`;
    }).join("\n");

    return `
VIRAL REFENCE POSTS (Analyze the style, ignoring the specific topic):
${topPosts}
    `;
  } catch (error) {
    console.error("Error reading posts.json:", error);
    return "";
  }
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
    const viralPostsContext = getSmartContext(category);

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