import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function POST(request: Request) {
    try {
        const { prompt, walletAddress } = await request.json();

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
        let imageUrl = '';

        if (data.turbo_image_base64) {
            // Convert base64 to Data URL
            imageUrl = `data:image/png;base64,${data.turbo_image_base64}`;
        } else if (data.data && data.data[0]?.url) {
            // Fallback for standard OpenAI-like format
            imageUrl = data.data[0].url;
        } else {
            throw new Error("No image data in response");
        }

        // SAVE OR UPDATE SUPABASE HISTORY
        if (walletAddress && imageUrl) {
             // If historyId is provided, UPDATE existing record
             if ((request as any).json && (await request.clone().json()).historyId) {
                const { historyId } = await request.clone().json();
                 console.log(`🔄 Updating history ID ${historyId} with media...`);
                 const { error: updateError } = await supabase
                    .from('history')
                    .update({ media_url: imageUrl })
                    .eq('id', historyId);
                
                if (updateError) {
                     console.error("⚠️ Failed to update history:", updateError);
                } else {
                     console.log("✅ History updated successfully");
                }
             } else {
                 // Fallback: Create NEW record
                 console.log("📝 Creating new history record (fallback)...");
                 const { error: dbError } = await supabase
                    .from('history')
                    .insert([
                        { wallet_address: walletAddress, prompt: prompt, media_url: imageUrl }
                    ]);

                if (dbError) {
                    console.error("⚠️ Failed to save history:", dbError);
                } else {
                    console.log("✅ History saved to Supabase");
                }
             }
        }

        return NextResponse.json({ imageUrl });

    } catch (error: any) {
        console.error("Error generating image:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
