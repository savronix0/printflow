/**
 * firebase.js — Firebase başlatma & servis exports
 * Storage kaldırıldı (free plan desteklemiyor)
 * signInWithRedirect kullanılıyor (popup yerine — daha güvenilir)
 */

import { initializeApp }              from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider,
         signInWithRedirect,
         getRedirectResult,
         signOut,
         onAuthStateChanged }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc,
         getDocs, addDoc, updateDoc,
         deleteDoc, onSnapshot,
         serverTimestamp, query,
         orderBy }                    from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ─────────────────────────────────────────────────────────────
   🔧 BURAYA KENDİ CONFIG'İNİ YAPIŞTIR
   Firebase Console → ⚙️ Project Settings → General → Your apps → Config
───────────────────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "BURAYA_API_KEY",
  authDomain:        "BURAYA_AUTH_DOMAIN",
  projectId:         "BURAYA_PROJECT_ID",
  storageBucket:     "BURAYA_STORAGE_BUCKET",
  messagingSenderId: "BURAYA_MESSAGING_SENDER_ID",
  appId:             "BURAYA_APP_ID",
};

/* ── Init ─────────────────────────────────────────────────── */
const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

/* ── Auth helpers ─────────────────────────────────────────── */

// Redirect ile giriş — popup'tan çok daha güvenilir
// GitHub Pages, mobil, popup blocker sorunlarını çözer
async function loginWithGoogle() {
  await signInWithRedirect(auth, provider);
}

// Sayfa yüklenince redirect sonucunu yakala
async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.error('Redirect sonucu:', err.code, err.message);
    return null;
  }
}

async function logout() {
  await signOut(auth);
}

/* ── Firestore path helpers ───────────────────────────────── */
function userCol(colName) {
  if (!auth.currentUser) throw new Error('Giriş yapılmamış');
  return collection(db, 'users', auth.currentUser.uid, colName);
}
function userDoc(colName, id) {
  if (!auth.currentUser) throw new Error('Giriş yapılmamış');
  return doc(db, 'users', auth.currentUser.uid, colName, id);
}

/* ── Firestore CRUD ───────────────────────────────────────── */
async function fsGetAll(colName) {
  const q    = query(userCol(colName), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function fsAdd(colName, data) {
  const ref = await addDoc(userCol(colName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

async function fsUpdate(colName, id, data) {
  await updateDoc(userDoc(colName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

async function fsDelete(colName, id) {
  await deleteDoc(userDoc(colName, id));
}

/* ── Real-time listener ───────────────────────────────────── */
function fsListen(colName, callback) {
  const q = query(userCol(colName), orderBy('createdAt', 'desc'));
  return onSnapshot(q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err  => console.error('fsListen hata:', colName, err)
  );
}

/* ── Exports ──────────────────────────────────────────────── */
export {
  auth, db,
  loginWithGoogle, handleRedirectResult, logout, onAuthStateChanged,
  fsGetAll, fsAdd, fsUpdate, fsDelete, fsListen,
  serverTimestamp,
};
