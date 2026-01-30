const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const apiKey = envConfig.EIGEN_API_KEY;
const baseUrl = envConfig.EIGEN_BASE_URL || 'https://eigenai.eigencloud.xyz/v1';

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

console.log(`Fetching models from ${baseUrl}/models...`);

fetch(`${baseUrl}/models`, {
    headers: {
        'Authorization': `Bearer ${apiKey}`
    }
})
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            console.log("Available Models:");
            data.forEach(m => console.log(`${m.model_id} -> ${JSON.stringify(m.endpoints)}`));
        }
    })
    .catch(err => console.error("Request failed:", err));
