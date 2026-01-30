import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");
        // There isn't a direct listModels on genAI instance in some versions, 
        // but typically we can try a widely known model to see if it works or use the response logs.
        // Actually, SDK usually doesn't expose listModels easily in the main class in some versions, 
        // but let's try to just instantiate a few common ones and see which one doesn't throw immediate 404/error 
        // or if there is a list method.

        // Actually, looking at docs, there isn't a simple listModels in the node sdk top level easily accessible 
        // without using the specialized ModelManager (if available) or just REST.
        // Let's try to use a simple node fetch to the REST API equivalent to list models which is safer.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.error("❌ Could not list models:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

listModels();
