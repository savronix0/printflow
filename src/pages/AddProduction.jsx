import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilaments } from "../hooks/useFilaments";
import { useSettings } from "../hooks/useSettings";
import { addProduction } from "../hooks/useProductions";
import { ArrowLeft, Calculator, Plus, Trash2, Clock } from "lucide-react";

const defaultFilamentRow = () => ({ filamentId: "", gramsUsed: "" });

export function AddProduction() {
  const { user } = useAuth();
  const { filaments, loading: filamentsLoading } = useFilaments();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [printTimeHours, setPrintTimeHours] = useState("");
  const [modelWeight, setModelWeight] = useState("");
  const [totalPrintWeight, setTotalPrintWeight] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [modelIsTotal, setModelIsTotal] = useState(false);
  const [filamentRows, setFilamentRows] = useState([defaultFilamentRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const modelG = parseFloat(modelWeight) || 0;
  const totalG = parseFloat(totalPrintWeight) || 0;
  const qty = parseInt(quantity, 10) || 1;
  const totalModelG = modelIsTotal ? modelG : modelG * qty;
  const wasteWeight = Math.max(0, totalG - totalModelG);

  // Toplam maliyet: her satır için (grams * pricePerKg/1000)
  let filamentSum = 0;
  let totalEnteredGrams = 0;
  let hasEnoughFilament = true;
  for (const row of filamentRows) {
    const g = parseFloat(row.gramsUsed) || 0;
    totalEnteredGrams += g;
    const f = filaments.find((x) => x.id === row.filamentId);
    if (f) {
      filamentSum += g * (f.pricePerKg / 1000);
      if (g > (f.remainingGram || 0)) hasEnoughFilament = false;
    }
  }
  const filamentCost = Math.round(filamentSum * 100) / 100;
  const hours = parseFloat(printTimeHours) || 0;
  const kw = settings?.machineKW ?? 0;
  const kwhPrice = settings?.electricityPricePerKwh ?? 0;
  const wearPerHour = settings?.wearCostPerHour ?? 0;
  const failureRate = (settings?.failureRatePercent ?? 0) / 100;

  const electricityCost = Math.round(hours * kw * kwhPrice * 100) / 100;
  const wearCost = Math.round(hours * wearPerHour * 100) / 100;
  const baseCost = filamentCost + electricityCost + wearCost;
  const failureCost = Math.round(baseCost * failureRate * 100) / 100;
  const totalCost = baseCost + failureCost;

  const costPerUnit = qty > 0 ? Math.round((totalCost / qty) * 100) / 100 : 0;
  const gramsMatch = Math.abs(totalEnteredGrams - totalG) < 0.01;

  useEffect(() => {
    if (filaments.length > 0 && filamentRows.length === 1 && !filamentRows[0].filamentId) {
      setFilamentRows([{ filamentId: filaments[0].id, gramsUsed: "" }]);
    }
  }, [filaments]);

  const addRow = () => {
    setFilamentRows([...filamentRows, defaultFilamentRow()]);
  };

  const removeRow = (idx) => {
    if (filamentRows.length <= 1) return;
    setFilamentRows(filamentRows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx, field, value) => {
    setFilamentRows(
      filamentRows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const modelG = parseFloat(modelWeight);
    const totalG = parseFloat(totalPrintWeight);
    const qty = parseInt(quantity, 10) || 1;

    if (isNaN(modelG) || modelG <= 0) {
      setError("Model ağırlığı geçerli bir sayı olmalıdır.");
      setSubmitting(false);
      return;
    }

    if (isNaN(totalG) || totalG <= 0) {
      setError("Toplam baskı ağırlığı geçerli bir sayı olmalıdır.");
      setSubmitting(false);
      return;
    }

    const usages = filamentRows
      .filter((r) => r.filamentId && parseFloat(r.gramsUsed) > 0)
      .map((r) => ({
        filamentId: r.filamentId,
        gramsUsed: parseFloat(r.gramsUsed),
      }));

    if (usages.length === 0) {
      setError("En az bir filament seçin ve gram girin.");
      setSubmitting(false);
      return;
    }

    const sumGrams = usages.reduce((s, u) => s + u.gramsUsed, 0);
    if (Math.abs(sumGrams - totalG) > 0.01) {
      setError(`Filament gram toplamı (${sumGrams.toFixed(1)}g) toplam baskı ağırlığına (${totalG.toFixed(1)}g) eşit olmalıdır.`);
      setSubmitting(false);
      return;
    }

    const totalModel = modelIsTotal ? modelG : modelG * qty;
    const waste = Math.max(0, totalG - totalModel);

    const hrs = parseFloat(printTimeHours) || 0;
    const kw_ = settings?.machineKW ?? 0;
    const kwhP = settings?.electricityPricePerKwh ?? 0;
    const wearPH = settings?.wearCostPerHour ?? 0;
    const failR = (settings?.failureRatePercent ?? 0) / 100;

    const elecCost = Math.round(hrs * kw_ * kwhP * 100) / 100;
    const wCost = Math.round(hrs * wearPH * 100) / 100;
    const baseC = filamentCost + elecCost + wCost;
    const failC = Math.round(baseC * failR * 100) / 100;
    const finalTotalCost = baseC + failC;

    try {
      await addProduction(user.uid, {
        productName: productName || "Ürün",
        modelWeight: modelG,
        totalPrintWeight: totalG,
        quantity: qty,
        wasteWeight: waste,
        totalCost: finalTotalCost,
        filamentCost,
        electricityCost: elecCost,
        wearCost: wCost,
        failureCost: failC,
        printTimeHours: hrs,
        filamentUsages: usages,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !submitting &&
    !filamentsLoading &&
    filaments.length > 0 &&
    totalPrintWeight &&
    modelWeight &&
    gramsMatch &&
    hasEnoughFilament &&
    filamentRows.some((r) => r.filamentId && parseFloat(r.gramsUsed) > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Geri</span>
      </button>

      <h1 className="text-2xl font-bold text-white">Üretim Ekle</h1>
      <p className="text-slate-400 mt-1 mb-8">
        Slicer verilerinizi girin, atık ve maliyet otomatik hesaplanır.
      </p>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Ürün Adı
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Örn: Vazo, Kapak..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Model Ağırlığı (g) {modelIsTotal ? "— toplam" : "— parça başına"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={modelWeight}
              onChange={(e) => setModelWeight(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Toplam Baskı Ağırlığı (g) - Slicer
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalPrintWeight}
              onChange={(e) => setTotalPrintWeight(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Clock className="w-4 h-4" />
            Baskı Süresi (saat)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={printTimeHours}
            onChange={(e) => setPrintTimeHours(e.target.value)}
            placeholder="Örn: 2.5 (slicer'dan)"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Elektrik ve makine yıpranması otomatik hesaplanır. Ayarlardan kW ve fiyat girin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Adet
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modelIsTotal}
                onChange={(e) => setModelIsTotal(e.target.checked)}
                className="rounded bg-white/5 border-white/10 text-cyan-500 focus:ring-cyan-500/50"
              />
              <span className="text-sm text-slate-400">
                Model ağırlığı toplam (parça başına değil)
              </span>
            </label>
          </div>
        </div>

        {/* Birden fazla filament */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-300">
              Filamentler
            </label>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300"
            >
              <Plus className="w-4 h-4" />
              Filament Ekle
            </button>
          </div>
          <div className="space-y-3">
            {filamentRows.map((row, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-end flex-wrap sm:flex-nowrap"
              >
                <div className="flex-1 min-w-0">
                  <select
                    value={row.filamentId}
                    onChange={(e) =>
                      updateRow(idx, "filamentId", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [&>option]:bg-slate-800 [&>option]:text-white"
                  >
                    <option value="">Filament seçin</option>
                    {filaments.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.colorName} ({f.brand}) - {(f.remainingGram / 1000).toFixed(2)} kg kalan
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28 shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="g"
                    value={row.gramsUsed}
                    onChange={(e) =>
                      updateRow(idx, "gramsUsed", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={filamentRows.length <= 1}
                  className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  title="Kaldır"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          {totalG > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Toplam: {totalEnteredGrams.toFixed(1)}g / {totalG.toFixed(1)}g
              {!gramsMatch && (
                <span className="text-amber-400 ml-2">
                  — Gram toplamı eşleşmeli
                </span>
              )}
            </p>
          )}
        </div>

        {/* Live calculation preview */}
        <div className="glass-strong rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Calculator className="w-5 h-5" />
            <span className="font-medium">Anlık Hesaplama</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Atık (g):</span>
            <span className="text-white">
              {wasteWeight.toFixed(2)}
              <span className="text-slate-500 ml-1 text-xs">
                (Baskı − Model×Adet)
              </span>
            </span>
          </div>
          {hours > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Filament:</span>
                <span className="text-white">{filamentCost.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Elektrik:</span>
                <span className="text-white">{electricityCost.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Yıpranma:</span>
                <span className="text-white">{wearCost.toFixed(2)} ₺</span>
              </div>
              {failureCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fire payı:</span>
                  <span className="text-amber-400">{failureCost.toFixed(2)} ₺</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Toplam Maliyet:</span>
            <span className="text-cyan-400 font-medium">{totalCost.toFixed(2)} ₺</span>
          </div>
          {qty > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Adet Başına Maliyet:</span>
              <span className="text-emerald-400 font-medium">{costPerUnit.toFixed(2)} ₺</span>
            </div>
          )}
          {totalG > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Yeterli filament:</span>
              <span
                className={
                  hasEnoughFilament ? "text-emerald-400" : "text-red-400"
                }
              >
                {hasEnoughFilament ? "Evet" : "Hayır"}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
