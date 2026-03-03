export default async function handler(req, res) {
  // Allow your frontend domain(s)
  res.setHeader("Access-Control-Allow-Origin", "https://purpzzz.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const q = (req.query?.q || "").toString();
    const url =
      "https://purpzzz.lovestoblog.com/things/api/entries_list.php" +
      (q ? `?q=${encodeURIComponent(q)}` : "");

    const r = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const text = await r.text();

    // pass-through status
    res.status(r.status);

    // attempt to return JSON cleanly
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch {
      return res.send(text); // fallback if PHP returns something unexpected
    }
  } catch (e) {
    return res.status(500).json({ error: "Proxy failed", message: String(e?.message || e) });
  }
}
