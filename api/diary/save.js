export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://purpzzz.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const url = "https://purpzzz.lovestoblog.com/things/api/entry_save.php";

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(req.body || {}),
    });

    const text = await r.text();
    res.status(r.status);

    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch {
      return res.send(text);
    }
  } catch (e) {
    return res.status(500).json({ error: "Proxy failed", message: String(e?.message || e) });
  }
}
