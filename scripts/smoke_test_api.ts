import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function smokeTest() {
    console.log('--- CampSync API Smoke Test ---');

    // Manual rudimentary .env parser to avoid extra dependency
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        try {
            const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
            const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
            if (match) apiKey = match[1].replace(/["']/g, '');
        } catch {
            // .env.local might not exist or be readable
        }
    }

    if (!apiKey) {
        console.error('❌ FAIL: GEMINI_API_KEY is not set in environment or .env.local');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelId = 'gemini-2.5-flash';

    console.log(`Testing connectivity to model: ${modelId}...`);

    try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const result = await model.generateContent("Ping? Just say 'Pong' to confirm connectivity.");
        const response = await result.response;
        const text = response.text();

        if (text.toLowerCase().includes('pong')) {
            console.log('✅ SUCCESS: API is responsive and model is available.');
        } else {
            console.log(`⚠️  WARNING: API responded, but content was unexpected: "${text}"`);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ FAIL: API connection failed or model is unavailable.');
        console.error(`Error Details: ${errorMessage}`);

        if (errorMessage.includes('404')) {
            console.log('\n💡 TIP: Run "curl https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" to see available models.');
        }
        process.exit(1);
    }
}

smokeTest();
