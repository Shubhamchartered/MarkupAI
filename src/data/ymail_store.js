/**
 * ymail_store.js — V2
 * Persistent in-memory store with separate GST and IT module states.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_FILE = join(process.cwd(), 'ymail_cache.json');

function defaultMeta() {
  return { lastRun: null, lastScanned: 0, lastMatched: 0 };
}

let _store = {
  notices: [],          // all notices
  gst: defaultMeta(),   // GST-specific sync metadata
  it:  defaultMeta(),   // IT-specific sync metadata
  running: {            // per-module running state
    gst: false,
    it:  false,
    all: false,
  },
  settings: {
    address:          process.env.YMAIL_ADDRESS || '',
    appPassword:      process.env.YMAIL_APP_PASSWORD || '',
    daysBack:         30,
    autoFetchEnabled: true,
  },
};

/* Load from disk on first import, env creds always win */
function loadFromDisk() {
  try {
    if (existsSync(CACHE_FILE)) {
      const saved = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
      _store = {
        ..._store,
        ...saved,
        running: { gst: false, it: false, all: false }, // never persist running state
        settings: {
          ...saved.settings,
          address:     process.env.YMAIL_ADDRESS     || saved.settings?.address     || '',
          appPassword: process.env.YMAIL_APP_PASSWORD || saved.settings?.appPassword || '',
        },
      };
    }
  } catch { /* first run */ }
}

function saveToDisk() {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify({ ..._store, running: { gst: false, it: false, all: false } }, null, 2), 'utf-8');
  } catch (e) {
    console.error('YmailStore: save failed:', e.message);
  }
}

loadFromDisk();

/* ── Public API ── */
export const YmailStore = {

  /* STATUS — module-aware */
  getStatus(module = 'all') {
    const meta = module === 'gst' ? _store.gst : module === 'it' ? _store.it : {
      lastRun:     _store.gst.lastRun > _store.it.lastRun ? _store.gst.lastRun : _store.it.lastRun,
      lastScanned: (_store.gst.lastScanned || 0) + (_store.it.lastScanned || 0),
      lastMatched: (_store.gst.lastMatched || 0) + (_store.it.lastMatched || 0),
    };
    const notices = this.getNotices(module === 'all' ? null : module);
    return {
      lastRun:     meta.lastRun,
      lastScanned: meta.lastScanned || 0,
      lastMatched: meta.lastMatched || 0,
      isRunning:   this.isModuleRunning(module),
      noticeCount: notices.length,
      newCount:    notices.filter(n => n.status === 'new').length,
      module,
    };
  },

  /* RUNNING STATE */
  isModuleRunning(module) {
    if (module === 'all') return _store.running.gst || _store.running.it || _store.running.all;
    return _store.running[module] || _store.running.all;
  },

  setModuleRunning(module, val) {
    if (module === 'all') {
      _store.running.all = val;
    } else {
      _store.running[module] = val;
    }
  },

  /* NOTICES — filtered by module */
  getNotices(module = null) {
    if (!module) return _store.notices;
    return _store.notices.filter(n =>
      module === 'gst' ? n.isGST : n.isIT
    );
  },

  /* MERGE — de-duplicates by uid */
  mergeNotices(newNotices, module = 'all') {
    const existing = new Set(_store.notices.map(n => n.uid));
    const fresh = newNotices.filter(n => !existing.has(n.uid));
    _store.notices = [...fresh, ..._store.notices].slice(0, 1000);
    return fresh.length;
  },

  /* SYNC META — per module */
  updateSyncMeta(scanned, matched, lastRun, module = 'all') {
    const meta = { lastRun, lastScanned: scanned, lastMatched: matched };
    if (module === 'gst' || module === 'all') Object.assign(_store.gst, meta);
    if (module === 'it'  || module === 'all') Object.assign(_store.it,  meta);
    saveToDisk();
  },

  /* MARK SEEN */
  markSeen(uid) {
    const n = _store.notices.find(x => x.uid === uid);
    if (n) { n.status = 'seen'; saveToDisk(); }
  },

  markAllSeen(module) {
    _store.notices
      .filter(n => !module || (module === 'gst' ? n.isGST : n.isIT))
      .forEach(n => { n.status = 'seen'; });
    saveToDisk();
  },

  /* SETTINGS */
  getSettings() { return { ..._store.settings }; },

  updateSettings(settings) {
    _store.settings = { ..._store.settings, ...settings };
    saveToDisk();
  },

  /* CLEAR */
  clear(module = null) {
    if (!module) {
      _store.notices = [];
    } else {
      _store.notices = _store.notices.filter(n => module === 'gst' ? !n.isGST : !n.isIT);
    }
    saveToDisk();
  },
};
