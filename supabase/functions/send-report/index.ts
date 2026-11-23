const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
/** Who reports come from, e.g. "ArithmeTick <reports@yourdomain>". Must be on the domain verified in Resend. */
const REPORT_FROM = Deno.env.get("REPORT_FROM") ?? "";
/** A long random secret: the weekly schedule sends it, and it signs the unsubscribe links. */
const REPORT_KEY = Deno.env.get("REPORT_KEY") ?? "";
/** The public website, where the unsubscribe link lands. */
const WEBSITE_URL = Deno.env.get("WEBSITE_URL") ?? "https://arithmetick.rachelkenyani.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-report-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface Settings {
  user_id: string;
  opted_in_at: string;
  last_sent_at: string | null;
}

interface Child {
  user_id: string;
  child_id: string;
  child_name: string;
  grade: number;
  levels_done: number;
  level_count: number;
  total_levels: number;
  stars: number;
  skills_line: string | null;
  practice_idea: string | null;
  updated_at: string;
  sent_levels: number;
  sent_stars: number;
}

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

/** Calls the database as the service role, which can read every family's report rows. */
async function db(path: string, init: RequestInit = {}): Promise<Response> {
  return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

async function userIdFor(token: string): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: ANON_KEY } });
  if (!res.ok) return null;
  return ((await res.json()) as { id?: string }).id ?? null;
}

async function emailOf(userId: string): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
  if (!res.ok) return null;
  return ((await res.json()) as { email?: string }).email || null;
}

async function sign(userId: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(REPORT_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`unsubscribe:${userId}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

const unsubscribeUrl = async (userId: string) =>
  `${SUPABASE_URL}/functions/v1/send-report?unsubscribe=${userId}&sig=${await sign(userId)}`;

/** Makes text safe to put inside the email's HTML. */
const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const FONT = "font-family:'Quicksand','Segoe UI',Arial,sans-serif;";
/** Headings for grown-ups: the same plain typeface as the text, in bold. No playful display font in reports. */
const DISPLAY = FONT;

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function childBlock(child: Child, kind: "weekly" | "grade"): string {
  const levels = Math.max(0, child.total_levels - child.sent_levels);
  const stars = Math.max(0, child.stars - child.sent_stars);
  const headline =
    kind === "grade"
      ? `What ${escapeHtml(child.child_name)} learned`
      : `${escapeHtml(child.child_name)} · Grade ${child.grade}`;
  const thisWeek =
    kind === "grade"
      ? `All ${child.level_count} levels done, with ${plural(child.stars, "star", "stars")} so far.`
      : `This week: ${plural(levels, "level", "levels")} and ${plural(stars, "star", "stars")}. Now on level ${Math.min(child.levels_done + 1, child.level_count)} of ${child.level_count}.`;
  const skills = child.skills_line
    ? `<p style="margin:10px 0 0;${FONT}font-size:16px;line-height:24px;color:#1B2B2A;">${escapeHtml(child.child_name)}: ${escapeHtml(child.skills_line)}.</p>`
    : "";
  const idea = child.practice_idea
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;background:#FFF6D6;border-radius:18px;"><tr><td style="padding:14px 16px;${FONT}font-size:15px;line-height:22px;color:#1B2B2A;"><strong style="color:#004F4A;">Try at home:</strong> ${escapeHtml(child.practice_idea)}</td></tr></table>`
    : "";
  return `<tr><td style="padding:18px 32px 6px;">
  <h2 style="margin:0;${DISPLAY}font-size:22px;line-height:28px;font-weight:700;color:#006F68;">${headline}</h2>
  <p style="margin:6px 0 0;${FONT}font-size:16px;line-height:24px;color:#1B2B2A;">${thisWeek}</p>${skills}${idea}
</td></tr>`;
}

function emailHtml(title: string, intro: string, blocks: string, unsubscribe: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#EBF9F7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EBF9F7;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:28px;overflow:hidden;border-bottom:6px solid #cfe8e4;">
<tr><td align="center" style="background:#3E0E79;padding:28px 24px 26px;">
  <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <td style="background:#440f85;border-radius:22px;padding:14px 22px;border:3px solid #3a0b77;">
      <img src="https://raw.githubusercontent.com/Rachel-Kenyani/ArithmeTick/main/assets/splash-icon.png" width="190" height="82" alt="ArithmeTick" style="display:block;width:190px;height:82px;border:0;outline:none;text-decoration:none;${DISPLAY}font-size:24px;color:#ffffff;">
    </td>
  </tr></table>
  <p style="margin:14px 0 0;${FONT}font-size:13px;letter-spacing:1px;color:#E4D6F7;">Maths we learn together</p>
</td></tr>
<tr><td align="center" style="padding:28px 32px 4px;">
  <h1 style="margin:0 0 8px;${DISPLAY}font-size:26px;line-height:32px;font-weight:700;color:#006F68;">${escapeHtml(title)}</h1>
  <p style="margin:0;${FONT}font-size:16px;line-height:24px;color:#1B2B2A;">${intro}</p>
</td></tr>
${blocks}
<tr><td align="center" style="padding:22px 32px 30px;">
  <p style="margin:0;${FONT}font-size:13px;line-height:20px;color:#4A5F5D;">You get this because you turned on weekly reports in ArithmeTick. <a href="${unsubscribe}" style="color:#6D41A3;">Turn off reports</a> and we'll delete what we keep for them.</p>
</td></tr>
</table>
<p style="margin:18px 0 0;${FONT}font-size:12px;line-height:18px;color:#4A5F5D;">ArithmeTick &middot; Maths for Grade 1&ndash;3 &middot; Nairobi, Kenya</p>
</td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: REPORT_FROM, to: [to], subject, html }),
  });
  if (!res.ok) console.error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.ok;
}

