import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const defaults = {
  machineKW: 0.4,
  electricityPricePerKwh: 5,
  wearCostPerHour: 0.5,
  failureRatePercent: 5,
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const settingsRef = ref(db, `users/${user.uid}/settings`);

    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings({ ...defaults, ...data });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { settings, loading };
}

export async function saveSettings(uid, data) {
  const settingsRef = ref(db, `users/${uid}/settings`);
  await set(settingsRef, {
    machineKW: parseFloat(data.machineKW) || 0,
    electricityPricePerKwh: parseFloat(data.electricityPricePerKwh) || 0,
    wearCostPerHour: parseFloat(data.wearCostPerHour) || 0,
    failureRatePercent: parseFloat(data.failureRatePercent) || 0,
  });
}
