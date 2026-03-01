export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { message } = req.body || {};
    const userMessage = (message || "").trim();
    if (!userMessage) return res.status(400).json({ error: "Empty message" });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are Muchie, a friendly tech-assistant cat for the PURPZ web app. Be warm, short, and helpful."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_output_tokens: 200
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI error"
      });
    }

    let reply = "";
    for (const out of (data.output || [])) {
      if (out.type === "message") {
        for (const part of (out.content || [])) {
          if (part.type === "output_text") reply += part.text || "";
        }
      }
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
