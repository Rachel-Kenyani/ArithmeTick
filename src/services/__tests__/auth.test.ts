const mockAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  signInWithOtp: jest.fn(),
  resend: jest.fn(),
  verifyOtp: jest.fn(),
  updateUser: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
};
const mockInvoke = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: mockAuth, functions: { invoke: mockInvoke } }),
}));

process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon";

// Loaded after the environment is set, so the client counts as configured.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { auth, failure } = require("@/services/auth") as typeof import("@/services/auth");

const ok = { data: {}, error: null };
const err = (code: string, message = code) => ({ data: {}, error: { code, message } });

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.signOut.mockResolvedValue({ error: null });
});

describe("failure messages", () => {
  it.each([
    ["invalid_credentials", "", /didn’t match/],
    ["same_password", "", /current password/],
    ["weak_password", "", /too easy/],
    ["session_not_found", "", /expired/],
    ["over_email_send_rate_limit", "", /Too many codes/],
    ["unexpected_failure", "Error sending confirmation email", /Continue with Google/],
    ["unexpected_failure", "Unexpected status code returned from hook: 502", /promotional messages/],
  ])("explains %s %s", (code, message, expected) => {
    const result = failure({ code, message: message || code }, "fallback");
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toMatch(expected);
  });

  it("asks people to wait when Supabase says how long", () => {
    const result = failure({ message: "For security purposes, you can only request this after 42 seconds." }, "fallback");
    expect(!result.ok && result.message).toMatch(/42 seconds/);
  });

  it("uses the fallback for anything unknown", () => {
    expect(failure({ code: "mystery", message: "mystery" }, "fallback")).toEqual({ ok: false, message: "fallback" });
  });
});

describe("signUp never says whether an account exists", () => {
  it("creates a new account", async () => {
    mockAuth.signUp.mockResolvedValue({ data: { user: { identities: [{}] } }, error: null });
    await expect(auth.signUp("new@gmail.com", "password1")).resolves.toEqual({ ok: true, existing: false });
    expect(mockAuth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("sends the owner a reset code when the email already has an account", async () => {
    mockAuth.signUp.mockResolvedValue({ data: { user: { identities: [] } }, error: null });
    mockAuth.resetPasswordForEmail.mockResolvedValue(ok);
    await expect(auth.signUp("taken@gmail.com", "password1")).resolves.toEqual({ ok: true, existing: true });
    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith("taken@gmail.com", expect.anything());
  });

  it("sends the owner a text code when the phone already has an account", async () => {
    mockAuth.signUp.mockResolvedValue(err("phone_exists"));
    mockAuth.signInWithOtp.mockResolvedValue(ok);
    await expect(auth.signUp("+254710515773", "password1")).resolves.toEqual({ ok: true, existing: true });
    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({ phone: "+254710515773", options: { shouldCreateUser: false } });
  });
});

describe("sendResetCode never says whether an account exists", () => {
  it.each(["otp_disabled", "user_not_found", "signup_disabled"])("treats %s as sent for a phone", async (code) => {
    mockAuth.signInWithOtp.mockResolvedValue(err(code));
    await expect(auth.sendResetCode("+254700000000")).resolves.toEqual({ ok: true });
  });

  it("treats an unknown email as sent", async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue(err("user_not_found"));
    await expect(auth.sendResetCode("nobody@gmail.com")).resolves.toEqual({ ok: true });
  });
});

describe("verifyCode", () => {
  it("checks a reset code for an existing account as a recovery code", async () => {
    mockAuth.verifyOtp.mockResolvedValue(ok);
    await auth.verifyCode({ identifier: "taken@gmail.com", purpose: "existing" }, "12345678");
    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({ email: "taken@gmail.com", token: "12345678", type: "recovery" });
  });

  it("says when the code is wrong", async () => {
    mockAuth.verifyOtp.mockResolvedValue(err("otp_expired"));
    const result = await auth.verifyCode({ identifier: "new@gmail.com", purpose: "signup" }, "00000000");
    expect(result.ok).toBe(false);
  });
});

describe("deleteAccount", () => {
  it("asks the parent to log in again without a session", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    const result = await auth.deleteAccount();
    expect(!result.ok && result.message).toMatch(/log in again/);
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("deletes on the server, then signs out", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: { access_token: "t" } } });
    mockInvoke.mockResolvedValue({ data: { deleted: true }, error: null });
    await expect(auth.deleteAccount()).resolves.toEqual({ ok: true });
    expect(mockInvoke).toHaveBeenCalledWith("delete-account", { method: "POST" });
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it("keeps the account on this phone when the server fails", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: { access_token: "t" } } });
    mockInvoke.mockResolvedValue({ data: null, error: new Error("500") });
    const result = await auth.deleteAccount();
    expect(result.ok).toBe(false);
    expect(mockAuth.signOut).not.toHaveBeenCalled();
  });
});