async function markSent(children: readonly Child[]): Promise<void> {
  await Promise.all(
    children.map((c) =>
      db(`child_reports?user_id=eq.${c.user_id}&child_id=eq.${encodeURIComponent(c.child_id)}`, {
        method: "PATCH",
        body: JSON.stringify({ sent_levels: c.total_levels, sent_stars: c.stars }),
      }),
    ),
  );
}

/** Emails one family about the children who played since their last report. True when an email went out. */
async function sendWeeklyTo(s: Settings): Promise<boolean> {
  const since = s.last_sent_at ?? s.opted_in_at;
  const played = (await (
    await db(`child_reports?select=*&user_id=eq.${s.user_id}&updated_at=gt.${encodeURIComponent(since)}&order=child_name`)
  ).json()) as Child[];
  if (played.length === 0) return false;
  const to = await emailOf(s.user_id);
  if (!to) return false;
  const names = played.map((c) => escapeHtml(c.child_name));
  const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  const html = emailHtml(
    "This week in ArithmeTick",
    `Here's how ${who} did this week.`,
    played.map((c) => childBlock(c, "weekly")).join(""),
    await unsubscribeUrl(s.user_id),
  );
  if (!(await send(to, `This week in ArithmeTick: ${played.map((c) => c.child_name).join(", ")}`, html))) return false;
  await Promise.all([
    markSent(played),
    db(`report_settings?user_id=eq.${s.user_id}`, { method: "PATCH", body: JSON.stringify({ last_sent_at: new Date().toISOString() }) }),
  ]);
  return true;
}

/**
 * Every Sunday: one email per family, about the children who played since the last one. Families who didn't play get
 * nothing. Families are emailed one after another, not all at once, because Resend accepts only a few emails a second.
 */
async function sendWeekly(): Promise<Response> {
  const settings = (await (await db("report_settings?select=*")).json()) as Settings[];
  const results = await settings.reduce<Promise<boolean[]>>(
    async (done, s) => [...(await done), await sendWeeklyTo(s)],
    Promise.resolve([]),
  );
  const sent = results.filter(Boolean).length;
  console.log(`send-report weekly: ${sent} of ${settings.length} families emailed`);
  return reply(200, { sent });
}

/** Straight away when a child finishes a grade, for families with reports on. */
async function sendGrade(userId: string, childId: string): Promise<Response> {
  const on = (await (await db(`report_settings?select=user_id&user_id=eq.${userId}`)).json()) as unknown[];
  if (on.length === 0) return reply(200, { sent: 0 });
  const rows = (await (
    await db(`child_reports?select=*&user_id=eq.${userId}&child_id=eq.${encodeURIComponent(childId)}`)
  ).json()) as Child[];
  const child = rows[0];
  const to = await emailOf(userId);
  if (!child || !to) return reply(200, { sent: 0 });
  const html = emailHtml(
    `${child.child_name} finished Grade ${child.grade}!`,
    `Every level in Grade ${child.grade} is done. Here's where ${escapeHtml(child.child_name)} is now.`,
    childBlock(child, "grade"),
    await unsubscribeUrl(userId),
  );
  const ok = await send(to, `${child.child_name} finished Grade ${child.grade} in ArithmeTick!`, html);
  return reply(ok ? 200 : 502, { sent: ok ? 1 : 0 });
}

