import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAllProductions,
  updateProduction,
  deleteProduction,
} from "../hooks/useProductions";
import { useFilaments } from "../hooks/useFilaments";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Pencil,
  Trash2,
  Plus,
  Printer,
  X,
  Calculator,
} from "lucide-react";

const defaultFilamentRow = () => ({ filamentId: "", gramsUsed: "" });

export function Productions() {
  const { user } = useAuth();
  const { productions, loading } = useAllProductions();
  const { filaments } = useFilaments();
  const { settings } = useSettings();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openEdit = (p) => {
    const usages = p.filamentUsages?.length
      ? p.filamentUsages.map((u) => ({
          filamentId: u.filamentId,
          gramsUsed: String(u.gramsUsed),
        }))
      : [{ filamentId: "", gramsUsed: String(p.totalPrintWeight || 0) }];
    setEditingId(p.id);
    setEditForm({
      productName: p.productName || "",
      modelWeight: String(p.modelWeight ?? ""),
      totalPrintWeight: String(p.totalPrintWeight ?? ""),
      quantity: p.quantity ?? 1,
      printTimeHours: String(p.printTimeHours ?? ""),
      filamentRows: usages,
    });
    setError("");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const updateEditRow = (idx, field, value) => {
    setEditForm((f) => ({
      ...f,
      filamentRows: f.filamentRows.map((r, i) =>
        i === idx ? { ...r, [field]: value } : r
      ),
    }));
  };

  const addEditRow = () => {
    setEditForm((f) => ({
      ...f,
      filamentRows: [...f.filamentRows, defaultFilamentRow()],
    }));
  };

  const removeEditRow = (idx) => {
    setEditForm((f) => ({
      ...f,
      filamentRows: f.filamentRows.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!editForm || !editingId) return;
    setError("");
    setSubmitting(true);

    const modelG = parseFloat(editForm.modelWeight);
    const totalG = parseFloat(editForm.totalPrintWeight);
    const qty = parseInt(editForm.quantity, 10) || 1;

    const usages = editForm.filamentRows
      .filter((r) => r.filamentId && parseFloat(r.gramsUsed) > 0)
      .map((r) => ({
        filamentId: r.filamentId,
        gramsUsed: parseFloat(r.gramsUsed),
      }));

    const sumGrams = usages.reduce((s, u) => s + u.gramsUsed, 0);
    if (Math.abs(sumGrams - totalG) > 0.01) {
      setError("Filament gram toplamı toplam baskı ağırlığına eşit olmalı.");
      setSubmitting(false);
      return;
    }

    let filamentCost = 0;
    for (const u of usages) {
      const f = filaments.find((x) => x.id === u.filamentId);
      if (f) filamentCost += u.gramsUsed * (f.pricePerKg / 1000);
    }
    filamentCost = Math.round(filamentCost * 100) / 100;

    const hrs = parseFloat(editForm.printTimeHours) || 0;
    const kw = settings?.machineKW ?? 0;
    const kwhP = settings?.electricityPricePerKwh ?? 0;
    const wearPH = settings?.wearCostPerHour ?? 0;
    const failR = (settings?.failureRatePercent ?? 0) / 100;

    const electricityCost = Math.round(hrs * kw * kwhP * 100) / 100;
    const wearCost = Math.round(hrs * wearPH * 100) / 100;
    const baseCost = filamentCost + electricityCost + wearCost;
    const failureCost = Math.round(baseCost * failR * 100) / 100;
    const totalCost = baseCost + failureCost;

    const waste = Math.max(0, totalG - modelG * qty);

    try {
      const prev = productions.find((x) => x.id === editingId);
      await updateProduction(user.uid, editingId, {
        productName: editForm.productName || "Ürün",
        modelWeight: modelG,
        totalPrintWeight: totalG,
        quantity: qty,
        wasteWeight: waste,
        totalCost,
        filamentCost,
        electricityCost,
        wearCost,
        failureCost,
        printTimeHours: hrs,
        filamentUsages: usages,
      }, prev);
      closeEdit();
    } catch (err) {
      setError(err.message || "Güncelleme başarısız.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`"${p.productName}" üretimini silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteProduction(user.uid, p.id, p.filamentUsages || []);
    } catch (err) {
      alert(err.message || "Silme başarısız.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Üretimler</h1>
          <p className="text-slate-400 mt-1">Tüm üretim kayıtları, düzenleme ve silme</p>
        </div>
        <Link
          to="/productions/add"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Yeni Üretim
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {productions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Henüz üretim kaydı yok.{" "}
            <Link to="/productions/add" className="text-cyan-400 hover:underline">
              İlk üretimi ekleyin
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 font-medium">Ürün</th>
                  <th className="px-6 py-4 font-medium">Adet</th>
                  <th className="px-6 py-4 font-medium">Ağırlık</th>
                  <th className="px-6 py-4 font-medium">Maliyet</th>
                  <th className="px-6 py-4 font-medium">Birim Maliyet</th>
                  <th className="px-6 py-4 font-medium">Tarih</th>
                  <th className="px-6 py-4 font-medium w-24">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {productions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    {editingId === p.id && editForm ? (
                      <td colSpan={7} className="p-6 bg-white/5">
                        <div className="space-y-4 max-w-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-400 font-medium flex items-center gap-2">
                              <Calculator className="w-5 h-5" />
                              Düzenle
                            </span>
                            <button
                              onClick={closeEdit}
                              className="p-1 rounded hover:bg-white/10 text-slate-400"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Ürün Adı</label>
                              <input
                                value={editForm.productName}
                                onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Adet</label>
                              <input
                                type="number"
                                min="1"
                                value={editForm.quantity}
                                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Model (g)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.modelWeight}
                                onChange={(e) => setEditForm({ ...editForm, modelWeight: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Toplam Baskı (g)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.totalPrintWeight}
                                onChange={(e) => setEditForm({ ...editForm, totalPrintWeight: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Baskı süresi (saat)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.printTimeHours}
                                onChange={(e) => setEditForm({ ...editForm, printTimeHours: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Filamentler</label>
                            <div className="space-y-2">
                              {editForm.filamentRows.map((row, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <select
                                    value={row.filamentId}
                                    onChange={(e) => updateEditRow(idx, "filamentId", e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800/90 border border-white/10 text-white text-sm"
                                  >
                                    <option value="">Seçin</option>
                                    {filaments.map((f) => (
                                      <option key={f.id} value={f.id}>{f.colorName} ({f.brand})</option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="g"
                                    value={row.gramsUsed}
                                    onChange={(e) => updateEditRow(idx, "gramsUsed", e.target.value)}
                                    className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeEditRow(idx)}
                                    disabled={editForm.filamentRows.length <= 1}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={addEditRow}
                                className="text-xs text-cyan-400 hover:text-cyan-300"
                              >
                                + Satır ekle
                              </button>
                            </div>
                          </div>
                          {error && <p className="text-red-400 text-sm">{error}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              disabled={submitting}
                              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                            >
                              {submitting ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                            <button
                              onClick={closeEdit}
                              className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-white">{p.productName || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{p.quantity || 1}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {((p.totalPrintWeight || 0) / 1000).toFixed(2)} kg
                        </td>
                        <td className="px-6 py-4 text-cyan-400">
                          {(p.totalCost ?? 0).toFixed(2)} ₺
                        </td>
                        <td className="px-6 py-4 text-emerald-400">
                          {p.quantity > 0
                            ? ((p.totalCost ?? 0) / p.quantity).toFixed(2)
                            : "-"}{" "}
                          ₺
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">
                          {p.createdAt
                            ? format(
                                p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
                                "d MMM yyyy, HH:mm",
                                { locale: tr }
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
