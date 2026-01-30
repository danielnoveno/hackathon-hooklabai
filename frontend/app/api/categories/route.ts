
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type CategoryItem = {
    name: string;
    prompt: string;
};

export async function GET() {
    try {
        // Fix Path: Assume 'data' is sibling to 'frontend'
        const analyzedPath = path.join(process.cwd(), '..', 'data', 'analyzed_posts.json');
        console.log("📂 Reading Categories from:", analyzedPath);

        // Default categories if file doesn't exist
        const defaultCategories: CategoryItem[] = [
            { name: 'General', prompt: 'Write a viral hook about...' },
            { name: 'Business', prompt: 'Write a contrarian business lesson about...' },
            { name: 'Tech', prompt: 'Explain a complex tech topic simply...' },
            { name: 'Lifestyle', prompt: 'Share a personal life hack about...' }
        ];

        if (!fs.existsSync(analyzedPath)) {
            console.warn("⚠️ Categories file not found at:", analyzedPath);
            return NextResponse.json({ categories: defaultCategories });
        }

        const fileContent = fs.readFileSync(analyzedPath, "utf-8");
        const data = JSON.parse(fileContent);

        if (data.categories && Array.isArray(data.categories)) {
            // Data from script is [{name: "Meme", prompt: "..."}]
            // Ensure specific structure and unique names
            const dynamicCats = data.categories.map((c: any) => ({
                name: c.name || "Unknown",
                prompt: c.prompt || "Write something viral about this."
            }));

            // Merge defaults (optional, or just return dynamic)
            // Let's prepend General
            const finalCats = [
                { name: "General", prompt: "Write a viral hook about..." },
                ...dynamicCats
            ];

            return NextResponse.json({ categories: finalCats });
        }

        return NextResponse.json({ categories: defaultCategories });
    } catch (error) {
        console.error("Error reading categories:", error);
        return NextResponse.json({ categories: [{ name: 'Error', prompt: '' }] });
    }
}
