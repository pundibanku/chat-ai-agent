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
        return res.status(405).json({ error: true, message: "Method not allowed" });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: true,
                message: "Message missing",
            });
        }

        const groqResponse = await fetch(
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
                                "You are a WhatsApp-style AI agent. Reply short, friendly, and clear.",
                        },
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                }),
            }
        );

        // ❗ Agar Groq down ho ya error ho
        if (!groqResponse.ok) {
            const text = await groqResponse.text();
            console.error("Groq Error:", text);
            return res.status(500).json({
                error: true,
                message: "AI server busy",
            });
        }

        const data = await groqResponse.json();

        return res.status(200).json({
            reply: data.choices[0].message.content,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
}
