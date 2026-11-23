import { Platform } from "react-native";

/**
 * Cloudflare Turnstile, which Supabase checks before sign-up, password log-in, sending a code and resending one.
 * Every token works once, so each of those calls asks for a new one. On phones, `CaptchaHost` runs the widget in a
 * hidden web view; on the web, the widget runs in the page.
 */
export const TURNSTILE_SITE_KEY = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** The page the widget runs on. Its hostname must be listed on the Turnstile widget in Cloudflare. */
export const CAPTCHA_BASE_URL = "https://arithmetick.rachelkenyani.com";

/** How long to wait for Turnstile before giving up. */
export const CAPTCHA_TIMEOUT_MS = 30_000;

export class CaptchaError extends Error {}

export interface CaptchaRequest {
  id: number;
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

type Host = (request: CaptchaRequest | null) => void;

let host: Host | null = null;
let nextId = 1;
let queue: Promise<unknown> = Promise.resolve();

/** `CaptchaHost` registers itself here while it is mounted. Returns a function that unregisters it. */
export function registerCaptchaHost(show: Host): () => void {
  host = show;
  return () => {
    if (host === show) host = null;
  };
}

/** The widget page for the web view: renders Turnstile and posts its result back to the app. */
export function captchaPage(siteKey: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=start&render=explicit" async defer></script>
</head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:transparent">
<div id="widget"></div>
<script>
function post(message) { window.ReactNativeWebView.postMessage(JSON.stringify(message)); }
function start() {
  turnstile.render("#widget", {
    sitekey: ${JSON.stringify(siteKey).replaceAll("<", "\\u003c")},
    appearance: "interaction-only",
    callback: function (token) { post({ type: "token", token: token }); },
    "error-callback": function (code) { post({ type: "error", code: String(code) }); },
    "expired-callback": function () { post({ type: "error", code: "expired" }); },
    "before-interactive-callback": function () { post({ type: "show" }); },
    "after-interactive-callback": function () { post({ type: "hide" }); }
  });
}
</script></body></html>`;
}

export type CaptchaMessage = { type: "token"; token: string } | { type: "error"; code: string } | { type: "show" } | { type: "hide" };

/** Reads a message from the widget page. Anything unexpected counts as an error. */
export function parseCaptchaMessage(data: string): CaptchaMessage {
  try {
    const message = JSON.parse(data) as Partial<CaptchaMessage> & { token?: unknown; code?: unknown };
    if (message.type === "token" && typeof message.token === "string" && message.token) return { type: "token", token: message.token };
    if (message.type === "show" || message.type === "hide") return { type: message.type };
    if (message.type === "error") return { type: "error", code: String(message.code ?? "unknown") };
  } catch {
    // Falls through to the error below.
  }
  return { type: "error", code: "bad_message" };
}

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
}

/** On the web there is no web view: the widget loads into the page itself. */
function webToken(siteKey: string): Promise<string> {
  const w = globalThis as unknown as { turnstile?: TurnstileApi; document: Document };
  const load = (): Promise<TurnstileApi> =>
    w.turnstile
      ? Promise.resolve(w.turnstile)
      : new Promise((resolve, reject) => {
          const script = w.document.createElement("script");
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          script.async = true;
          script.onload = () => (w.turnstile ? resolve(w.turnstile) : reject(new CaptchaError("turnstile_missing")));
          script.onerror = () => reject(new CaptchaError("turnstile_load_failed"));
          w.document.head.appendChild(script);
        });
  return load().then(
    (turnstile) =>
      new Promise<string>((resolve, reject) => {
        const box = w.document.createElement("div");
        box.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999";
        w.document.body.appendChild(box);
        const done = (finish: () => void) => {
          turnstile.remove(id);
          box.remove();
          finish();
        };
        const id = turnstile.render(box, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (token: string) => done(() => resolve(token)),
          "error-callback": (code: unknown) => done(() => reject(new CaptchaError(String(code)))),
        });
      }),
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new CaptchaError("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new CaptchaError(String(error)));
      },
    );
  });
}

/**
 * A fresh Turnstile token, or undefined when no site key is set (local development without CAPTCHA). Requests run
 * one at a time, since the app shows at most one widget.
 */
export function captchaToken(): Promise<string | undefined> {
  if (!TURNSTILE_SITE_KEY) return Promise.resolve(undefined);
  const run = (): Promise<string> => {
    if (Platform.OS === "web") return withTimeout(webToken(TURNSTILE_SITE_KEY), CAPTCHA_TIMEOUT_MS);
    const show = host;
    if (!show) return Promise.reject(new CaptchaError("no_host"));
    const token = new Promise<string>((resolve, reject) => show({ id: nextId++, resolve, reject }));
    return withTimeout(token, CAPTCHA_TIMEOUT_MS).finally(() => show(null));
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}
