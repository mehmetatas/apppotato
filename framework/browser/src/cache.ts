import type { CacheProvider } from "@broccoliapps/shared";

type CacheValue<T> = {
  value: T;
  expiresAt?: number; // epoch ms
};

type StorageType = "local" | "session";

type CacheOptions = {
  storage?: StorageType;
};

const getStorage = (storage: StorageType = "local"): Storage => {
  return storage === "session" ? sessionStorage : localStorage;
};

const set = <T>(key: string, value: T, expiresAt?: number, options?: CacheOptions): void => {
  const cacheValue: CacheValue<T> = { value, expiresAt };
  getStorage(options?.storage).setItem(key, JSON.stringify(cacheValue));
};

const get = <T>(key: string, options?: CacheOptions): T | null => {
  const storage = getStorage(options?.storage);
  const raw = storage.getItem(key);
  if (!raw) {return null;}

  try {
    const cacheValue: CacheValue<T> = JSON.parse(raw);
    // Validate it has the expected structure
    if (typeof cacheValue !== "object" || cacheValue === null || !("value" in cacheValue)) {
      storage.removeItem(key);
      return null;
    }
    if (cacheValue.expiresAt && Date.now() > cacheValue.expiresAt) {
      storage.removeItem(key);
      return null;
    }
    return cacheValue.value;
  } catch {
    // Invalid JSON or unexpected format - remove corrupted entry
    storage.removeItem(key);
    return null;
  }
};

const remove = (key: string, options?: CacheOptions): void => {
  getStorage(options?.storage).removeItem(key);
};

const removeByPrefix = (prefix: string, options?: CacheOptions): void => {
  const storage = getStorage(options?.storage);
  const keysToRemove = keys(prefix, options);
  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
};

const keys = (prefix: string, options?: CacheOptions): string[] => {
  const storage = getStorage(options?.storage);
  const result: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(prefix)) {
      result.push(key);
    }
  }
  return result;
};

const clear = (options?: CacheOptions): void => {
  getStorage(options?.storage).clear();
};

export const cache: CacheProvider = { set, get, remove, removeByPrefix, keys, clear };
