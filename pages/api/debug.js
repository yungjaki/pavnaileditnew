export default async function handler(req, res) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch (e) {
    return res.status(500).json({ error: "JSON parse failed: " + e.message });
  }

  // Try to get a token directly from Google to isolate the issue
  try {
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({
      credentials: sa,
      scopes: ["https://www.googleapis.com/auth/datastore"],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return res.status(200).json({
      success: true,
      token_type: typeof token.token,
      token_length: token.token?.length,
      project_id: sa.project_id,
      client_email: sa.client_email,
    });
  } catch (e) {
    return res.status(500).json({
      auth_error: e.message,
      project_id: sa.project_id,
      client_email: sa.client_email,
    });
  }
}
