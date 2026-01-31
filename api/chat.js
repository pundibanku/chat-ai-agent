import fetch from "node-fetch";

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ reply: "Method not allowed" });
    }

    try {
        const body = req.body;

        if (!body || !body.message) {
            return res.status(400).json({
                reply: "Message missing",
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a WhatsApp style AI sales agent. Reply short and friendly.",
                        },
                        {
                            role: "user",
                            content: body.message,
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API Error:", errorText);

            // Return 200 with error message as requested by user pattern
            return res.status(200).json({
                reply: "Server busy hai 😅 thodi der baad try karo",
            });
        }

        const data = await response.json();

        return res.status(200).json({
            reply: data.choices[0].message.content,
        });
    } catch (err) {
        console.error("Fatal Error:", err);
        return res.status(200).json({
            reply: "AI temporarily unavailable 🤖",
        });
    }
}
