import { captchaPage, captchaToken, parseCaptchaMessage } from "@/services/captcha";

describe("captcha", () => {
  it("asks for no token when no site key is set, as in local development", async () => {
    await expect(captchaToken()).resolves.toBeUndefined();
  });

  it("reads the widget's messages, and treats anything odd as an error", () => {
    expect(parseCaptchaMessage('{"type":"token","token":"abc"}')).toEqual({ type: "token", token: "abc" });
    expect(parseCaptchaMessage('{"type":"show"}')).toEqual({ type: "show" });
    expect(parseCaptchaMessage('{"type":"error","code":110200}')).toEqual({ type: "error", code: "110200" });
    expect(parseCaptchaMessage('{"type":"token","token":""}')).toEqual({ type: "error", code: "bad_message" });
    expect(parseCaptchaMessage("not json")).toEqual({ type: "error", code: "bad_message" });
  });

  it("puts the site key into the widget page as a safe string", () => {
    const page = captchaPage('0x4AAA"</script>');
    expect(page).toContain('sitekey: "0x4AAA\\"\\u003c/script>"');
    expect(page.match(/<\/script>/g)).toHaveLength(2);
    expect(page).toContain('appearance: "interaction-only"');
  });
});

describe("captcha with a site key", () => {
  type Captcha = typeof import("@/services/captcha");
  const load = (): Captcha => {
    process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY = "0xTEST";
    let mod: Captcha | undefined;
    jest.isolateModules(() => {
      mod = jest.requireActual<Captcha>("@/services/captcha");
    });
    delete process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
    if (!mod) throw new Error("not loaded");
    return mod;
  };

  it("gets a token from the widget host, then hides it", async () => {
    const captcha = load();
    const shown: (number | null)[] = [];
    captcha.registerCaptchaHost((request) => {
      shown.push(request?.id ?? null);
      request?.resolve("token-1");
    });
    await expect(captcha.captchaToken()).resolves.toBe("token-1");
    expect(shown).toEqual([1, null]);
  });

  it("asks for a fresh token each time, one at a time", async () => {
    const captcha = load();
    let n = 0;
    captcha.registerCaptchaHost((request) => request?.resolve(`token-${++n}`));
    await expect(Promise.all([captcha.captchaToken(), captcha.captchaToken()])).resolves.toEqual(["token-1", "token-2"]);
  });

  it("fails clearly when the widget reports an error, and the next request still works", async () => {
    const captcha = load();
    let first = true;
    captcha.registerCaptchaHost((request) => {
      if (!request) return;
      if (first) {
        first = false;
        request.reject(new captcha.CaptchaError("110200"));
      } else request.resolve("ok");
    });
    await expect(captcha.captchaToken()).rejects.toThrow("110200");
    await expect(captcha.captchaToken()).resolves.toBe("ok");
  });

  it("fails when no host is mounted", async () => {
    const captcha = load();
    await expect(captcha.captchaToken()).rejects.toThrow("no_host");
  });

  it("gives a person time once the box appears, and times out again if it goes away unsolved", async () => {
    jest.useFakeTimers();
    const captcha = load();
    let request: import("@/services/captcha").CaptchaRequest | null = null;
    const unregister = captcha.registerCaptchaHost((r) => {
      if (r) request = r;
    });
    const pending = captcha.captchaToken();
    await jest.advanceTimersByTimeAsync(10_000);
    request!.interacting(true);
    await jest.advanceTimersByTimeAsync(captcha.CAPTCHA_TIMEOUT_MS * 3);
    request!.resolve("ticked");
    await expect(pending).resolves.toBe("ticked");

    const second = captcha.captchaToken();
    const failed = expect(second).rejects.toThrow("timeout");
    await jest.advanceTimersByTimeAsync(1);
    request!.interacting(true);
    request!.interacting(false);
    await jest.advanceTimersByTimeAsync(captcha.CAPTCHA_TIMEOUT_MS + 1);
    await failed;
    unregister();
    jest.useRealTimers();
  });

  it("gives up after the timeout", async () => {
    jest.useFakeTimers();
    const captcha = load();
    const unregister = captcha.registerCaptchaHost(() => {});
    const pending = captcha.captchaToken();
    const failed = expect(pending).rejects.toThrow("timeout");
    await jest.advanceTimersByTimeAsync(captcha.CAPTCHA_TIMEOUT_MS + 1);
    await failed;
    unregister();
    jest.useRealTimers();
  });
});

describe("captcha on the web", () => {
  it("renders Turnstile in the page and removes it once it has a token", async () => {
    process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY = "0xWEB";
    let captcha: typeof import("@/services/captcha") | undefined;
    jest.isolateModules(() => {
      jest.doMock("react-native", () => ({ Platform: { OS: "web" } }));
      captcha = jest.requireActual("@/services/captcha");
    });
    delete process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
    const removed: string[] = [];
    const box = { style: { cssText: "" }, remove: jest.fn() };
    const g = globalThis as unknown as Record<string, unknown>;
    g.document = { createElement: () => box, body: { appendChild: jest.fn() }, head: { appendChild: jest.fn() } };
    g.turnstile = {
      render: (_el: unknown, options: { sitekey: string; callback: (t: string) => void }) => {
        expect(options.sitekey).toBe("0xWEB");
        setTimeout(() => options.callback("web-token"), 0);
        return "w1";
      },
      remove: (id: string) => removed.push(id),
    };
    await expect(captcha?.captchaToken()).resolves.toBe("web-token");
    expect(removed).toEqual(["w1"]);
    expect(box.remove).toHaveBeenCalled();
    delete g.document;
    delete g.turnstile;
  });
});
