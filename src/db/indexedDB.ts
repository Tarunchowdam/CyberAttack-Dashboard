export const DB_NAME = "LocalAuthDB";
export const STORE_NAME = "users";

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "email" });
        store.createIndex("password", "password");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("IndexedDB failed to open");
  });
}

export async function insertDefaultUser() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // Default user (only inserted if not exists)
  store.put({
    email: "analyst@security.io",
    password: "admin123",
    role: "admin",
    createdAt: new Date().toISOString()
  });

  return tx.complete;
}

export async function validateUser(email: string, password: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(email);

    req.onsuccess = () => {
      const user = req.result;
      resolve(user?.password === password);
    };

    req.onerror = () => resolve(false);
  });
}

export async function addUser(email: string, password: string, role = "user") {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put({
    email,
    password,
    role,
    createdAt: new Date().toISOString()
  });
  return tx.complete;
}
