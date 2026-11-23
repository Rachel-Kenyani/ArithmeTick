const mockGetSession = jest.fn();
const mockInsert = jest.fn();
let mockResult: { error: unknown } = { error: null };

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getSession: mockGetSession },
    from: () => ({
      insert: (row: unknown) => {
        mockInsert(row);
        return Promise.resolve(mockResult);
      },
    }),
  }),
}));
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { version: "1.0.0" } } }));

process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const reports = require("@/services/problemReports") as typeof import("@/services/problemReports");

const signedIn = () => mockGetSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });

beforeEach(() => {
  jest.clearAllMocks();
  mockResult = { error: null };
});

describe("reportProblem", () => {
  it("needs a kind and a message", () => {
    expect(reports.reportProblem({})).toEqual({ kind: expect.any(String), message: expect.any(String) });
    expect(reports.reportProblem({ kind: "broken", message: "   " }).message).toMatch(/what happened/);
  });

  it("is ready with a kind and a message", () => {
    expect(reports.reportProblem({ kind: "idea", message: "Add Kiswahili" })).toEqual({ kind: null, message: null });
  });

  it("turns away a message that is too long", () => {
    expect(reports.reportProblem({ kind: "other", message: "a".repeat(reports.MESSAGE_MAX + 1) }).message).toMatch(/2000/);
  });
});

describe("sendProblemReport", () => {
  it("saves the report under the grown-up's account, with the app version and phone type", async () => {
    signedIn();
    await expect(reports.sendProblemReport({ kind: "broken", message: "  Seeds won't drag  ", grade: 2 })).resolves.toEqual({ ok: true });
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-1",
      kind: "broken",
      message: "Seeds won't drag",
      grade: 2,
      app_version: "1.0.0",
      platform: expect.any(String),
    });
  });

  it("never sends anything about the child beyond the grade", async () => {
    signedIn();
    await reports.sendProblemReport({ kind: "hard", message: "Too small", grade: null });
    expect(Object.keys(mockInsert.mock.calls[0][0]).sort()).toEqual(["app_version", "grade", "kind", "message", "platform", "user_id"]);
  });

  it("sends nothing when the report isn't ready", async () => {
    signedIn();
    const result = await reports.sendProblemReport({ kind: "idea", message: "", grade: null });
    expect(result.ok).toBe(false);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("offers the email address when sending fails", async () => {
    signedIn();
    mockResult = { error: { message: "down" } };
    const result = await reports.sendProblemReport({ kind: "other", message: "Hello", grade: null });
    expect(!result.ok && result.message).toContain(reports.REPORT_EMAIL);
  });

  it("asks the grown-up to log in again without a session, and never throws offline", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const noSession = await reports.sendProblemReport({ kind: "other", message: "Hello", grade: null });
    expect(!noSession.ok && noSession.message).toMatch(/log in again/);
    mockGetSession.mockRejectedValue(new Error("offline"));
    await expect(reports.sendProblemReport({ kind: "other", message: "Hello", grade: null })).resolves.toMatchObject({ ok: false });
  });
});
