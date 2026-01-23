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

  const cacheValue: CacheValue<T> = JSON.parse(raw);
  if (cacheValue.expiresAt && Date.now() > cacheValue.expiresAt) {
    storage.removeItem(key);
    return null;
  }
  return cacheValue.value;
};

const remove = (key: string, options?: CacheOptions): void => {
  getStorage(options?.storage).removeItem(key);
};

const removeByPrefix = (prefix: string, options?: CacheOptions): void => {
  const storage = getStorage(options?.storage);
  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
};

export const cache = { set, get, remove, removeByPrefix };
