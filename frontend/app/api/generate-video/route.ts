
import { NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';

// Helper to convert Data URL to Buffer
function dataUrlToBuffer(dataUrl: string) {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid input string');
    }
    return Buffer.from(matches[2], 'base64');
}

export async function POST(req: Request) {
    try {
        const { prompt, imageUrl } = await req.json();

        if (!prompt || !imageUrl) {
            return NextResponse.json({ error: "Missing prompt or imageUrl" }, { status: 400 });
        }

        const apiKey = process.env.EIGEN_API_KEY;
        const baseUrl = process.env.EIGEN_BASE_URL || 'https://api-web.eigenai.com/api/v1';

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        console.log(`🎬 submitting video job for prompt: "${prompt.substring(0, 50)}..."`);

        // 1. Prepare Form Data
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('infer_steps', '5'); // Default from example
        form.append('seed', '42');      // Consistent results

        // Handle Image Source
        if (imageUrl.startsWith('data:')) {
            const imageBuffer = dataUrlToBuffer(imageUrl);
            form.append('image', imageBuffer, { filename: 'input.png', contentType: 'image/png' });
        } else {
            // Assume it's a URL
            // Option A: Pass as image_url (if API supports it mixed with form-data file logic, usually it's one or other)
            // The prompt says: "image file ✅ Yes* ... Required if image_url is not provided."
            // So we can pass image_url if we have a public URL.
            form.append('image_url', imageUrl);
        }

        // 2. Submit Job
        const submitUrl = 'https://api-web.eigenai.com/api/wan2p2-i2v-14b-turbo'; // Hardcoded based on user prompt docs
        // Note: User prompt said /api/wan2p2-i2v-14b-turbo is relative to BASE_URL?
        // "const BASE_URL = 'https://api-web.eigenai.com'; ... await axios.post(`${BASE_URL}/api/wan2p2-i2v-14b-turbo`..."
        // So I should use that.

        const submitResponse = await axios.post(submitUrl, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const taskId = submitResponse.data.task_id;
        console.log(`✅ Video Job Submitted. Task ID: ${taskId}`);

        // 3. Poll for Completion
        // We will poll for a max of 60 seconds (Backend timeout safety)
        const maxRetries = 30; // 30 * 2s = 60s
        let status = 'processing';
        let videoData = null;

        for (let i = 0; i < maxRetries; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

            const statusUrl = `https://api-web.eigenai.com/api/wan2p2-i2v-14b-turbo-status`;
            const statusResponse = await axios.get(statusUrl, {
                params: { jobId: taskId },
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            status = statusResponse.data.status;
            console.log(`⏳ Job Status (${i + 1}/${maxRetries}): ${status}`);

            if (status === 'completed') {
                break;
            } else if (status === 'failed') {
                throw new Error(`Video generation failed: ${statusResponse.data.error || 'Unknown error'}`);
            }
        }

        if (status !== 'completed') {
            throw new Error("Video generation timed out");
        }

        // 4. Get Result
        const resultUrl = `https://api-web.eigenai.com/api/wan2p2-i2v-14b-turbo-result`;
        const videoResponse = await axios.get(resultUrl, {
            params: { jobId: taskId },
            headers: { 'Authorization': `Bearer ${apiKey}` },
            responseType: 'arraybuffer'
        });

        // Convert to Base64 to return to frontend
        const videoBase64 = Buffer.from(videoResponse.data).toString('base64');
        const videoUrl = `data:video/mp4;base64,${videoBase64}`;

        console.log("✅ Video retrieved successfully");

        return NextResponse.json({ videoUrl });

    } catch (error: any) {
        console.error("❌ Video Generation Error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to generate video" },
            { status: 500 }
        );
    }
}
