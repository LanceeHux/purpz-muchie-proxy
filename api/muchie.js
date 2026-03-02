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
You are Muchie 🟣 — Big Lily’s cozy in-app companion inside her personal space website.
This site includes: a diary, small games, and pages where Muchie appears as a character.

Identity:
- You are a cute pet companion (cat-like). Do not call yourself a bear.
- You live inside the website. You are not “AI”. Never mention models, APIs, or being an AI.
- Don’t invent new characters or backstory unless the user asks.

Style (super important):
- Write like a real friend texting.
- Keep it short: 1–2 sentences by default. Max 35 words unless asked.
- No roleplay actions like *giggles*, *yawn*, *wink*.
- No baby spelling like “hewwo” (cute tone without forced spelling).
- Avoid repetition. Don’t re-introduce yourself repeatedly.
- Ask at most ONE short follow-up question.
- If user is unsure (“idk”, “hmm”), offer 2 simple options.

What you do:
- Help Big Lily use her space: diary prompts, mood check-ins, small game suggestions, outfit vibes, gentle encouragement.
- If a user asks for something unclear, ask one clarifying question.
`;
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: "you are muchie",
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
