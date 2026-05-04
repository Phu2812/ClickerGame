/**
 * cloud.js — Firebase Firestore Integration
 * Handles: Login, Register, Auto-login, Cloud Sync
 *
 * Architecture:
 *  - Passwords are hashed with SHA-256 (Web Crypto API — no library needed)
 *  - Game data is stored under Firestore path: users/{username}
 *  - Local save (localStorage) always runs for instant responsiveness
 *  - Cloud sync only fires on tab-hide / tab-close to minimize writes
 */

let _db = null;
let currentUser = null;

// ──────────────────────────────────────────
// INIT
// ──────────────────────────────────────────
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK chưa được tải!');
        return;
    }
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        _db = firebase.firestore();
        // Enable offline persistence so data survives brief disconnects
        _db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
        console.log('✅ Firebase đã kết nối!');
    } catch (e) {
        // If already initialized (hot-reload), just get the existing instance
        _db = firebase.firestore();
    }
}

// ──────────────────────────────────────────
// CRYPTO — SHA-256 password hashing
// ──────────────────────────────────────────
async function hashPassword(password) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ──────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────
async function cloudRegister(username, password) {
    if (!_db) throw new Error('Không thể kết nối cơ sở dữ liệu. Kiểm tra mạng!');
    if (username.trim().length < 3) throw new Error('Tên tài khoản phải có ít nhất 3 ký tự.');
    if (password.length < 4)        throw new Error('Mật khẩu phải có ít nhất 4 ký tự.');

    const docRef = _db.collection('users').doc(username.trim());
    const snap   = await docRef.get();

    if (snap.exists) throw new Error('Tài khoản đã tồn tại! Chọn tên khác.');

    const passwordHash = await hashPassword(password);
    await docRef.set({
        passwordHash,
        data: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    currentUser = username.trim();
    return null; // fresh game state
}

async function cloudLogin(username, password) {
    if (!_db) throw new Error('Không thể kết nối cơ sở dữ liệu. Kiểm tra mạng!');

    const docRef = _db.collection('users').doc(username.trim());
    const snap   = await docRef.get();

    if (!snap.exists) throw new Error('Tài khoản không tồn tại!');

    const { passwordHash, data } = snap.data();
    const inputHash = await hashPassword(password);
    if (inputHash !== passwordHash) throw new Error('Sai mật khẩu!');

    currentUser = username.trim();
    return data || null; // return saved game state (null = fresh)
}

// Load data for auto-login (session already saved locally)
async function cloudAutoLogin(username) {
    if (!_db) return null;
    try {
        const snap = await _db.collection('users').doc(username).get();
        if (!snap.exists) { clearSession(); return null; }
        currentUser = username;
        return snap.data().data || null;
    } catch (e) {
        console.warn('⚠️ Auto-login thất bại (offline?), dùng local save.', e);
        currentUser = username; // still set user for future syncs
        return null; // main.js will fall back to loadGame()
    }
}

// ──────────────────────────────────────────
// SYNC — Fire-and-forget, called on tab hide/close
// ──────────────────────────────────────────
function cloudSync(data) {
    if (!currentUser || !_db) return;
    // Use set+merge so it works even if the document structure changed
    _db.collection('users').doc(currentUser).set(
        { data, lastSaved: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
    ).then(() => console.log('☁️ Cloud sync OK'))
     .catch(err => console.warn('⚠️ Cloud sync failed (offline?):', err));
}

// ──────────────────────────────────────────
// SESSION — localStorage remembers the username across visits
// ──────────────────────────────────────────
function checkAutoLogin() {
    const saved = localStorage.getItem('clickerSession');
    if (saved) { currentUser = saved; return true; }
    return false;
}
function saveSession(username) { localStorage.setItem('clickerSession', username); }
function clearSession()        { localStorage.removeItem('clickerSession'); currentUser = null; }

// Bootstrap
initFirebase();
