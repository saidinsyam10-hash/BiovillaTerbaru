// Media Store with Permanent Server File Persistence, IndexedDB, and Local Storage sync

const DB_NAME = 'biovillage_media_db';
const STORE_NAME = 'media_blobs';

// Cache for permanent server URLs loaded from /api/media/all
const serverMediaCache: Record<string, string> = {};
let isInitialized = false;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const listeners = new Set<() => void>();

export function onMediaUpdated(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function notifyMediaUpdated(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

// Convert Blob to Base64 data URL
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Persist single media item to server disk (public/assets/)
async function persistToServer(key: string, fileOrDataUrl: Blob | string, filename?: string): Promise<string | null> {
  try {
    let dataUrl: string;
    let mimeType: string | undefined;

    if (typeof fileOrDataUrl === 'string') {
      dataUrl = fileOrDataUrl;
    } else {
      dataUrl = await blobToDataUrl(fileOrDataUrl);
      mimeType = fileOrDataUrl.type;
      if (!filename && (fileOrDataUrl as File).name) {
        filename = (fileOrDataUrl as File).name;
      }
    }

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, dataUrl, filename, mimeType })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        serverMediaCache[key] = data.url;
        const cleanKey = key.replace(/^__MEDIA__/, '').trim();
        serverMediaCache[cleanKey] = data.url;
        return data.url;
      }
    }
  } catch (err) {
    console.warn('[MediaStore] Server persistence note:', err);
  }
  return null;
}

export async function saveMediaBlob(key: string, file: Blob): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Automatically persist permanently to project server disk
    persistToServer(key, file).then(() => {
      notifyMediaUpdated();
    });

    notifyMediaUpdated();
  } catch (err) {
    console.warn('Failed to save to IndexedDB', err);
  }
}

