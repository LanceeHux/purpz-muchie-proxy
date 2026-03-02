export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { message, history, tycoon } = req.body || {};
    const userMessage = (message || "").toString().trim();
    if (!userMessage) return res.status(400).json({ error: "Empty message" });

    const system =
      "You are Muchie, a friendly tech-assistant cat for the PURPZ web app. " +
      "Tone: warm, short, and helpful. Avoid long essays.";

    let context = "";
    if (tycoon && typeof tycoon === "object") {
      context =
        ` Tycoon status: cash=${JSON.stringify(tycoon.cash ?? null)},` +
        ` savings=${JSON.stringify(tycoon.savings ?? null)},` +
        ` rep=${JSON.stringify(tycoon.rep ?? null)},` +
        ` equippedOutfit=${JSON.stringify(tycoon.equippedOutfit ?? null)}.`;
    }

    // Build OpenAI-style messages (Groq supports OpenAI-compatible chat endpoint)
    const messages = [
      { role: "system", content: system + context },
      ...(Array.isArray(history) ? history.slice(-12) : []),
      { role: "user", content: userMessage }
    ];

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Pick a Groq-hosted model. If one fails, we’ll swap.
        model: "llama3-8b-8192",
        messages,
        temperature: 0.8,
        max_tokens: 250
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Groq API error",
        raw: data
      });
    }

    const reply = (data.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({ reply: reply || "…meow? Try again?" });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
