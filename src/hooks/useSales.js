import { useState, useEffect } from "react";
import { ref, onValue, push, update, remove } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { adjustProductStock } from "../lib/productStock";

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const ref_ = ref(db, `users/${user.uid}/sales`);

    const unsubscribe = onValue(ref_, (snapshot) => {
      const data = snapshot.val();
      const items = data
        ? Object.entries(data)
            .map(([id, d]) => ({ id, ...d }))
            .sort((a, b) => {
              const ta = new Date(a.saleDate || a.createdAt || 0).getTime();
              const tb = new Date(b.saleDate || b.createdAt || 0).getTime();
              return tb - ta;
            })
        : [];
      setSales(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { sales, loading };
}

export async function addSale(uid, data) {
  await adjustProductStock(uid, data.productName || "Ürün", -(data.quantity || 1), {
    strict: true,
  });

  const ref_ = ref(db, `users/${uid}/sales`);
  const newRef = push(ref_, {
    productName: data.productName || "",
    quantity: data.quantity || 1,
    unitPrice: data.unitPrice || 0,
    totalRevenue: (data.quantity || 1) * (data.unitPrice || 0),
    saleDate: data.saleDate || new Date().toISOString(),
  });
  return newRef.key;
}

export async function updateSale(uid, saleId, data, previousSale = null) {
  const prevName = previousSale?.productName || data.productName || "Ürün";
  const prevQty = previousSale?.quantity || 1;
  const nextName = data.productName || "Ürün";
  const nextQty = data.quantity || 1;

  if (prevName === nextName) {
    const diff = nextQty - prevQty;
    if (diff > 0) {
      await adjustProductStock(uid, nextName, -diff, { strict: true });
    } else if (diff < 0) {
      await adjustProductStock(uid, nextName, -diff);
    }
  } else {
    await adjustProductStock(uid, prevName, prevQty);
    await adjustProductStock(uid, nextName, -nextQty, { strict: true });
  }

  const ref_ = ref(db, `users/${uid}/sales/${saleId}`);
  const quantity = data.quantity || 1;
  const unitPrice = data.unitPrice || 0;
  await update(ref_, {
    productName: data.productName || "",
    quantity,
    unitPrice,
    totalRevenue: quantity * unitPrice,
    saleDate: data.saleDate || new Date().toISOString(),
  });
}

export async function deleteSale(uid, saleId, saleData = null) {
  if (saleData) {
    await adjustProductStock(uid, saleData.productName || "Ürün", saleData.quantity || 1);
  }
  const ref_ = ref(db, `users/${uid}/sales/${saleId}`);
  await remove(ref_);
}
