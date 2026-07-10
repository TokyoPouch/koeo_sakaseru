const DB_NAME = "koeo-sakaseru-audio-cache";
const STORE_NAME = "audio";
const DB_VERSION = 1;
const TTL_MS = 24 * 60 * 60 * 1000;
const VOICE_HASH_STORAGE_KEY = "koeo-sakaseru:voice-hash";

interface CacheEntry {
  blob: Blob;
  createdAt: number;
}

function normalizeText(text: string): string {
  return text.trim().normalize("NFKC");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getStoredVoiceHash(): string | null {
  try {
    return window.localStorage.getItem(VOICE_HASH_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredVoiceHash(hash: string): void {
  try {
    window.localStorage.setItem(VOICE_HASH_STORAGE_KEY, hash);
  } catch {
    // 保存できなくてもキャッシュは最適化に過ぎないため無視する
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function buildCacheKey(text: string): Promise<string | null> {
  const voiceHash = getStoredVoiceHash();
  if (!voiceHash) return null;
  const textHash = await sha256Hex(normalizeText(text));
  return `${textHash}::${voiceHash}`;
}

/** キャッシュ済みの音声Blobがあれば返す。無ければ（または失敗時は）nullを返し、呼び出し側は通常どおりAPIを呼ぶ。 */
export async function getCachedAudio(text: string): Promise<Blob | null> {
  try {
    const key = await buildCacheKey(text);
    if (!key) return null;

    const db = await openDb();
    const entry = await new Promise<CacheEntry | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result as CacheEntry | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();

    if (!entry) return null;
    if (Date.now() - entry.createdAt > TTL_MS) return null;
    return entry.blob;
  } catch {
    return null;
  }
}

/** 生成済み音声を保存する。失敗しても再生自体には影響させない（呼び出し側でcatchすること）。 */
export async function putCachedAudio(
  text: string,
  blob: Blob,
  voiceCacheKeyHeader: string | null
): Promise<void> {
  if (!voiceCacheKeyHeader) return;
  setStoredVoiceHash(voiceCacheKeyHeader);

  const textHash = await sha256Hex(normalizeText(text));
  const key = `${textHash}::${voiceCacheKeyHeader}`;
  const entry: CacheEntry = { blob, createdAt: Date.now() };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(entry, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
