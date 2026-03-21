import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export function useProductStocks() {
  const { user } = useAuth();
  const [productStocks, setProductStocks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const stocksRef = ref(db, `users/${user.uid}/productStocks`);
    const unsubscribe = onValue(stocksRef, (snapshot) => {
      setProductStocks(snapshot.val() || {});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { productStocks, loading };
}
