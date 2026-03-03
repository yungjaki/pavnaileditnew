export default async function handler(req, res) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!raw) {
    return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT is not set" });
  }

  let sa;
  try {
    sa = JSON.parse(raw);
  } catch (e) {
    return res.status(500).json({ error: "JSON parse failed: " + e.message, raw_length: raw.length });
  }

  const key = sa.private_key || "";
  const keyLines = key.split("\n");

  return res.status(200).json({
    project_id: sa.project_id,
    client_email: sa.client_email,
    key_starts_with: key.substring(0, 40),
    key_ends_with: key.substring(key.length - 40),
    key_length: key.length,
    key_line_count: keyLines.length,
    key_has_begin: key.includes("-----BEGIN PRIVATE KEY-----"),
    key_has_end: key.includes("-----END PRIVATE KEY-----"),
    key_has_real_newlines: key.includes("\n"),
    key_has_escaped_newlines: key.includes("\\n"),
  });
}
