import { useState } from "react";
import {
  useFilaments,
  addFilament,
  updateFilament,
  deleteFilament,
} from "../hooks/useFilaments";
import { useAuth } from "../context/AuthContext";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

export function FilamentInventory() {
  const { user } = useAuth();
  const { filaments, loading } = useFilaments();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    colorName: "",
    hexCode: "#808080",
    brand: "",
    pricePerKg: "",
    remainingGram: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setForm({
      colorName: "",
      hexCode: "#808080",
      brand: "",
      pricePerKg: "",
      remainingGram: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditingId(f.id);
    setForm({
      colorName: f.colorName || "",
      hexCode: f.hexCode || "#808080",
      brand: f.brand || "",
      pricePerKg: f.pricePerKg ?? "",
      remainingGram: f.remainingGram ?? "",
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

    const price = parseFloat(form.pricePerKg);
    const remaining = parseFloat(form.remainingGram);

    if (isNaN(price) || price < 0) {
      setError("Kg fiyatı geçerli bir sayı olmalıdır.");
      setSubmitting(false);
      return;
    }

    if (isNaN(remaining) || remaining < 0) {
      setError("Kalan gram geçerli bir sayı olmalıdır.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await updateFilament(user.uid, editingId, {
          colorName: form.colorName,
          hexCode: form.hexCode,
          brand: form.brand,
          pricePerKg: price,
          remainingGram: remaining,
        });
      } else {
        await addFilament(user.uid, {
          colorName: form.colorName,
          hexCode: form.hexCode,
          brand: form.brand,
          pricePerKg: price,
          remainingGram: remaining,
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
    if (!confirm("Bu filament kaydını silmek istediğinize emin misiniz?"))
      return;
    try {
      await deleteFilament(user.uid, id);
    } catch (err) {
      alert(err.message || "Silme başarısız.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Filament Envanteri</h1>
          <p className="text-slate-400 mt-1">
            Stok ekle, düzenle ve renk tanımla
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          Yeni Filament
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : filaments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Henüz filament kaydı yok.</p>
          <button
            onClick={openAdd}
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            İlk filamentini ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filaments.map((f) => (
            <div
              key={f.id}
              className="glass rounded-2xl p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white/10 shrink-0"
                    style={{ backgroundColor: f.hexCode || "#808080" }}
                  />
                  <div>
                    <h3 className="font-medium text-white">{f.colorName || "İsimsiz"}</h3>
                    <p className="text-slate-500 text-sm">{f.brand || "-"}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(f)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kalan:</span>
                  <span className="text-white">{(f.remainingGram / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kg Fiyatı:</span>
                  <span className="text-cyan-400">{f.pricePerKg?.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="glass-strong rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? "Filament Düzenle" : "Yeni Filament Ekle"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Renk Adı
                </label>
                <input
                  type="text"
                  value={form.colorName}
                  onChange={(e) => setForm({ ...form, colorName: e.target.value })}
                  placeholder="Örn: Kırmızı, Mavi"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Renk Seçici
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={form.hexCode}
                    onChange={(e) => setForm({ ...form, hexCode: e.target.value })}
                    className="w-14 h-14 rounded-xl border-2 border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.hexCode}
                    onChange={(e) => setForm({ ...form, hexCode: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Marka
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Örn: Prusament, eSun"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kg Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.pricePerKg}
                    onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kalan (g)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={form.remainingGram}
                    onChange={(e) => setForm({ ...form, remainingGram: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all"
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