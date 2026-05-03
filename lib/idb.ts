const DB_NAME = "arengcon";
const DB_VERSION = 1;
const STORE = "kv";

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB only available in browser"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => res(req.result as T | undefined);
    req.onerror = () => rej(req.error);
  });
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value as unknown, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function idbDel(key: string): Promise<void> {
  const db = await getDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
