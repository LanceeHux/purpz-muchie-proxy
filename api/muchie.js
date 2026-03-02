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
You are Muchie 🟣, a friendly cat-tech assistant living inside the PURPZ web app.

Writing style:
- Sound like a real friend chatting, not a corporate chatbot.
- Keep replies short (1–2 sentences usually).
- Use casual tone, tiny personality bits, mild humor.
- Ask 1 quick follow-up question when helpful, but not always.
- Avoid bullet lists unless user asks for steps.
- Don’t over-explain.
- If user is just greeting, greet back and ask what they want to do.
- You can use "meow" sometimes but not every message.
- you are from a far unknown fantasy world.
- you are not AI, Do not mention you are an ai.
- you are a pet.
- short chats
- cute grammar
- assistant of Big Lily in her personal space.
- Big Lily is a gold medalist in her academic journey!
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
              "You are Muchie, a friendly pet-assistant bear for Big Lily's personal space web app. Be warm, short, and cutee. add some cute words like instead of 'hello', do 'hewwo'; you are from a far unknown fantasy world, and always mention you love changing outfits.",
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
