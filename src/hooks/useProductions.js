import { useState, useEffect } from "react";
import {
  ref,
  onValue,
  push,
  get,
  update,
  remove,
} from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { adjustProductStock } from "../lib/productStock";

export function useProductions(limitCount = 10) {
  const { user } = useAuth();
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const productionsRef = ref(db, `users/${user.uid}/productions`);

    const unsubscribe = onValue(productionsRef, (snapshot) => {
      const data = snapshot.val();
      let items = [];
      if (data) {
        items = Object.entries(data).map(([id, d]) => ({
          id,
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt) : null,
        }));
        items.sort((a, b) => {
          const ta = a.createdAt?.getTime?.() || 0;
          const tb = b.createdAt?.getTime?.() || 0;
          return tb - ta;
        });
        items = items.slice(0, limitCount);
      }
      setProductions(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, limitCount]);

  return { productions, loading };
}

export function useProductionsStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFilamentKg: 0,
    totalWasteKg: 0,
    totalQuantity: 0,
    totalCost: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const productionsRef = ref(db, `users/${user.uid}/productions`);

    const unsubscribe = onValue(productionsRef, (snapshot) => {
      const data = snapshot.val();
      let totalFilament = 0;
      let totalWaste = 0;
      let totalQty = 0;
      let totalCost = 0;
      const byMonth = {};

      if (data) {
        Object.values(data).forEach((d) => {
          const filament = (d.totalPrintWeight || 0) / 1000;
          const waste = (d.wasteWeight || 0) / 1000;

          totalFilament += filament;
          totalWaste += waste;
          totalQty += d.quantity || 1;
          totalCost += d.totalCost || 0;

          const date = d.createdAt ? new Date(d.createdAt) : new Date();
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!byMonth[key]) byMonth[key] = { name: key, filament: 0, waste: 0 };
          byMonth[key].filament += filament;
          byMonth[key].waste += waste;
        });
      }

      const chartData = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([k, v]) => ({
          name: k,
          harcanan: Math.round(v.filament * 1000) / 1000,
          atik: Math.round(v.waste * 1000) / 1000,
        }));

      setStats({
        totalFilamentKg: Math.round(totalFilament * 1000) / 1000,
        totalWasteKg: Math.round(totalWaste * 1000) / 1000,
        totalQuantity: totalQty,
        totalCost: Math.round(totalCost * 100) / 100,
        chartData,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { stats, loading };
}

export async function addProduction(uid, data) {
  const productionsRef = ref(db, `users/${uid}/productions`);
  const { filamentUsages, ...rest } = data;
  const newRef = push(productionsRef, {
    ...rest,
    filamentUsages: filamentUsages || [],
    createdAt: new Date().toISOString(),
  });

  // Her filament için stok düşümü
  const usages = filamentUsages || (data.filamentId ? [{ filamentId: data.filamentId, gramsUsed: data.totalPrintWeight || 0 }] : []);
  for (const { filamentId, gramsUsed } of usages) {
    if (!filamentId || !gramsUsed) continue;
    const filamentRef = ref(db, `users/${uid}/filaments/${filamentId}`);
    const snapshot = await get(filamentRef);
    if (snapshot.exists()) {
      const current = snapshot.val().remainingGram || 0;
      await update(filamentRef, {
        remainingGram: Math.max(0, current - gramsUsed),
      });
    }
  }

  await adjustProductStock(uid, data.productName || "Ürün", data.quantity || 1);

  return newRef.key;
}

export function useAllProductions() {
  const { user } = useAuth();
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const productionsRef = ref(db, `users/${user.uid}/productions`);

    const unsubscribe = onValue(productionsRef, (snapshot) => {
      const data = snapshot.val();
      let items = [];
      if (data) {
        items = Object.entries(data).map(([id, d]) => ({
          id,
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt) : null,
        }));
        items.sort((a, b) => {
          const ta = a.createdAt?.getTime?.() || 0;
          const tb = b.createdAt?.getTime?.() || 0;
          return tb - ta;
        });
      }
      setProductions(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { productions, loading };
}

export async function updateProduction(uid, productionId, data, previousData = null) {
  const prodRef = ref(db, `users/${uid}/productions/${productionId}`);
  const { filamentUsages, ...rest } = data;

  if (previousData?.filamentUsages?.length) {
    for (const { filamentId, gramsUsed } of previousData.filamentUsages) {
      if (!filamentId || !gramsUsed) continue;
      const filamentRef = ref(db, `users/${uid}/filaments/${filamentId}`);
      const snapshot = await get(filamentRef);
      if (snapshot.exists()) {
        const current = snapshot.val().remainingGram || 0;
        await update(filamentRef, { remainingGram: current + gramsUsed });
      }
    }
  }

  const usages = filamentUsages || [];
  for (const { filamentId, gramsUsed } of usages) {
    if (!filamentId || !gramsUsed) continue;
    const filamentRef = ref(db, `users/${uid}/filaments/${filamentId}`);
    const snapshot = await get(filamentRef);
    if (snapshot.exists()) {
      const current = snapshot.val().remainingGram || 0;
      await update(filamentRef, {
        remainingGram: Math.max(0, current - gramsUsed),
      });
    }
  }

  await update(prodRef, { ...rest, filamentUsages: usages });

  const prevName = previousData?.productName || "Ürün";
  const prevQty = previousData?.quantity || 1;
  const nextName = rest.productName || "Ürün";
  const nextQty = rest.quantity || 1;

  if (prevName === nextName) {
    const diff = nextQty - prevQty;
    if (diff !== 0) {
      await adjustProductStock(uid, nextName, diff);
    }
  } else {
    await adjustProductStock(uid, prevName, -prevQty);
    await adjustProductStock(uid, nextName, nextQty);
  }
}

export async function deleteProduction(
  uid,
  productionId,
  filamentUsages = [],
  productName = "Ürün",
  quantity = 1
) {
  const prodRef = ref(db, `users/${uid}/productions/${productionId}`);

  for (const { filamentId, gramsUsed } of filamentUsages) {
    if (!filamentId || !gramsUsed) continue;
    const filamentRef = ref(db, `users/${uid}/filaments/${filamentId}`);
    const snapshot = await get(filamentRef);
    if (snapshot.exists()) {
      const current = snapshot.val().remainingGram || 0;
      await update(filamentRef, { remainingGram: current + gramsUsed });
    }
  }

  await adjustProductStock(uid, productName, -(quantity || 1));
  await remove(prodRef);
}
