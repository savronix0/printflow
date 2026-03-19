import { Link } from "react-router-dom";
import { useProductions, useProductionsStats } from "../hooks/useProductions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Package, Trash2, Boxes, DollarSign, Printer } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const statCards = [
  {
    key: "totalFilamentKg",
    label: "Toplam Harcanan Filament (Kg)",
    icon: Package,
    color: "from-cyan-500 to-blue-600",
    suffix: " kg",
  },
  {
    key: "totalWasteKg",
    label: "Toplam Atık (Kg)",
    icon: Trash2,
    color: "from-amber-500 to-orange-600",
    suffix: " kg",
  },
  {
    key: "totalQuantity",
    label: "Toplam Üretim Adedi",
    icon: Boxes,
    color: "from-emerald-500 to-teal-600",
    suffix: "",
  },
  {
    key: "totalCost",
    label: "Toplam Maliyet",
    icon: DollarSign,
    color: "from-violet-500 to-purple-600",
    suffix: " ₺",
  },
];

export function Dashboard() {
  const { productions, loading } = useProductions(8);
  const { stats, loading: statsLoading } = useProductionsStats();

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Üretim özeti ve istatistikler</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/productions"
            className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-slate-300 text-sm"
          >
            Üretimler
          </Link>
          <Link
            to="/products"
            className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-slate-300 text-sm"
          >
            Ürün Maliyeti
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, suffix }) => (
          <div
            key={key}
            className="glass rounded-2xl p-6 hover:border-white/10 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats[key] ?? 0}
                  {suffix}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Aylık Filament Kullanımı
        </h2>
        <div className="h-64">
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,15,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                  formatter={(value) => [`${value} kg`, ""]}
                />
                <Legend />
                <Bar dataKey="harcanan" fill="#06b6d4" name="Harcanan (kg)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atik" fill="#f59e0b" name="Atık (kg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Henüz veri yok. Üretim ekleyerek grafik oluşturun.
            </div>
          )}
        </div>
      </div>

      {/* Recent Productions */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Son Yapılan Üretimler
          </h2>
          <Link
            to="/productions"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Tümünü gör →
          </Link>
        </div>
        {productions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-white/5">
                  <th className="pb-4 font-medium">Ürün</th>
                  <th className="pb-4 font-medium">Adet</th>
                  <th className="pb-4 font-medium">Ağırlık</th>
                  <th className="pb-4 font-medium">Maliyet</th>
                  <th className="pb-4 font-medium">Birim</th>
                  <th className="pb-4 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {productions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-slate-500" />
                        <span className="text-white">{p.productName || "-"}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{p.quantity || 1}</td>
                    <td className="py-4 text-slate-300">
                      {(p.totalPrintWeight / 1000).toFixed(2)} kg
                    </td>
                    <td className="py-4 text-cyan-400">
                      {p.totalCost?.toFixed(2)} ₺
                    </td>
                    <td className="py-4 text-emerald-400">
                      {p.quantity > 0 ? ((p.totalCost ?? 0) / p.quantity).toFixed(2) : "-"} ₺
                    </td>
                    <td className="py-4 text-slate-500 text-sm">
                      {p.createdAt
                        ? format(
                            p.createdAt instanceof Date
                              ? p.createdAt
                              : new Date(p.createdAt),
                            "d MMM yyyy, HH:mm",
                            { locale: tr }
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Henüz üretim kaydı yok.{" "}
            <Link to="/productions/add" className="text-cyan-400 hover:underline">
              İlk üretimi ekleyin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
