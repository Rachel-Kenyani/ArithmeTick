const mockLoad = jest.fn();
const mockSave = jest.fn();
jest.mock("@/services/progressSync", () => ({ progressSync: { load: mockLoad, save: mockSave } }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sync = require("@/services/familySync") as typeof import("@/services/familySync");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { accountActions } = require("@/state/actions/account") as typeof import("@/state/actions/account");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const core = require("@/state/core") as typeof import("@/state/core");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeProfile } = require("@/state/seed") as typeof import("@/state/seed");

const child = (id: string, stars: number) => ({ ...makeProfile({ name: id, grade: 1, avatar: "owl" }), id, stars });
const flush = () => new Promise<void>((r) => setImmediate(() => r()));

let stop: () => void = () => {};

beforeEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  sync.resetFamilySync();
  core.setState(() => core.DEFAULT_STATE);
  mockSave.mockResolvedValue(true);
});

afterEach(() => stop());

describe("restoreFamily", () => {
  it("brings back the saved family and saves the merged result", async () => {
    accountActions.login("parent@gmail.com");
    mockLoad.mockResolvedValue([child("a", 12)]);
    await sync.restoreFamily();
    expect(core.getSnapshot().profiles.map((p) => p.id)).toEqual(["a"]);
    expect(mockSave).toHaveBeenCalledWith(core.getSnapshot().profiles);
  });

  it("does nothing when nobody is signed in", async () => {
    await sync.restoreFamily();
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it("changes nothing and saves nothing when the account can't be reached", async () => {
    accountActions.login("parent@gmail.com");
    core.setState((s) => ({ ...s, profiles: [child("a", 3)] }));
    mockLoad.mockResolvedValue(null);
    await sync.restoreFamily();
    expect(core.getSnapshot().profiles[0].stars).toBe(3);
    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe("startFamilySync", () => {
  it("restores before it ever saves, so old progress on this phone can't overwrite newer saved progress", async () => {
    accountActions.login("parent@gmail.com");
    core.setState((s) => ({ ...s, profiles: [child("a", 3)] }));
    let finishLoad: (v: unknown) => void = () => {};
    mockLoad.mockReturnValue(new Promise((r) => (finishLoad = r)));
    stop = sync.startFamilySync();
    core.setState((s) => ({ ...s, profiles: [child("a", 4)] }));
    expect(mockSave).not.toHaveBeenCalled();
    finishLoad([child("a", 30)]);
    await flush();
    expect(core.getSnapshot().profiles[0].stars).toBe(30);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.calls[0][0][0].stars).toBe(30);
  });

  it("saves once, a moment after a burst of changes", async () => {
    accountActions.login("parent@gmail.com");
    mockLoad.mockResolvedValue([]);
    stop = sync.startFamilySync();
    await flush();
    mockSave.mockClear();
    jest.useFakeTimers();
    core.setState((s) => ({ ...s, profiles: [child("a", 3)] }));
    core.setState((s) => ({ ...s, profiles: [child("a", 6)] }));
    expect(mockSave).not.toHaveBeenCalled();
    jest.advanceTimersByTime(sync.SAVE_DELAY_MS);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.calls[0][0][0].stars).toBe(6);
  });

  it("stops saving after logging out", async () => {
    accountActions.login("parent@gmail.com");
    mockLoad.mockResolvedValue([]);
    stop = sync.startFamilySync();
    await flush();
    mockSave.mockClear();
    jest.useFakeTimers();
    core.setState((s) => ({ ...s, profiles: [child("a", 3)] }));
    accountActions.logout();
    jest.advanceTimersByTime(sync.SAVE_DELAY_MS * 2);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("restores again for the next account to sign in", async () => {
    accountActions.login("first@gmail.com");
    mockLoad.mockResolvedValue([]);
    stop = sync.startFamilySync();
    await flush();
    accountActions.logout();
    mockLoad.mockClear();
    mockLoad.mockResolvedValue([child("b", 5)]);
    await sync.restoreFamily();
    expect(mockLoad).not.toHaveBeenCalled();
    accountActions.login("second@gmail.com");
    await sync.restoreFamily();
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(core.getSnapshot().profiles.map((p) => p.id)).toEqual(["b"]);
  });
});
