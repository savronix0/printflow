import { useState } from "react";
import { useSales, addSale, updateSale, deleteSale } from "../hooks/useSales";
import { useAllProductions } from "../hooks/useProductions";
import { useAccessories } from "../hooks/useAccessories";
import { useProductAccessories } from "../hooks/useProductAccessories";
import { useProductStocks } from "../hooks/useProductStocks";
import { useAuth } from "../context/AuthContext";
import { Plus, TrendingUp, DollarSign, Package, Pencil, Trash2 } from "lucide-react";

const normalizeProductName = (name) => (name || "İsimsiz").trim();

function getUnitCost(productName, productions, accessories, deductions) {
  const prods = productions.filter(
    (p) => normalizeProductName(p.productName) === normalizeProductName(productName)
  );
  if (prods.length === 0) return 0;

  const totalQty = prods.reduce((s, p) => s + (p.quantity || 1), 0);
  const totalCost = prods.reduce((s, p) => s + (p.totalCost ?? 0), 0);
  const baseUnitCost = totalQty > 0 ? totalCost / totalQty : 0;

  const productDeductions = deductions[productName] || {};
  let accessoryCost = 0;
  for (const [accId, qtyDeducted] of Object.entries(productDeductions)) {
    const acc = accessories.find((a) => a.id === accId);
    if (acc && totalQty > 0) {
      accessoryCost += (acc.pricePerUnit ?? 0) * (qtyDeducted / totalQty);
    }
  }

  return baseUnitCost + accessoryCost;
}

export function SalesPage() {
  const { user } = useAuth();
  const { sales, loading } = useSales();
  const { productions } = useAllProductions();
  const { accessories } = useAccessories();
  const { deductions } = useProductAccessories();
  const { productStocks } = useProductStocks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [form, setForm] = useState({
    productName: "",
    quantity: 1,
    unitPrice: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const productNames = [...new Set(productions.map((p) => normalizeProductName(p.productName)))].sort();

  const selectedName = normalizeProductName(form.productName);
  const selectedStock = productStocks?.[encodeURIComponent(selectedName)]?.quantity ?? 0;
  const requestedQty = parseInt(form.quantity, 10) || 1;
  const editingSale = sales.find((x) => x.id === editingSaleId);
  const editCompensation =
    editingSale && normalizeProductName(editingSale.productName) === selectedName
      ? editingSale.quantity || 1
      : 0;
  const availableForForm = selectedStock + editCompensation;
  const qtyExceedsStock = !!form.productName && requestedQty > availableForForm;

  const totalRevenue = sales.reduce((s, sale) => s + (sale.totalRevenue ?? sale.quantity * sale.unitPrice ?? 0), 0);

  let totalCost = 0;
  for (const sale of sales) {
    const name = sale.productName || "İsimsiz";
    const unitCost = getUnitCost(name, productions, accessories, deductions);
    totalCost += unitCost * (sale.quantity || 1);
  }

  const profit = totalRevenue - totalCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        productName: normalizeProductName(form.productName),
        quantity: parseInt(form.quantity, 10) || 1,
        unitPrice: parseFloat(form.unitPrice) || 0,
        saleDate: new Date().toISOString(),
      };
      if (editingSaleId) {
        const previous = sales.find((x) => x.id === editingSaleId);
        await updateSale(user.uid, editingSaleId, payload, previous);
      } else {
        await addSale(user.uid, payload);
      }
      setForm({ productName: "", quantity: 1, unitPrice: "" });
      setEditingSaleId(null);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sale) => {
    setEditingSaleId(sale.id);
    setForm({
      productName: sale.productName || "",
      quantity: sale.quantity || 1,
      unitPrice: sale.unitPrice ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (sale) => {
    if (!confirm(`"${sale.productName || "Ürün"}" satış kaydını silmek istediğinize emin misiniz?`)) {
      return;
    }
    await deleteSale(user.uid, sale.id, sale);
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
          <h1 className="text-2xl font-bold text-white">Satışlar</h1>
          <p className="text-slate-400 mt-1">Satılan ürünler ve kar analizi</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Satış Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Toplam Ciro</p>
              <p className="text-xl font-bold text-white">{totalRevenue.toFixed(2)} ₺</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Toplam Maliyet</p>
              <p className="text-xl font-bold text-white">{totalCost.toFixed(2)} ₺</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profit >= 0 ? "bg-cyan-500/20" : "bg-red-500/20"}`}>
              <TrendingUp className={`w-6 h-6 ${profit >= 0 ? "text-cyan-400" : "text-red-400"}`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Kar</p>
              <p className={`text-xl font-bold ${profit >= 0 ? "text-cyan-400" : "text-red-400"}`}>
                {profit.toFixed(2)} ₺
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <h2 className="px-6 py-4 text-lg font-semibold text-white border-b border-white/5">
          Satış Geçmişi
        </h2>
        {sales.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Henüz satış kaydı yok. Satış ekleyerek başlayın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 font-medium">Ürün</th>
                  <th className="px-6 py-4 font-medium">Adet</th>
                  <th className="px-6 py-4 font-medium">Birim Fiyat</th>
                  <th className="px-6 py-4 font-medium">Toplam</th>
                  <th className="px-6 py-4 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const revenue = s.totalRevenue ?? s.quantity * s.unitPrice ?? 0;
                  const unitCost = getUnitCost(s.productName || "İsimsiz", productions, accessories, deductions);
                  const cost = unitCost * (s.quantity || 1);
                  const saleProfit = revenue - cost;
                  return (
                    <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{s.productName || "-"}</td>
                      <td className="px-6 py-4 text-slate-300">{s.quantity || 1}</td>
                      <td className="px-6 py-4 text-slate-300">{(s.unitPrice ?? 0).toFixed(2)} ₺</td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400">{revenue.toFixed(2)} ₺</span>
                        <span className="text-slate-500 text-xs ml-2">
                          (Kar: {saleProfit.toFixed(2)} ₺)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Düzenle"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {editingSaleId ? "Satış Düzenle" : "Satış Ekle"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ürün</label>
                <select
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-white/10 text-white"
                >
                  <option value="">Seçin</option>
                  {productNames.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              {form.productName && (
                <p className="text-xs text-slate-400">
                  Mevcut stok:{" "}
                  <span className={qtyExceedsStock ? "text-red-400" : "text-emerald-400"}>
                    {availableForForm} adet
                  </span>
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Adet</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Birim Fiyat (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingSaleId(null);
                    setForm({ productName: "", quantity: 1, unitPrice: "" });
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting || qtyExceedsStock}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? "Kaydediliyor..." : editingSaleId ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