export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    delete serverMediaCache[key];
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    delete serverMediaCache[cleanKey];

    fetch(`/api/media/${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => {});

    notifyMediaUpdated();
  } catch (err) {
    console.warn('Failed to delete from IndexedDB', err);
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getMediaObjectURL(key: string): Promise<string | null> {
  const cleanKey = key.replace(/^__MEDIA__/, '').trim();

  // 1. Check in-memory permanent server cache first
  if (serverMediaCache[key]) return serverMediaCache[key];
  if (serverMediaCache[cleanKey]) return serverMediaCache[cleanKey];

  // 2. Check IndexedDB
  const blob = await getMediaBlob(key) || (cleanKey !== key ? await getMediaBlob(cleanKey) : null);
  if (blob) {
    return URL.createObjectURL(blob);
  }

  // 3. Check custom URL
  const customUrl = getCustomMediaUrl(key) || getCustomMediaUrl(cleanKey);
  if (customUrl) return customUrl;

  return null;
}

export function getCustomMediaUrl(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    if (serverMediaCache[key]) return serverMediaCache[key];
    if (serverMediaCache[cleanKey]) return serverMediaCache[cleanKey];

    const data = localStorage.getItem('biovillage_custom_media_urls');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed[key] || parsed[cleanKey] || null;
  } catch {
    return null;
  }
}

export function saveCustomMediaUrl(key: string, url: string): void {
  try {
    if (typeof window === 'undefined') return;
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const data = localStorage.getItem('biovillage_custom_media_urls');
    const parsed = data ? JSON.parse(data) : {};
    parsed[key] = url;
    parsed[cleanKey] = url;
    localStorage.setItem('biovillage_custom_media_urls', JSON.stringify(parsed));

    // If it's a data URL, persist permanently to server disk
    if (url.startsWith('data:')) {
      persistToServer(key, url).then(() => {
        notifyMediaUpdated();
      });
    }

    notifyMediaUpdated();
  } catch (e) {
    console.error(e);
  }
}

export function deleteCustomMediaUrl(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const data = localStorage.getItem('biovillage_custom_media_urls');
    if (!data) return;
    const parsed = JSON.parse(data);
    delete parsed[key];
    delete parsed[cleanKey];
    localStorage.setItem('biovillage_custom_media_urls', JSON.stringify(parsed));
    notifyMediaUpdated();
  } catch (e) {
    console.error(e);
  }
}

export async function getMediaResolvedURL(key: string): Promise<string | null> {
  const cleanKey = key.replace(/^__MEDIA__/, '').trim();
  const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

  // 1. Check permanent server cache
  if (serverMediaCache[cleanKey]) return serverMediaCache[cleanKey];
  if (serverMediaCache[baseKey]) return serverMediaCache[baseKey];
  if (serverMediaCache[key]) return serverMediaCache[key];

  // 2. Check custom URL
  const customUrl = getCustomMediaUrl(cleanKey) || getCustomMediaUrl(baseKey) || getCustomMediaUrl(key);
  if (customUrl) return customUrl;

  // 3. Check IndexedDB blobs with various keys
  const blob1 = await getMediaObjectURL(cleanKey);
  if (blob1) return blob1;

  if (baseKey !== cleanKey) {
    const blob2 = await getMediaObjectURL(baseKey);
    if (blob2) return blob2;
  }

  const blob3 = await getMediaObjectURL(key);
  if (blob3) return blob3;

  return null;
}

/**
 * Returns candidate URLs for the given asset identifier.
 * Supports variations like "asset 001", "asset_001.mp4", "asset_002", etc.
 */
export function getAssetCandidates(assetName: string, defaultExt: string = 'png'): string[] {
  const clean = assetName.replace(/^__MEDIA__/, '').trim();
  const baseWithoutExt = clean.replace(/\.[a-zA-Z0-9]+$/, '');
  const baseUnderscore = baseWithoutExt.replace(/\s+/g, '_');
  const baseSpace = baseWithoutExt.replace(/_+/g, ' ');

  const extensions = defaultExt === 'mp4' 
    ? ['.mp4', '.webm', ''] 
    : ['.png', '.jpeg', '.jpg', '.webp', ''];

  const results: string[] = [];

  // Check if server media cache has a direct URL
  if (serverMediaCache[clean]) results.push(serverMediaCache[clean]);
  if (serverMediaCache[baseUnderscore]) results.push(serverMediaCache[baseUnderscore]);

  // Exact first
  results.push(`/assets/${clean}`);
  results.push(`/assets/${encodeURIComponent(clean)}`);
  results.push(`/${clean}`);
  results.push(`/${encodeURIComponent(clean)}`);

  // Stage 0 Petunjuk aliases
  if (clean.includes('015') || clean.toLowerCase().includes('petunjuk')) {
    results.push('/assets/Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg');
    results.push('/Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg');
    results.push('Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg');
  }

  // Variations with underscore and space
  extensions.forEach(ext => {
    const withExtUnderscore = `${baseUnderscore}${ext}`;
    const withExtSpace = `${baseSpace}${ext}`;
    
    if (!results.includes(`/assets/${withExtUnderscore}`)) {
      results.push(`/assets/${withExtUnderscore}`);
    }
    if (!results.includes(`/assets/${encodeURIComponent(withExtSpace)}`)) {
      results.push(`/assets/${encodeURIComponent(withExtSpace)}`);
      results.push(`/assets/${withExtSpace}`);
    }
  });

  return Array.from(new Set(results));
}

/**
 * Initialize Media Store:
 * 1. Pulls all permanently persisted media from server manifest (/api/media/all)
 * 2. Sweeps any IndexedDB or localStorage items and syncs them to server disk
 */
export async function initMediaStore(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Fetch server manifest
    const res = await fetch('/api/media/all');
    if (res.ok) {
      const data = await res.json();
      if (data.items) {
        Object.entries(data.items).forEach(([k, item]: [string, any]) => {
          if (item?.url) {
            serverMediaCache[k] = item.url;
            const clean = k.replace(/^__MEDIA__/, '').trim();
            serverMediaCache[clean] = item.url;
          }
        });
      }
    }
  } catch (err) {
    console.warn('[MediaStore] Server fetch failed, running local mode:', err);
  }

  // 2. Sync local IndexedDB items to server disk if needed
  try {
    const db = await openDB();
    const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];
    const rawEntries: Array<{ key: string; blob: Blob }> = [];

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          rawEntries.push({ key: String(cursor.key), blob: cursor.value as Blob });
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => resolve();
    });

    // Process blobs to data URLs outside the transaction
    for (const entry of rawEntries) {
      if (!serverMediaCache[entry.key] && entry.blob) {
        try {
          const dataUrl = await blobToDataUrl(entry.blob);
          itemsToSync.push({ key: entry.key, dataUrl, filename: (entry.blob as File).name });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Also check localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('biovillage_custom_media_urls');
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === 'string' && v.startsWith('data:') && !serverMediaCache[k]) {
              itemsToSync.push({ key: k, dataUrl: v });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (itemsToSync.length > 0) {
      console.log(`[MediaStore] Syncing ${itemsToSync.length} browser media items permanently to project disk...`);
      const syncRes = await fetch('/api/media/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSync })
      });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        console.log(`[MediaStore] Synchronized ${syncData.savedCount} items to project disk!`);
      }
    }

    notifyMediaUpdated();
  } catch (err) {
    console.warn('[MediaStore] Local sync error:', err);
  }
}

/**
 * Manually trigger full synchronization of all browser media to server disk
 */
export async function syncAllMediaToProject(): Promise<{ synced: number; total: number }> {
  try {
    const db = await openDB();
    const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];

    const rawEntries: Array<{ key: string; blob: Blob }> = [];

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          rawEntries.push({ key: String(cursor.key), blob: cursor.value as Blob });
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => resolve();
    });

    for (const entry of rawEntries) {
      if (entry.blob) {
        try {
          const dataUrl = await blobToDataUrl(entry.blob);
          itemsToSync.push({ key: entry.key, dataUrl, filename: (entry.blob as File).name });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Also localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('biovillage_custom_media_urls');
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === 'string' && v.startsWith('data:')) {
              itemsToSync.push({ key: k, dataUrl: v });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    const res = await fetch('/api/media/sync-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToSync })
    });

    if (res.ok) {
      const data = await res.json();
      // Re-fetch manifest
      const ref = await fetch('/api/media/all');
      if (ref.ok) {
        const allData = await ref.json();
        if (allData.items) {
          Object.entries(allData.items).forEach(([k, item]: [string, any]) => {
            if (item?.url) {
              serverMediaCache[k] = item.url;
              serverMediaCache[k.replace(/^__MEDIA__/, '').trim()] = item.url;
            }
          });
        }
      }
      notifyMediaUpdated();
      return { synced: data.savedCount || 0, total: data.total || 0 };
    }
  } catch (err) {
    console.error('Failed to sync all media:', err);
  }
  return { synced: 0, total: 0 };
}

/**
 * Trigger download of full project media backup JSON
 */
export function downloadMediaBackup(): void {
  window.open('/api/media/export-backup', '_blank');
}

/**
 * Restore media backup from JSON file
 */
export async function restoreMediaBackup(jsonFile: File): Promise<boolean> {
  try {
    const text = await jsonFile.text();
    const parsed = JSON.parse(text);
    if (!parsed.items || typeof parsed.items !== 'object') {
      throw new Error('Format cadangan tidak valid');
    }

    const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];
    for (const [key, item] of Object.entries(parsed.items) as [string, any][]) {
      if (item.dataUrl) {
        itemsToSync.push({ key, dataUrl: item.dataUrl, filename: item.filename });
        // Also write to IndexedDB
        try {
          const res = await fetch(item.dataUrl);
          const blob = await res.blob();
          const db = await openDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(blob, key);
        } catch (e) {
          console.warn('IndexedDB restore failed for key', key, e);
        }
      }
    }

    const res = await fetch('/api/media/sync-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToSync })
    });

    if (res.ok) {
      // Refresh server cache
      const ref = await fetch('/api/media/all');
      if (ref.ok) {
        const allData = await ref.json();
        if (allData.items) {
          Object.entries(allData.items).forEach(([k, item]: [string, any]) => {
            if (item?.url) {
              serverMediaCache[k] = item.url;
              serverMediaCache[k.replace(/^__MEDIA__/, '').trim()] = item.url;
            }
          });
        }
      }
      notifyMediaUpdated();
      return true;
    }
  } catch (err) {
    console.error('Restore error:', err);
  }
  return false;
}
