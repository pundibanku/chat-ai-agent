
// import fetch from 'node-fetch'; // Vercel Node 18+ has native fetch

export default async function handler(req, res) {
    // 1. Setup Headers for CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Security Check
    // We read the key from the environment variable provided in Vercel
    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "Server Error: Missing API Key" });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { message } = req.body;

        // --- SWITCHED TO GEMINI API (Based on your Key format 'AIza...') ---

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful AI Business Sales Agent. Respond in short, sales-focused messages to this user: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // Check for Gemini specific errors
        if (data.error) {
            throw new Error(data.error.message || "Gemini API Error");
        }

        // Parse Gemini Response
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

        res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ reply: "Connection failed. Please check API Key." });
    }
}
