import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAllProductions } from "../hooks/useProductions";
import { useAccessories } from "../hooks/useAccessories";
import { useSettings } from "../hooks/useSettings";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Calculator,
  Zap,
  Settings2,
  Plus,
  Minus,
} from "lucide-react";

function ProductCard({ productName, productions, accessories, settings }) {
  const [expanded, setExpanded] = useState(false);

  const totalQty = productions.reduce((s, p) => s + (p.quantity || 1), 0);
  const totalFilamentCost = productions.reduce(
    (s, p) => s + (p.filamentCost ?? p.totalCost ?? 0),
    0
  );
  const totalElectricity = productions.reduce((s, p) => s + (p.electricityCost ?? 0), 0);
  const totalWear = productions.reduce((s, p) => s + (p.wearCost ?? 0), 0);
  const totalFailure = productions.reduce((s, p) => s + (p.failureCost ?? 0), 0);

  const baseUnitCost = totalQty > 0 ? totalFilamentCost / totalQty : 0;
  const electricityPerUnit = totalQty > 0 ? totalElectricity / totalQty : 0;
  const wearPerUnit = totalQty > 0 ? totalWear / totalQty : 0;
  const failurePerUnit = totalQty > 0 ? totalFailure / totalQty : 0;

  const autoCostPerUnit = baseUnitCost + electricityPerUnit + wearPerUnit + failurePerUnit;

  const [accessorySelections, setAccessorySelections] = useState(() => {
    try {
      const saved = localStorage.getItem(`printflow-product-acc-${productName}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`printflow-product-acc-${productName}`, JSON.stringify(accessorySelections));
  }, [productName, accessorySelections]);

  const accessoryCostPerUnit = accessorySelections.reduce(
    (s, sel) => {
      const acc = accessories.find((a) => a.id === sel.accId);
      return s + (acc ? acc.pricePerUnit * (sel.qtyPerUnit || 0) : 0);
    },
    0
  );

  const finalCostPerUnit = autoCostPerUnit + accessoryCostPerUnit;

  const addAccessory = (accId) => {
    const existing = accessorySelections.find((s) => s.accId === accId);
    if (existing) {
      setAccessorySelections(
        accessorySelections.map((s) =>
          s.accId === accId ? { ...s, qtyPerUnit: (s.qtyPerUnit || 0) + 1 } : s
        )
      );
    } else {
      setAccessorySelections([...accessorySelections, { accId, qtyPerUnit: 1 }]);
    }
  };

  const removeAccessory = (accId) => {
    const existing = accessorySelections.find((s) => s.accId === accId);
    if (!existing) return;
    if (existing.qtyPerUnit <= 1) {
      setAccessorySelections(accessorySelections.filter((s) => s.accId !== accId));
    } else {
      setAccessorySelections(
        accessorySelections.map((s) =>
          s.accId === accId ? { ...s, qtyPerUnit: s.qtyPerUnit - 1 } : s
        )
      );
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
            <Package className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">{productName || "İsimsiz Ürün"}</h3>
            <p className="text-sm text-slate-500">
              {totalQty} adet üretim
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500">Final Birim Maliyet</p>
            <p className="text-lg font-semibold text-emerald-400">
              {finalCostPerUnit.toFixed(2)} ₺
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-cyan-400 mb-4">
            <Calculator className="w-5 h-5" />
            <span className="font-medium">Maliyet Analizi (Otomatik)</span>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Filament (parça başına)</span>
              <span className="text-white">{baseUnitCost.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-4 h-4" /> Elektrik
              </span>
              <span className="text-white">{electricityPerUnit.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Settings2 className="w-4 h-4" /> Makine yıpranması
              </span>
              <span className="text-white">{wearPerUnit.toFixed(2)} ₺</span>
            </div>
            {failurePerUnit > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Fire payı</span>
                <span className="text-amber-400">{failurePerUnit.toFixed(2)} ₺</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-sm text-slate-400 mb-2 flex items-center gap-1">
              <Package className="w-4 h-4" /> Aksesuar ekle
            </p>
            {accessories.length === 0 ? (
              <p className="text-slate-500 text-sm">
                <Link to="/accessories" className="text-cyan-400 hover:underline">
                  Aksesuar ekleyin
                </Link>{" "}
                ürün maliyetine dahil etmek için.
              </p>
            ) : (
              <div className="space-y-2">
                {accessories.map((acc) => {
                  const sel = accessorySelections.find((s) => s.accId === acc.id);
                  const qty = sel?.qtyPerUnit ?? 0;
                  const lineCost = (acc.pricePerUnit ?? 0) * qty;
                  return (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
                    >
                      <span className="text-white">{acc.accName}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeAccessory(acc.id)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addAccessory(acc.id)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-cyan-400 w-16 text-right">
                          {lineCost.toFixed(2)} ₺
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-4">
            <span className="text-slate-300 font-medium">Final Birim Maliyet</span>
            <span className="text-xl font-bold text-emerald-400">
              {finalCostPerUnit.toFixed(2)} ₺
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Products() {
  const { productions, loading } = useAllProductions();
  const { accessories } = useAccessories();
  const { settings } = useSettings();

  const byProduct = productions.reduce((acc, p) => {
    const name = p.productName || "İsimsiz";
    if (!acc[name]) acc[name] = [];
    acc[name].push(p);
    return acc;
  }, {});

  const productList = Object.entries(byProduct).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Ürünler</h1>
        <p className="text-slate-400 mt-1">
          Elektrik, yıpranma ve fire otomatik — Aksesuar ekleyerek final maliyet
        </p>
      </div>

      {productList.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-slate-500">
          Henüz ürün kaydı yok. Önce üretim ekleyin.
        </div>
      ) : (
        <div className="space-y-4">
          {productList.map(([name, prods]) => (
            <ProductCard
              key={name}
              productName={name}
              productions={prods}
              accessories={accessories}
              settings={settings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
