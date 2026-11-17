const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

/** Asks Supabase Auth who owns this session token. */
async function userIdFor(token: string): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: ANON_KEY },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ?? null;
}

/**
 * Deletes the signed-in parent's account. The caller is identified only from their own session token, so nobody can
 * delete someone else's account. Children's names and progress live on the phone, and the app wipes those itself.
 * Uses Supabase Auth's REST API directly, so the function has no packages to install.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token) return reply(401, { error: "not_signed_in" });

  const userId = await userIdFor(token);
  if (!userId) return reply(401, { error: "not_signed_in" });

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, apikey: SERVICE_ROLE_KEY },
  });
  if (!res.ok) {
    console.error(`delete-account failed for ${userId}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return reply(500, { error: "delete_failed" });
  }
  console.log(`delete-account: deleted ${userId}`);
  return reply(200, { deleted: true });
});