/**
 * Sends the browser to a page on the website. Supabase shows a function's HTML as plain text, so the pages a parent
 * sees live on the website instead.
 */
const goTo = (path: string) => new Response(null, { status: 303, headers: { Location: `${WEBSITE_URL}${path}` } });

/** The link in every email: turns reports off and deletes what is kept for them, with no sign-in needed. */
async function unsubscribe(userId: string, sig: string): Promise<Response> {
  if (!/^[0-9a-f-]{36}$/.test(userId) || sig !== (await sign(userId))) return goTo("/reports-link");
  await Promise.all([
    db(`child_reports?user_id=eq.${userId}`, { method: "DELETE" }),
    db(`report_settings?user_id=eq.${userId}`, { method: "DELETE" }),
  ]);
  return goTo("/reports-off");
}

/** A made-up family, for previewing both reports in a browser without waiting for Sunday. */
const SAMPLE: Child[] = [
  {
    user_id: "preview", child_id: "a", child_name: "Jabali", grade: 1, levels_done: 4, level_count: 9, total_levels: 4, stars: 12,
    skills_line: "making 10 is strong, taking away is still growing",
    practice_idea: "Put 9 bottle tops on the table. Hide some under a cup while Jabali looks away. How many are hiding?",
    updated_at: "", sent_levels: 1, sent_stars: 3,
  },
  {
    user_id: "preview", child_id: "b", child_name: "Tessa", grade: 2, levels_done: 7, level_count: 12, total_levels: 16, stars: 48,
    skills_line: "place value and adding on are strong, equal groups is still growing",
    practice_idea: "Lay out seeds in 3 rows of 4. Ask Tessa to count the rows, not every seed: 4, 8, 12.",
    updated_at: "", sent_levels: 14, sent_stars: 42,
  },
];

/** `?preview=weekly` or `?preview=grade` shows a report with the sample family. Nothing is sent. */
function preview(kind: string): Response {
  const html =
    kind === "grade"
      ? emailHtml(
          "Tessa finished Grade 2!",
          "Every level in Grade 2 is done. Here's where Tessa is now.",
          childBlock({ ...SAMPLE[1], levels_done: 12, total_levels: 21 }, "grade"),
          "#",
        )
      : emailHtml("This week in ArithmeTick", "Here's how Jabali and Tessa did this week.", SAMPLE.map((c) => childBlock(c, "weekly")).join(""), "#");
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/** A link opened in a browser: a report preview, or the unsubscribe link from an email. */
async function handleGet(url: URL): Promise<Response> {
  const previewKind = url.searchParams.get("preview");
  if (previewKind) return preview(previewKind);
  const userId = url.searchParams.get("unsubscribe");
  return userId ? await unsubscribe(userId, url.searchParams.get("sig") ?? "") : reply(404, { error: "not_found" });
}

/** The end-of-grade email, sent by the app for the signed-in grown-up. */
async function handleGrade(req: Request, childId: string): Promise<Response> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const userId = token ? await userIdFor(token) : null;
  if (!userId) return reply(401, { error: "not_signed_in" });
  return await sendGrade(userId, childId);
}

/** The weekly run (from the schedule, with the report key) or an end-of-grade email (from the app). */
async function handlePost(req: Request): Promise<Response> {
  if (!RESEND_API_KEY || !REPORT_FROM || !REPORT_KEY) return reply(500, { error: "not_configured" });
  const body = (await req.json().catch(() => ({}))) as { kind?: string; child_id?: string };
  if (body.kind === "weekly") {
    return req.headers.get("x-report-key") === REPORT_KEY ? await sendWeekly() : reply(401, { error: "not_allowed" });
  }
  if (body.kind === "grade" && body.child_id) return await handleGrade(req, body.child_id);
  return reply(400, { error: "unknown_kind" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") return await handleGet(new URL(req.url));
  if (req.method === "POST") return await handlePost(req);
  return reply(405, { error: "method_not_allowed" });
});
