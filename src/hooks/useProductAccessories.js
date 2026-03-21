import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { deductAccessoryStock, addAccessoryStock } from "./useAccessories";

export function useProductAccessories() {
  const { user } = useAuth();
  const [deductions, setDeductions] = useState({});

  useEffect(() => {
    if (!user?.uid) return;

    const ref_ = ref(db, `users/${user.uid}/productAccessoryDeductions`);

    const unsubscribe = onValue(ref_, (snapshot) => {
      setDeductions(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { deductions };
}

export async function saveProductAccessoryDeductions(uid, productName, selections, totalQty, previousDeductions) {
  const baseRef = ref(db, `users/${uid}/productAccessoryDeductions/${encodeURIComponent(productName)}`);

  const prev = previousDeductions || {};
  const newDeductions = {};

  for (const accId of Object.keys(prev)) {
    const prevAmount = prev[accId] || 0;
    const sel = selections.find((s) => s.accId === accId);
    const newAmount = sel ? Math.round((sel.qtyPerUnit || 0) * totalQty) : 0;

    if (prevAmount > newAmount) {
      await addAccessoryStock(uid, accId, prevAmount - newAmount);
    }
  }

  for (const sel of selections) {
    if (!sel.accId || (sel.qtyPerUnit || 0) <= 0) continue;
    const toDeduct = Math.round(sel.qtyPerUnit * totalQty);
    if (toDeduct <= 0) continue;

    const prevAmount = prev[sel.accId] || 0;
    if (toDeduct > prevAmount) {
      await deductAccessoryStock(uid, sel.accId, toDeduct - prevAmount);
    }

    newDeductions[sel.accId] = toDeduct;
  }

  await set(baseRef, newDeductions);
}
