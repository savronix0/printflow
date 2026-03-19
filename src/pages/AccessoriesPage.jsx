import { useState } from "react";
import {
  useAccessories,
  addAccessory,
  updateAccessory,
  deleteAccessory,
} from "../hooks/useAccessories";
import { useAuth } from "../context/AuthContext";
import { Plus, Pencil, Trash2, Package, X } from "lucide-react";

export function AccessoriesPage() {
  const { user } = useAuth();
  const { accessories, loading } = useAccessories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    accName: "",
    totalPrice: "",
    quantityPurchased: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setForm({ accName: "", totalPrice: "", quantityPurchased: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      accName: a.accName || "",
      totalPrice: String(a.totalPrice ?? ""),
      quantityPurchased: String(a.quantityPurchased ?? a.stockCount ?? ""),
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const total = parseFloat(form.totalPrice);
    const qty = parseInt(form.quantityPurchased, 10);

    if (!form.accName.trim()) {
      setError("Aksesuar adı girin.");
      setSubmitting(false);
      return;
    }
    if (isNaN(total) || total < 0) {
      setError("Toplam fiyat geçerli olmalıdır.");
      setSubmitting(false);
      return;
    }
    if (isNaN(qty) || qty < 1) {
      setError("Adet 1 veya üzeri olmalıdır.");
      setSubmitting(false);
      return;
    }

    const pricePerUnit = Math.round((total / qty) * 100) / 100;

    try {
      if (editingId) {
        await updateAccessory(user.uid, editingId, {
          accName: form.accName.trim(),
          totalPrice: total,
          quantityPurchased: qty,
          pricePerUnit,
          stockCount: qty,
        });
      } else {
        await addAccessory(user.uid, {
          accName: form.accName.trim(),
          totalPrice: total,
          quantityPurchased: qty,
        });
      }
      closeModal();
    } catch (err) {
      setError(err.message || "İşlem başarısız.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu aksesuarı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteAccessory(user.uid, id);
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
          <h1 className="text-2xl font-bold text-white">Aksesuarlar</h1>
          <p className="text-slate-400 mt-1">
            Halka, zincir vb. — Kaç TL'ye kaç tane aldığınızı girin, birim fiyat otomatik hesaplanır
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Aksesuar Ekle
        </button>
      </div>

      {accessories.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Henüz aksesuar kaydı yok.</p>
          <button
            onClick={openAdd}
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            İlk aksesuarı ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessories.map((a) => (
            <div
              key={a.id}
              className="glass rounded-2xl p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-white">{a.accName || "-"}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(a)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Birim fiyat:</span>
                  <span className="text-cyan-400">{(a.pricePerUnit ?? 0).toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stok:</span>
                  <span className="text-white">{a.stockCount ?? a.quantityPurchased ?? 0} adet</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Aksesuar Düzenle" : "Aksesuar Ekle"}
              </h2>
              <button onClick={closeModal} className="p-1 rounded hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Aksesuar Adı
                </label>
                <input
                  type="text"
                  value={form.accName}
                  onChange={(e) => setForm({ ...form, accName: e.target.value })}
                  placeholder="Örn: Halka, Zincir"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Toplam Ödenen (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.totalPrice}
                    onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kaç Tane Aldım
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantityPurchased}
                    onChange={(e) => setForm({ ...form, quantityPurchased: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
              {form.totalPrice && form.quantityPurchased && (
                <p className="text-sm text-slate-400">
                  Birim fiyat:{" "}
                  <span className="text-cyan-400 font-medium">
                    {(
                      parseFloat(form.totalPrice) / (parseInt(form.quantityPurchased, 10) || 1)
                    ).toFixed(2)}{" "}
                    ₺
                  </span>
                </p>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
