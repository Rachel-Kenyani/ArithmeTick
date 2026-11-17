const mockGetSession = jest.fn();
const mockInvoke = jest.fn();
const calls: { table: string; op: string; args: unknown[] }[] = [];
let mockResult: { data?: unknown; error: unknown } = { error: null };

function mockTable(name: string) {
  const record = (op: string) => (...args: unknown[]) => {
    calls.push({ table: name, op, args });
    return chain;
  };
  const chain = {
    select: record("select"),
    eq: record("eq"),
    upsert: record("upsert"),
    delete: record("delete"),
    maybeSingle: () => Promise.resolve(mockResult),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(mockResult).then(resolve),
  };
  return chain;
}

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getSession: mockGetSession }, from: mockTable, functions: { invoke: mockInvoke } }),
}));

process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { reports } = require("@/services/reports") as typeof import("@/services/reports");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeProfile } = require("@/state/seed") as typeof import("@/state/seed");

const child = (levelsDone: number) => ({ ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), progress: { 1: levelsDone, 2: 0, 3: 0 } });
const signedIn = () => mockGetSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });

beforeEach(() => {
  calls.length = 0;
  mockResult = { error: null };
  jest.clearAllMocks();
  mockInvoke.mockResolvedValue({ data: {}, error: null });
});

describe("reports.turnOn", () => {
  it("records the opt-in and a summary for each child", async () => {
    signedIn();
    await expect(reports.turnOn([child(2), { ...child(5), name: "Tessa" }])).resolves.toEqual({ ok: true });
    const settings = calls.find((c) => c.table === "report_settings" && c.op === "upsert");
    expect(settings?.args[0]).toEqual({ user_id: "user-1" });
    const rows = calls.find((c) => c.table === "child_reports" && c.op === "upsert")?.args[0] as { user_id: string; child_name: string }[];
    expect(rows.map((r) => [r.user_id, r.child_name])).toEqual([
      ["user-1", "Jabali"],
      ["user-1", "Tessa"],
    ]);
  });

  it("never sends what the server keeps for itself", async () => {
    signedIn();
    await reports.turnOn([child(2)]);
    const rows = calls.find((c) => c.table === "child_reports" && c.op === "upsert")?.args[0] as Record<string, unknown>[];
    expect(rows[0]).not.toHaveProperty("sent_levels");
    expect(rows[0]).not.toHaveProperty("updated_at");
  });

  it("asks the grown-up to log in again without a session", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const result = await reports.turnOn([child(2)]);
    expect(!result.ok && result.message).toMatch(/log in again/);
    expect(calls).toHaveLength(0);
  });

  it("reports a failure without turning anything on", async () => {
    signedIn();
    mockResult = { error: { message: "down" } };
    const result = await reports.turnOn([child(2)]);
    expect(result.ok).toBe(false);
    expect(calls.some((c) => c.table === "child_reports")).toBe(false);
  });
});

describe("reports.turnOff", () => {
  it("deletes the children's summaries and the opt-in", async () => {
    signedIn();
    await expect(reports.turnOff()).resolves.toEqual({ ok: true });
    expect(calls.filter((c) => c.op === "delete").map((c) => c.table)).toEqual(["child_reports", "report_settings"]);
    expect(calls.filter((c) => c.op === "eq").every((c) => c.args[1] === "user-1")).toBe(true);
  });
});

describe("reports.isOn", () => {
  it("is true when an opt-in row exists, false when not", async () => {
    signedIn();
    mockResult = { data: { user_id: "user-1" }, error: null };
    await expect(reports.isOn()).resolves.toBe(true);
    mockResult = { data: null, error: null };
    await expect(reports.isOn()).resolves.toBe(false);
  });

  it("is unknown when the server can't be reached", async () => {
    signedIn();
    mockResult = { data: null, error: { message: "down" } };
    await expect(reports.isOn()).resolves.toBeNull();
  });
});

describe("reports.afterLevel", () => {
  it("refreshes the child's summary", async () => {
    signedIn();
    await reports.afterLevel(child(3), 3, true);
    expect(calls.find((c) => c.table === "child_reports" && c.op === "upsert")).toBeDefined();
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("asks for the end-of-grade email after the last level", async () => {
    signedIn();
    const done = child(9);
    await reports.afterLevel(done, 9, true);
    expect(mockInvoke).toHaveBeenCalledWith("send-report", { method: "POST", body: { kind: "grade", child_id: done.id } });
  });

  it("doesn't send the end-of-grade email again on a replay", async () => {
    signedIn();
    await reports.afterLevel(child(9), 9, false);
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("never throws, even offline", async () => {
    mockGetSession.mockRejectedValue(new Error("offline"));
    await expect(reports.afterLevel(child(3), 3, true)).resolves.toBeUndefined();
  });
});
