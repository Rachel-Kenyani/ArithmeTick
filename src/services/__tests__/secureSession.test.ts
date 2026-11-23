import { CHUNK_SIZE, chunkedStorage, type KeyValueStore } from "@/services/secureSession";

jest.mock("expo-secure-store", () => ({}));

function memory(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItemAsync: async (k) => data.get(k) ?? null,
    setItemAsync: async (k, v) => {
      data.set(k, v);
    },
    deleteItemAsync: async (k) => {
      data.delete(k);
    },
  };
}

function legacyStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (k: string) => data.get(k) ?? null,
    removeItem: async (k: string) => {
      data.delete(k);
    },
  };
}

describe("chunkedStorage", () => {
  it("saves a long session in pieces and reads it back whole", async () => {
    const store = memory();
    const storage = chunkedStorage(store, legacyStore());
    const session = "x".repeat(CHUNK_SIZE * 2 + 5);
    await storage.setItem("sb-abc-auth-token", session);
    expect(store.data.get("sb-abc-auth-token.n")).toBe("3");
    expect([...store.data.values()].every((v) => v.length <= CHUNK_SIZE)).toBe(true);
    await expect(storage.getItem("sb-abc-auth-token")).resolves.toBe(session);
  });

  it("replaces a longer session with a shorter one without leftover pieces", async () => {
    const store = memory();
    const storage = chunkedStorage(store, legacyStore());
    await storage.setItem("k", "a".repeat(CHUNK_SIZE * 3));
    await storage.setItem("k", "short");
    await expect(storage.getItem("k")).resolves.toBe("short");
    expect(store.data.size).toBe(2);
  });

  it("moves a session saved in plain storage into the encrypted store, so nobody is signed out", async () => {
    const store = memory();
    const legacy = legacyStore({ k: "old-session" });
    const storage = chunkedStorage(store, legacy);
    await expect(storage.getItem("k")).resolves.toBe("old-session");
    expect(legacy.data.has("k")).toBe(false);
    await expect(storage.getItem("k")).resolves.toBe("old-session");
  });

  it("removes every piece on sign-out", async () => {
    const store = memory();
    const storage = chunkedStorage(store, legacyStore());
    await storage.setItem("k", "b".repeat(CHUNK_SIZE + 1));
    await storage.removeItem("k");
    expect(store.data.size).toBe(0);
    await expect(storage.getItem("k")).resolves.toBeNull();
  });

  it("returns nothing when a piece is missing, rather than a broken session", async () => {
    const store = memory();
    const storage = chunkedStorage(store, legacyStore());
    await storage.setItem("k", "c".repeat(CHUNK_SIZE + 1));
    store.data.delete("k.1");
    await expect(storage.getItem("k")).resolves.toBeNull();
  });
});
