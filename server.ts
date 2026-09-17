import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ManifestItem {
  key: string;
  filename: string;
  url: string;
  updatedAt: string;
  size?: number;
  mimeType?: string;
}

interface Manifest {
  updatedAt: string;
  items: Record<string, ManifestItem>;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const MANIFEST_FILE = path.join(PUBLIC_DIR, 'media_manifest.json');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function loadManifest(): Manifest {
  try {
    if (fs.existsSync(MANIFEST_FILE)) {
      const content = fs.readFileSync(MANIFEST_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading media manifest:', err);
  }
  return { updatedAt: new Date().toISOString(), items: {} };
}

function saveManifest(manifest: Manifest) {
  try {
    manifest.updatedAt = new Date().toISOString();
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving media manifest:', err);
  }
}

function getSafeFilename(key: string, dataUrl: string, requestedFilename?: string): string {
  if (requestedFilename && requestedFilename.trim()) {
    return requestedFilename.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  }
  const cleanKey = key.replace(/^__MEDIA__/, '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  if (/\.[a-zA-Z0-9]+$/.test(cleanKey)) {
    return cleanKey;
  }
  // Detect extension from data URL
  let ext = '.png';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) ext = '.jpg';
  else if (dataUrl.startsWith('data:image/webp')) ext = '.webp';
  else if (dataUrl.startsWith('data:image/svg')) ext = '.svg';
  else if (dataUrl.startsWith('data:video/mp4')) ext = '.mp4';
  else if (dataUrl.startsWith('data:video/webm')) ext = '.webm';

  return `${cleanKey}${ext}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 uploads (up to 100MB for media/videos/images)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Get all permanently persisted media
  app.get('/api/media/all', (_req, res) => {
    const manifest = loadManifest();
    res.json({
      success: true,
      updatedAt: manifest.updatedAt,
      items: manifest.items,
      count: Object.keys(manifest.items).length
    });
  });

  // 2. Upload / Persist single media permanently into project
  app.post('/api/media/upload', (req, res) => {
    try {
      const { key, dataUrl, filename, mimeType } = req.body;
      if (!key || !dataUrl) {
        return res.status(400).json({ success: false, error: 'Key and dataUrl are required' });
      }

      const safeFilename = getSafeFilename(key, dataUrl, filename);
      const manifest = loadManifest();

      // Convert data URL to Buffer
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        // Raw string or unexpected format
        buffer = Buffer.from(dataUrl);
      }

      // Save to both public/assets and public/uploads for max reliability
      const assetDest = path.join(ASSETS_DIR, safeFilename);
      const uploadDest = path.join(UPLOADS_DIR, safeFilename);

      fs.writeFileSync(assetDest, buffer);
      fs.writeFileSync(uploadDest, buffer);

      const mediaUrl = `/assets/${safeFilename}`;
      const item: ManifestItem = {
        key,
        filename: safeFilename,
        url: mediaUrl,
        updatedAt: new Date().toISOString(),
        size: buffer.length,
        mimeType: mimeType || (matches ? matches[1] : undefined)
      };

      manifest.items[key] = item;
      // Also register clean key if prefixed
      const cleanKey = key.replace(/^__MEDIA__/, '').trim();
      if (cleanKey !== key) {
        manifest.items[cleanKey] = item;
      }

      saveManifest(manifest);

      console.log(`[Media Persisted] Key: "${key}" -> Saved to ${assetDest} (${buffer.length} bytes)`);

      res.json({
        success: true,
        item,
        url: mediaUrl
      });
    } catch (err: any) {
      console.error('Failed to persist media:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server write error' });
    }
  });

  // 3. Batch Sync from client (e.g., synchronizing all existing IndexedDB/localStorage images)
  app.post('/api/media/sync-batch', (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Expected array of items' });
      }

      const manifest = loadManifest();
      let savedCount = 0;

      for (const entry of items) {
        const { key, dataUrl, filename } = entry;
        if (!key || !dataUrl) continue;

        try {
          const safeFilename = getSafeFilename(key, dataUrl, filename);
          const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) continue;

          const buffer = Buffer.from(matches[2], 'base64');
          const assetDest = path.join(ASSETS_DIR, safeFilename);
          const uploadDest = path.join(UPLOADS_DIR, safeFilename);

          fs.writeFileSync(assetDest, buffer);
          fs.writeFileSync(uploadDest, buffer);

          const mediaUrl = `/assets/${safeFilename}`;
          const item: ManifestItem = {
            key,
            filename: safeFilename,
            url: mediaUrl,
            updatedAt: new Date().toISOString(),
            size: buffer.length,
            mimeType: matches[1]
          };

          manifest.items[key] = item;
          const cleanKey = key.replace(/^__MEDIA__/, '').trim();
          if (cleanKey !== key) {
            manifest.items[cleanKey] = item;
          }
          savedCount++;
        } catch (e) {
          console.error(`Failed to batch write key: ${key}`, e);
        }
      }

      saveManifest(manifest);
      res.json({ success: true, savedCount, total: Object.keys(manifest.items).length });
    } catch (err: any) {
      console.error('Failed batch sync:', err);
      res.status(500).json({ success: false, error: err?.message || 'Batch sync error' });
    }
  });

  // 4. Download / Export full media backup
  app.get('/api/media/export-backup', (_req, res) => {
    try {
      const manifest = loadManifest();
      const backupData: Record<string, { filename: string; dataUrl: string; mimeType?: string }> = {};

      for (const [key, item] of Object.entries(manifest.items)) {
        const filePath = path.join(ASSETS_DIR, item.filename);
        if (fs.existsSync(filePath)) {
          const buf = fs.readFileSync(filePath);
          const mime = item.mimeType || 'image/png';
          backupData[key] = {
            filename: item.filename,
            mimeType: mime,
            dataUrl: `data:${mime};base64,${buf.toString('base64')}`
          };
        }
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="biovillage_media_backup.json"');
      res.json({
        exportDate: new Date().toISOString(),
        version: '1.0',
        items: backupData
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 5. Direct delete of a media key
  app.delete('/api/media/:key', (req, res) => {
    try {
      const { key } = req.params;
      const manifest = loadManifest();
      if (manifest.items[key]) {
        const filename = manifest.items[key].filename;
        const p1 = path.join(ASSETS_DIR, filename);
        const p2 = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(p1)) fs.unlinkSync(p1);
        if (fs.existsSync(p2)) fs.unlinkSync(p2);
        delete manifest.items[key];
        saveManifest(manifest);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Serve static assets directory directly as well
  app.use('/assets', express.static(ASSETS_DIR));
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use(express.static(PUBLIC_DIR));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BioVillage Server with Persistent Media running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
