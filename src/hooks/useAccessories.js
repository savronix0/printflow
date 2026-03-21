import { useState, useEffect } from "react";
import {
  ref,
  onValue,
  push,
  update,
  remove,
  get,
} from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export function useAccessories() {
  const { user } = useAuth();
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const ref_ = ref(db, `users/${user.uid}/accessories`);

    const unsubscribe = onValue(ref_, (snapshot) => {
      const data = snapshot.val();
      const items = data
        ? Object.entries(data).map(([id, d]) => ({ id, ...d }))
        : [];
      setAccessories(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { accessories, loading };
}

export async function addAccessory(uid, data) {
  const ref_ = ref(db, `users/${uid}/accessories`);
  const totalPrice = parseFloat(data.totalPrice) || 0;
  const quantityPurchased = parseInt(data.quantityPurchased, 10) || 1;
  const pricePerUnit = quantityPurchased > 0 ? totalPrice / quantityPurchased : 0;
  const newRef = push(ref_, {
    accName: data.accName || "",
    totalPrice,
    quantityPurchased,
    pricePerUnit: Math.round(pricePerUnit * 100) / 100,
    stockCount: quantityPurchased,
  });
  return newRef.key;
}

export async function updateAccessory(uid, accId, data) {
  const ref_ = ref(db, `users/${uid}/accessories/${accId}`);
  await update(ref_, data);
}

export async function deleteAccessory(uid, accId) {
  const ref_ = ref(db, `users/${uid}/accessories/${accId}`);
  await remove(ref_);
}

export async function deductAccessoryStock(uid, accId, amount) {
  const ref_ = ref(db, `users/${uid}/accessories/${accId}`);
  const snapshot = await get(ref_);
  if (!snapshot.exists()) return;
  const current = snapshot.val().stockCount ?? 0;
  await update(ref_, { stockCount: Math.max(0, current - amount) });
}

export async function addAccessoryStock(uid, accId, amount) {
  const ref_ = ref(db, `users/${uid}/accessories/${accId}`);
  const snapshot = await get(ref_);
  if (!snapshot.exists()) return;
  const current = snapshot.val().stockCount ?? 0;
  await update(ref_, { stockCount: current + amount });
}
