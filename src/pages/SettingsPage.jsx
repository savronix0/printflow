import { useState, useEffect } from "react";
import { useSettings, saveSettings } from "../hooks/useSettings";
import { useAuth } from "../context/AuthContext";
import { Settings, Zap, Cpu, AlertTriangle, Save } from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  const { settings, loading } = useSettings();
  const [form, setForm] = useState({
    machineKW: "",
    electricityPricePerKwh: "",
    wearCostPerHour: "",
    failureRatePercent: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && settings) {
      setForm({
        machineKW: String(settings.machineKW ?? "0.4"),
        electricityPricePerKwh: String(settings.electricityPricePerKwh ?? "5"),
        wearCostPerHour: String(settings.wearCostPerHour ?? "0.5"),
        failureRatePercent: String(settings.failureRatePercent ?? "5"),
      });
    }
  }, [loading, settings]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const kw = parseFloat(form.machineKW);
    const kwhPrice = parseFloat(form.electricityPricePerKwh);
    const wear = parseFloat(form.wearCostPerHour);
    const fail = parseFloat(form.failureRatePercent);

    if (isNaN(kw) || kw < 0) {
      setError("Makine kW değeri geçerli olmalıdır (örn: 0.4).");
      return;
    }
    if (isNaN(kwhPrice) || kwhPrice < 0) {
      setError("Elektrik fiyatı geçerli olmalıdır (₺/kWh).");
      return;
    }
    if (isNaN(wear) || wear < 0) {
      setError("Yıpranma maliyeti geçerli olmalıdır (₺/saat).");
      return;
    }
    if (isNaN(fail) || fail < 0 || fail > 100) {
      setError("Fire oranı 0-100 arasında olmalıdır.");
      return;
    }

    try {
      await saveSettings(user.uid, {
        machineKW: kw,
        electricityPricePerKwh: kwhPrice,
        wearCostPerHour: wear,
        failureRatePercent: fail,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Kaydetme başarısız.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7" />
          Ayarlar
        </h1>
        <p className="text-slate-400 mt-1">
          Elektrik, makine yıpranması ve fire oranı — bir kez girin, otomatik hesaplansın
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Cpu className="w-4 h-4" />
            Makine Gücü (kW)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.machineKW}
            onChange={(e) => setForm({ ...form, machineKW: e.target.value })}
            placeholder="Örn: 0.4 (400W)"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Elegoo CC2 veya makinenizin saatlik kW tüketimi (etiketinden veya ölçümden)
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Zap className="w-4 h-4" />
            Elektrik Fiyatı (₺/kWh)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.electricityPricePerKwh}
            onChange={(e) => setForm({ ...form, electricityPricePerKwh: e.target.value })}
            placeholder="Örn: 5"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Cpu className="w-4 h-4" />
            Makine Yıpranması (₺/saat)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.wearCostPerHour}
            onChange={(e) => setForm({ ...form, wearCostPerHour: e.target.value })}
            placeholder="Örn: 0.5"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Saatlik makine amortismanı / yıpranma payı
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Fire Oranı (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.failureRatePercent}
            onChange={(e) => setForm({ ...form, failureRatePercent: e.target.value })}
            placeholder="Örn: 5"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Baskı yapışmıyor, hata veriyor, baştan başlanıyor — bu oran maliyete eklenir
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-emerald-400 text-sm bg-emerald-500/10 rounded-lg px-4 py-2">
            Ayarlar kaydedildi.
          </p>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700"
        >
          <Save className="w-5 h-5" />
          Kaydet
        </button>
      </form>
    </div>
  );
}
