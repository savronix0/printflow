import { useState, useEffect } from "react";
import {
  ref,
  onValue,
  push,
  update,
  remove,
} from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export function useFilaments() {
  const { user } = useAuth();
  const [filaments, setFilaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const filamentsRef = ref(db, `users/${user.uid}/filaments`);

    const unsubscribe = onValue(filamentsRef, (snapshot) => {
      const data = snapshot.val();
      let items = [];
      if (data) {
        items = Object.entries(data)
          .map(([id, d]) => ({ id, ...d }))
          .sort((a, b) => (a.colorName || "").localeCompare(b.colorName || ""));
      }
      setFilaments(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { filaments, loading };
}

export async function addFilament(uid, data) {
  const filamentsRef = ref(db, `users/${uid}/filaments`);
  const newRef = push(filamentsRef, {
    colorName: data.colorName || "",
    hexCode: data.hexCode || "#808080",
    brand: data.brand || "",
    pricePerKg: data.pricePerKg || 0,
    remainingGram: data.remainingGram || 0,
  });
  return newRef.key;
}

export async function updateFilament(uid, filamentId, data) {
  const filamentRef = ref(db, `users/${uid}/filaments/${filamentId}`);
  await update(filamentRef, data);
}

export async function deleteFilament(uid, filamentId) {
  const filamentRef = ref(db, `users/${uid}/filaments/${filamentId}`);
  await remove(filamentRef);
}
