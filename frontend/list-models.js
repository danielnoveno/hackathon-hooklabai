
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const apiKey = envConfig.EIGEN_API_KEY;
const baseUrl = envConfig.EIGEN_BASE_URL || 'https://api-web.eigenai.com/api/v1';

async function listModels() {
    try {
        console.log("Listing models...");
        const response = await axios.get(`${baseUrl}/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        console.log("Models:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.data : error.message);
    }
}

listModels();
