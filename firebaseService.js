/* ============================================================
   firebaseService.js — AURA OS
   REAL: Firebase Firestore init, CRUD, real-time listeners,
         presence system, offline queue, active-user tracking.
   ============================================================ */
'use strict';

const FIREBASE_CFG = {
  apiKey:            "AIzaSyAvyWqiuYYrTMVyAuAQBQsiH6KZJz81V08",
  authDomain:        "aura-tactical-v3.firebaseapp.com",
  projectId:         "aura-tactical-v3",
  storageBucket:     "aura-tactical-v3.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:aabbccddeeff0011"
};

// ── Singleton state ──────────────────────────────────────────
window.AURA_FB = window.AURA_FB || {
  db:           null,
  connected:    false,
  activeUsers:  0,
  eventsPerSec: 0,
  writeQueue:   [],          // offline write queue
  sessionId:    _makeId(),
  listeners:    {}
};
const FB = window.AURA_FB;

function _makeId() {
  return 'sess_' + Math.random().toString(36).slice(2,9) + '_' + Date.now();
}

// ── Init ─────────────────────────────────────────────────────
async function fbInit() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CFG);
    FB.db = firebase.firestore();
    // Enable offline persistence (Firestore cache)
    await FB.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    FB.connected = true;
    _flushQueue();
    _startPresence();
    _watchActiveUsers();
    _trackEventRate();
    console.log('[AURA-FB] Firestore connected');
  } catch (e) {
    console.warn('[AURA-FB] Offline mode:', e.message);
    FB.connected = false;
  }
  return FB.connected;
}

// ── Presence system ──────────────────────────────────────────
function _startPresence() {
  if (!FB.db) return;
  const ref = FB.db.collection('users').doc(FB.sessionId);
  ref.set({
    session: FB.sessionId,
    last_seen: firebase.firestore.FieldValue.serverTimestamp(),
    screen: 'landing',
    status: 'active'
  }).catch(() => {});

  // Heartbeat every 30s
  setInterval(() => {
    ref.update({
      last_seen: firebase.firestore.FieldValue.serverTimestamp(),
      screen: window._currentScreen || 'unknown'
    }).catch(() => {});
  }, 30000);
}

function fbUpdateScreen(screenId) {
  window._currentScreen = screenId;
  if (!FB.db) return;
  FB.db.collection('users').doc(FB.sessionId)
    .update({ screen: screenId, last_seen: firebase.firestore.FieldValue.serverTimestamp() })
    .catch(() => {});
}

// ── Active user count (last 2 min) ───────────────────────────
function _watchActiveUsers() {
  if (!FB.db) return;
  const cutoff = new Date(Date.now() - 2 * 60 * 1000);
  FB.db.collection('users')
    .where('last_seen', '>', cutoff)
    .onSnapshot(snap => {
      FB.activeUsers = snap.size;
      const el = document.getElementById('st-active-users');
      if (el) el.textContent = FB.activeUsers;
    }, () => {});
}

// ── Event-rate tracker ───────────────────────────────────────
let _evtCount = 0;
function _trackEventRate() {
  setInterval(() => {
    FB.eventsPerSec = _evtCount;
    _evtCount = 0;
    const el = document.getElementById('st-eps');
    if (el) el.textContent = FB.eventsPerSec + '/s';
  }, 1000);
}
function _bumpEvent() { _evtCount++; }

// ── Generic write with offline queue ────────────────────────
async function fbWrite(collection, data, docId) {
  _bumpEvent();
  if (!FB.db) {
    FB.writeQueue.push({ collection, data, docId });
    console.warn('[AURA-FB] Queued (offline):', collection);
    _showOfflineBanner();
    return null;
  }
  try {
    const col = FB.db.collection(collection);
    const ts  = firebase.firestore.FieldValue.serverTimestamp();
    if (docId) {
      await col.doc(docId).set({ ...data, timestamp: ts }, { merge: true });
      return docId;
    } else {
      const ref = await col.add({ ...data, timestamp: ts });
      return ref.id;
    }
  } catch (e) {
    console.error('[AURA-FB] Write failed:', e.message);
    FB.writeQueue.push({ collection, data, docId });
    return null;
  }
}

// ── Flush offline queue when back online ─────────────────────
async function _flushQueue() {
  if (!FB.db || FB.writeQueue.length === 0) return;
  console.log(`[AURA-FB] Flushing ${FB.writeQueue.length} queued writes`);
  const q = [...FB.writeQueue];
  FB.writeQueue = [];
  for (const op of q) {
    await fbWrite(op.collection, op.data, op.docId);
  }
  _hideOfflineBanner();
}

// ── Offline banner ────────────────────────────────────────────
function _showOfflineBanner() {
  const el = document.getElementById('offline-banner');
  if (el) el.style.display = 'flex';
}
function _hideOfflineBanner() {
  const el = document.getElementById('offline-banner');
  if (el) el.style.display = 'none';
}

// Network event listeners
window.addEventListener('online',  () => { FB.connected = true;  _flushQueue(); _hideOfflineBanner(); });
window.addEventListener('offline', () => { FB.connected = false; _showOfflineBanner(); });

// ── Real-time listener helper ─────────────────────────────────
function fbListen(collection, callback, errorCb) {
  if (!FB.db) return () => {};
  const unsub = FB.db.collection(collection).onSnapshot(snap => {
    _bumpEvent();
    const docs = [];
    snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
    callback(docs);
  }, errorCb || (() => {}));
  FB.listeners[collection] = unsub;
  return unsub;
}

// ── Seed collections if empty ─────────────────────────────────
async function fbSeedIfEmpty(collection, records) {
  if (!FB.db) return;
  try {
    const snap = await FB.db.collection(collection).limit(1).get();
    if (!snap.empty) return;
    const batch = FB.db.batch();
    records.forEach(r => {
      const ref = FB.db.collection(collection).doc(r.id || undefined);
      batch.set(ref, { ...r, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
    console.log(`[AURA-FB] Seeded ${collection} with ${records.length} records`);
  } catch (e) {
    console.warn('[AURA-FB] Seed error:', e.message);
  }
}

// ── Exports (attached to window for plain-script access) ──────
window.fbInit       = fbInit;
window.fbWrite      = fbWrite;
window.fbListen     = fbListen;
window.fbSeedIfEmpty= fbSeedIfEmpty;
window.fbUpdateScreen = fbUpdateScreen;
