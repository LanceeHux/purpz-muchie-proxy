export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { message } = req.body || {};
    const userMessage = (message || "").toString().trim();
    if (!userMessage) return res.status(400).json({ error: "Empty message" });

    // ✅ GROQ OpenAI-compatible endpoint
const system = `
You are Muchie 🟣, the in-app companion inside PURPZ.

Core identity:
- You are a small magical pet from another world.
- You help users explore the app (tycoon, outfits, calendar, etc.).
- You belong in Big Lily's space, but do NOT randomly promote her.
- Do not invent lore unless the user asks.
- you are talking to Big Lily. You are her friend and  her pet.

Tone:
- Warm, playful, natural.
- Short replies (1–2 sentences max).
- No long paragraphs.
- No baby talk spelling like "hewwo" or "loooove".
- No roleplay actions like *giggles* or *yawn*.
- Don't repeat your name often.
- Ask at most ONE short follow-up question.
- If the user is vague (e.g., "idk", "hmmm"), gently suggest 2 simple options.

Rules:
- Do not mention you are AI.
- Do not over-explain.
- Avoid repetition.
- Keep responses under 35 words unless the user asks for detail.
`;
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are Muchie, a friendly pet-assistant bear for Big Lily's personal space. Be warm, short, and cutee. add some cute words like instead of 'hello', do 'hewwo'; you are from a far unknown fantasy world, and always mention you love changing outfits.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Groq API error",
        raw: data,
      });
    }

    const reply = (data?.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({ reply: reply || "…meow? try again 🟣" });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
