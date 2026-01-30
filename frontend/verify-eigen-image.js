const fs = require('fs');
const dotenv = require('dotenv');
const FormData = require('form-data');
const axios = require('axios');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const apiKey = envConfig.EIGEN_API_KEY;
const baseUrl = envConfig.EIGEN_BASE_URL || 'https://api-web.eigenai.com/api/v1';

// Override these if needed manually
const model = process.argv[2] || envConfig.EIGEN_IMAGE_MODEL || 'eigen-image';
const prompt = process.argv[3] || 'A futuristic cityscape with neon lights and flying cars, cyberpunk style, high resolution';

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

console.log(`🎨 Testing Image Generation`);
console.log(`Model: ${model}`);
console.log(`Prompt: ${prompt}`);
const endpoint = `${baseUrl}/generate`;
console.log(`Endpoint: ${endpoint}`);

async function run() {
    try {
        const form = new FormData();
        form.append('model', model);
        form.append('prompt', prompt);

        // Always add dummy image for /generate endpoint compliance
        console.log("Adding dummy image payload...");
        const emptyBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64");
        form.append('image', emptyBuffer, { filename: 'input.png', contentType: 'image/png' });

        console.log("Headers:", form.getHeaders());

        const response = await axios.post(endpoint, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${apiKey}`
            },
            responseType: 'arraybuffer'
        });

        console.log(`Response Status: ${response.status}`);
        const contentType = response.headers['content-type'];
        console.log(`Response Content-Type: ${contentType}`);

        if (contentType && contentType.includes("application/json")) {
            // Check if it's JSON error or data
            const text = Buffer.from(response.data).toString();
            console.log("Received JSON:", text);
            try {
                const data = JSON.parse(text);
                if (data.data && data.data[0]?.url) {
                    console.log("✅ Image URL:", data.data[0].url);
                }
            } catch (e) { }
        } else {
            // Binary image
            const outputPath = 'eigen-result.png';
            fs.writeFileSync(outputPath, response.data);
            console.log(`✅ Image saved to ${outputPath} (${response.data.length} bytes)`);
        }

    } catch (error) {
        if (error.response) {
            console.error("❌ Request Failed:", error.response.status);
            console.error(Buffer.from(error.response.data).toString());
        } else {
            console.error("❌ Error:", error.message);
        }
    }
}

run();
