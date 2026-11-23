import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Where Supabase keeps the sign-in session: the phone's encrypted store (Android Keystore), not plain app storage.
 * Encrypted values must stay small, and a session is a few kilobytes, so it is saved in numbered pieces. A session
 * saved before this change is moved over on first read, so nobody is signed out. On the web, where there is no
 * encrypted store, it stays in the browser's storage.
 */
export const CHUNK_SIZE = 1800;

/** The minimal key-value store this needs, so tests can pass an in-memory one. */
export interface KeyValueStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

/** SecureStore keys may only use letters, digits, ".", "-" and "_". */
const safeKey = (key: string) => key.replaceAll(/[^A-Za-z0-9._-]/g, "_");
const countKey = (key: string) => `${safeKey(key)}.n`;
const pieceKey = (key: string, i: number) => `${safeKey(key)}.${i}`;

export function chunkedStorage(store: KeyValueStore, legacy: Pick<typeof AsyncStorage, "getItem" | "removeItem">) {
  const remove = async (key: string) => {
    const n = Number(await store.getItemAsync(countKey(key))) || 0;
    await Promise.all(Array.from({ length: n }, (_, i) => store.deleteItemAsync(pieceKey(key, i))));
    await store.deleteItemAsync(countKey(key));
  };

  const write = async (key: string, value: string) => {
    await remove(key);
    const pieces = Array.from({ length: Math.ceil(value.length / CHUNK_SIZE) }, (_, i) =>
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
    );
    await Promise.all(pieces.map((piece, i) => store.setItemAsync(pieceKey(key, i), piece)));
    await store.setItemAsync(countKey(key), String(pieces.length));
  };

  return {
    async getItem(key: string): Promise<string | null> {
      const n = Number(await store.getItemAsync(countKey(key))) || 0;
      if (n > 0) {
        const pieces = await Promise.all(Array.from({ length: n }, (_, i) => store.getItemAsync(pieceKey(key, i))));
        return pieces.some((piece) => piece === null) ? null : pieces.join("");
      }
      const old = await legacy.getItem(key);
      if (old === null) return null;
      await write(key, old);
      await legacy.removeItem(key);
      return old;
    },
    setItem: write,
    async removeItem(key: string): Promise<void> {
      await remove(key);
      await legacy.removeItem(key);
    },
  };
}

export const secureSessionStorage = Platform.OS === "web" ? AsyncStorage : chunkedStorage(SecureStore, AsyncStorage);
