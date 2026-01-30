import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        const apiKey = process.env.EIGEN_API_KEY;
        const baseUrl = process.env.EIGEN_BASE_URL || 'https://api-web.eigenai.com/api/v1';
        const model = process.env.EIGEN_IMAGE_MODEL || 'eigen-image';

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key not configured" },
                { status: 500 }
            );
        }

        console.log(`🎨 Generating Image with Eigen AI (${model})...`);

        // Use JSON payload as per Eigen Image documentation
        const payload = {
            model: model,
            prompt: prompt
        };

        const response = await fetch(`${baseUrl}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Eigen AI Error:", response.status, errorText);
            throw new Error(`Eigen AI API Error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();

        if (data.turbo_image_base64) {
            // Convert base64 to Data URL
            const imageUrl = `data:image/png;base64,${data.turbo_image_base64}`;
            return NextResponse.json({ imageUrl });
        } else if (data.data && data.data[0]?.url) {
            // Fallback for standard OpenAI-like format
            return NextResponse.json({ imageUrl: data.data[0].url });
        } else {
            throw new Error("No image data in response");
        }

    } catch (error: any) {
        console.error("Error generating image:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
