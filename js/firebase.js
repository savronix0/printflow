/**
 * firebase.js — Firebase başlatma & servis exports
 *
 * !! KURULUM !!
 * 1. Firebase Console → Project Settings → General → Your apps → Config
 * 2. Aşağıdaki firebaseConfig nesnesini kendi değerlerinle doldur
 * 3. authDomain'e kendi domain'ini de ekle (GitHub Pages için)
 */

import { initializeApp }                        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider,
         signInWithPopup, signOut,
         onAuthStateChanged }                   from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc,
         getDocs, getDoc, addDoc, setDoc,
         updateDoc, deleteDoc,
         onSnapshot, serverTimestamp,
         query, orderBy, where }                from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes,
         getDownloadURL, deleteObject }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

/* ─────────────────────────────────────────────────────────────
   🔧 BURAYA KENDİ CONFIG'İNİ YAPIŞTIIR
   Firebase Console → Project Settings → General → Your apps
───────────────────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "BURAYA_API_KEY",
  authDomain:        "BURAYA_AUTH_DOMAIN",
  projectId:         "BURAYA_PROJECT_ID",
  storageBucket:     "BURAYA_STORAGE_BUCKET",
  messagingSenderId: "BURAYA_MESSAGING_SENDER_ID",
  appId:             "BURAYA_APP_ID",
};

/* ── Init ───────────────────────────────────────────────────── */
const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const db        = getFirestore(app);
const storage   = getStorage(app);
const provider  = new GoogleAuthProvider();

/* ── Auth helpers ───────────────────────────────────────────── */
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('Google giriş hatası:', err);
    throw err;
  }
}

async function logout() {
  await signOut(auth);
}

/* ── Firestore path helper ──────────────────────────────────── */
// Tüm kullanıcı verisi: /users/{uid}/prints, /filaments, /printers
function userCol(colName) {
  return collection(db, 'users', auth.currentUser.uid, colName);
}
function userDoc(colName, id) {
  return doc(db, 'users', auth.currentUser.uid, colName, id);
}

/* ── Firestore CRUD ─────────────────────────────────────────── */
async function fsGetAll(colName) {
  const q   = query(userCol(colName), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function fsAdd(colName, data) {
  const docRef = await addDoc(userCol(colName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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

/* ── Real-time listener ─────────────────────────────────────── */
function fsListen(colName, callback) {
  const q = query(userCol(colName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

/* ── Storage (fotoğraf yükleme) ─────────────────────────────── */
async function uploadPhoto(file, path) {
  const storageRef = ref(storage, `users/${auth.currentUser.uid}/${path}`);
  const snapshot   = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

async function deletePhoto(url) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (e) {
    console.warn('Foto silinemedi:', e);
  }
}

/* ── Exports ────────────────────────────────────────────────── */
export {
  auth, db, storage,
  loginWithGoogle, logout, onAuthStateChanged,
  fsGetAll, fsAdd, fsUpdate, fsDelete, fsListen,
  uploadPhoto, deletePhoto,
  serverTimestamp,
};
