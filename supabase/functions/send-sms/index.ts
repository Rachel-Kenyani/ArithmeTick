/**
 * Supabase "Send SMS" auth hook → Africa's Talking.
 *
 * Supabase calls this with the phone number and the 8-digit code whenever it needs to text a code (sign-up,
 * resend, forgot password). We check the request really came from Supabase (Standard Webhooks signature),
 * then send the SMS. Sandbox by default: messages show in the Africa's Talking simulator, nothing is charged.
 *
 * Secrets (supabase secrets set …):
 *   SEND_SMS_HOOK_SECRET  the hook secret from Auth → Hooks, e.g. "v1,whsec_…"
 *   AT_USERNAME           "sandbox" while testing, your app's username when live
 *   AT_API_KEY            the API key for that username
 *   AT_SENDER_ID          optional, a registered sender ID / shortcode (live only)
 */

import { Webhook } from "npm:standardwebhooks@1.0.0";

interface SmsHookPayload {
  user: { phone: string };
  sms: { otp: string };
}

const HOOK_SECRET = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
const USERNAME = Deno.env.get("AT_USERNAME") ?? "sandbox";
const API_KEY = Deno.env.get("AT_API_KEY") ?? "";
const SENDER_ID = Deno.env.get("AT_SENDER_ID");
const AT_URL =
  USERNAME === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

function hookError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: { http_code: status, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return hookError(405, "Method not allowed");

  const body = await req.text();
  let payload: SmsHookPayload;
  try {
    payload = new Webhook(HOOK_SECRET).verify(body, Object.fromEntries(req.headers)) as SmsHookPayload;
  } catch {
    return hookError(401, "Invalid hook signature");
  }

  // Supabase stores phones without "+"; Africa's Talking wants E.164.
  const to = payload.user.phone.startsWith("+") ? payload.user.phone : `+${payload.user.phone}`;
  const message = `Your ArithmeTick code is ${payload.sms.otp}. It expires soon. Don't share it with anyone.`;

  const form = new URLSearchParams({ username: USERNAME, to, message });
  if (SENDER_ID) form.set("from", SENDER_ID);

  const res = await fetch(AT_URL, {
    method: "POST",
    headers: { apiKey: API_KEY, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) return hookError(502, `Africa's Talking error ${res.status}`);

  const result = await res.json();
  const recipient = result?.SMSMessageData?.Recipients?.[0];
  // Shows in Edge Functions → send-sms → Logs (never the code itself), to match against Africa's Talking's outbox.
  console.log(
    `Africa's Talking (${USERNAME}): to ${to.slice(0, 7)}****${to.slice(-2)}, status ${recipient?.status ?? "none"}, ` +
      `messageId ${recipient?.messageId ?? "-"}, cost ${recipient?.cost ?? "-"}, note "${result?.SMSMessageData?.Message ?? ""}"`,
  );
  if (!recipient || recipient.status !== "Success") {
    return hookError(502, `SMS not sent: ${recipient?.status ?? result?.SMSMessageData?.Message ?? "unknown"}`);
  }
  return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
});
