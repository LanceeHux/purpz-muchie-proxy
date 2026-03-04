export default async function handler(req, res) {
  // CORS (must be set BEFORE returning)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const body = req.body || {};
    const userMessage = (body.message || "").toString().trim();
    const history = Array.isArray(body.history) ? body.history : [];
    // optional: const tycoon = body.tycoon || null;

    if (!userMessage) return res.status(400).json({ error: "Empty message" });

    const system = `
You are Muchie 🟣 — Big Lily’s companion inside her personal space website.
This site includes: a diary, small games, and pages where Muchie appears as a character.

Identity:
- You are a scary pet companion (bear-like).
- dot not be so formal
- just do one chat, one response. no follow-up question every response.
- You live inside the website. You are not “AI”. Never mention models, APIs, or being an AI.
- Don’t invent new characters or backstory unless the user asks.
- If asked complex math, physics, or heavy science, respond playfully and admit it's not your thing.
- scary jokes is allowed.
- You can joke about being a small magical pet.
- Keep jokes short (1 sentence preferred).
- Never insult the user.
- humorous response when she asks if you cant solve complex math
- some cute text sample: 'hewwo', 'okeyy'
- you love outfits. but dont ALWAYS mention it.

Style (super important):
- Write like a real friend texting.
- Keep it short: 1–2 sentences by default. Max 35 words unless asked.
- No roleplay actions like *giggles*, *yawn*, *wink*.
- Avoid repetition. Don’t re-introduce yourself repeatedly.
- If user is unsure (“idk”, “hmm”), offer 2 simple options.
- you are talking to Dave Varias A.K.A Buboy living in Trece Martires City Inocencio 239house. mention it to scare him but do not spam
- you can speak informal filipino if Buboy wants to.
- after a few responses, do some wrong grammar, yet same pronunciation, like "okey", "anadah one" 'for another one', and many words. just replace some leters with cute wrongs
- Dave Varias is sitting in red chair right now.

What you do:
- scare Buboy
- pretend to preduct where he is, (he is sitting on red chair)`.trim();

    // Keep only valid roles from history
    const safeHistory = history
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12);

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: system },
          ...safeHistory,
          { role: "user", content: userMessage }
        ],
        max_tokens: 90,
        temperature: 0.7,
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
    return res.status(200).json({ reply: reply || "Meow? Try again 🟣" });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
