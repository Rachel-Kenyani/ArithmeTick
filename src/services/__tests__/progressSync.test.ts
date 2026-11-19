const mockGetSession = jest.fn();
const calls: { op: string; args: unknown[] }[] = [];
let mockResult: { data?: unknown; error: unknown } = { error: null };

function mockTable() {
  const record = (op: string) => (...args: unknown[]) => {
    calls.push({ op, args });
    return chain;
  };
  const chain = {
    select: record("select"),
    eq: record("eq"),
    upsert: record("upsert"),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(mockResult).then(resolve),
  };
  return chain;
}

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getSession: mockGetSession }, from: mockTable }),
}));

process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { progressSync } = require("@/services/progressSync") as typeof import("@/services/progressSync");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeProfile } = require("@/state/seed") as typeof import("@/state/seed");

const child = () => ({ ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), drafts: { "g1-l2": { pal: false, board: { misses: 0 } } } });
const signedIn = () => mockGetSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });

beforeEach(() => {
  calls.length = 0;
  mockResult = { error: null };
  jest.clearAllMocks();
});

describe("progressSync.save", () => {
  it("saves each child under the parent's account, without unfinished boards", async () => {
    signedIn();
    const c = child();
    await expect(progressSync.save([c])).resolves.toBe(true);
    const rows = calls.find((x) => x.op === "upsert")?.args[0] as { user_id: string; child_id: string; profile: object }[];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ user_id: "user-1", child_id: c.id });
    expect(rows[0].profile).not.toHaveProperty("drafts");
  });

  it("saves nothing for an empty family or without a session", async () => {
    signedIn();
    await expect(progressSync.save([])).resolves.toBe(false);
    mockGetSession.mockResolvedValue({ data: { session: null } });
    await expect(progressSync.save([child()])).resolves.toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("reports a failed save without throwing", async () => {
    signedIn();
    mockResult = { error: { message: "down" } };
    await expect(progressSync.save([child()])).resolves.toBe(false);
  });
});

describe("progressSync.load", () => {
  it("returns the saved children for the signed-in parent only", async () => {
    signedIn();
    const c = child();
    mockResult = { data: [{ profile: c }, { profile: null }], error: null };
    const loaded = await progressSync.load();
    expect(loaded?.map((p) => p.id)).toEqual([c.id]);
    expect(calls.find((x) => x.op === "eq")?.args).toEqual(["user_id", "user-1"]);
  });

  it("is null when the account can't be reached, so nothing is overwritten", async () => {
    signedIn();
    mockResult = { data: null, error: { message: "down" } };
    await expect(progressSync.load()).resolves.toBeNull();
    mockGetSession.mockRejectedValue(new Error("offline"));
    await expect(progressSync.load()).resolves.toBeNull();
  });
});
