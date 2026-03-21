import { ref, get, set } from "firebase/database";
import { db } from "./firebase";

function stockKey(productName) {
  return encodeURIComponent((productName || "Ürün").trim());
}

export async function getProductStock(uid, productName) {
  const key = stockKey(productName);
  const stockRef = ref(db, `users/${uid}/productStocks/${key}`);
  const snap = await get(stockRef);
  if (!snap.exists()) {
    return ensureProductStockInitialized(uid, productName);
  }
  return snap.val().quantity || 0;
}

async function calculateLegacyStock(uid, productName) {
  const name = (productName || "Ürün").trim();
  const [prodSnap, salesSnap] = await Promise.all([
    get(ref(db, `users/${uid}/productions`)),
    get(ref(db, `users/${uid}/sales`)),
  ]);

  const productions = prodSnap.exists() ? Object.values(prodSnap.val()) : [];
  const sales = salesSnap.exists() ? Object.values(salesSnap.val()) : [];

  const produced = productions
    .filter((p) => (p.productName || "Ürün").trim() === name)
    .reduce((sum, p) => sum + (p.quantity || 1), 0);

  const sold = sales
    .filter((s) => (s.productName || "Ürün").trim() === name)
    .reduce((sum, s) => sum + (s.quantity || 1), 0);

  return Math.max(0, produced - sold);
}

export async function ensureProductStockInitialized(uid, productName) {
  const name = (productName || "Ürün").trim();
  const key = stockKey(name);
  const stockRef = ref(db, `users/${uid}/productStocks/${key}`);
  const snap = await get(stockRef);
  if (snap.exists()) {
    return snap.val().quantity || 0;
  }

  const legacyQty = await calculateLegacyStock(uid, name);
  await set(stockRef, {
    productName: name,
    quantity: legacyQty,
    updatedAt: new Date().toISOString(),
  });
  return legacyQty;
}

export async function adjustProductStock(uid, productName, delta, options = {}) {
  const { strict = false } = options;
  const name = (productName || "Ürün").trim();
  const key = stockKey(name);
  const stockRef = ref(db, `users/${uid}/productStocks/${key}`);
  const initializedCurrent = await ensureProductStockInitialized(uid, name);
  const snap = await get(stockRef);

  const current = snap.exists()
    ? snap.val().quantity || 0
    : initializedCurrent || 0;
  const next = current + (delta || 0);

  if (strict && next < 0) {
    throw new Error(`"${name}" icin yeterli stok yok. Mevcut: ${current}`);
  }

  await set(stockRef, {
    productName: name,
    quantity: Math.max(0, next),
    updatedAt: new Date().toISOString(),
  });
}
