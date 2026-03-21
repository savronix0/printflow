import { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowLeft, Printer } from "lucide-react";

export function CalculatorPage() {
  const [machineKW, setMachineKW] = useState("0.4");
  const [electricityPrice, setElectricityPrice] = useState("5");
  const [wearPerHour, setWearPerHour] = useState("0.5");
  const [failureRate, setFailureRate] = useState("5");
  const [printTimeHours, setPrintTimeHours] = useState("");
  const [filamentPricePerKg, setFilamentPricePerKg] = useState("");
  const [filamentUsedGram, setFilamentUsedGram] = useState("");
  const [quantity, setQuantity] = useState("1");

  const kw = parseFloat(machineKW) || 0;
  const kwhPrice = parseFloat(electricityPrice) || 0;
  const wear = parseFloat(wearPerHour) || 0;
  const failR = (parseFloat(failureRate) || 0) / 100;
  const hours = parseFloat(printTimeHours) || 0;
  const priceKg = parseFloat(filamentPricePerKg) || 0;
  const grams = parseFloat(filamentUsedGram) || 0;
  const qty = parseInt(quantity, 10) || 1;

  const filamentCost = (grams / 1000) * priceKg;
  const electricityCost = hours * kw * kwhPrice;
  const wearCost = hours * wear;
  const baseCost = filamentCost + electricityCost + wearCost;
  const failureCost = baseCost * failR;
  const totalCost = baseCost + failureCost;
  const costPerUnit = qty > 0 ? totalCost / qty : 0;

  return (
    <div className="min-h-screen bg-[#0f0f12] p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Giriş sayfasına dön
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Maliyet Hesaplayıcı</h1>
            <p className="text-slate-400 text-sm">Üye olmadan hızlı hesaplama</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-3">Makine & Elektrik</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Makine gücü (kW)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={machineKW}
                  onChange={(e) => setMachineKW(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Elektrik fiyatı (₺/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electricityPrice}
                  onChange={(e) => setElectricityPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Yıpranma (₺/saat)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={wearPerHour}
                  onChange={(e) => setWearPerHour(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fire oranı (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={failureRate}
                  onChange={(e) => setFailureRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-3">Baskı Bilgileri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Baskı süresi (saat)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={printTimeHours}
                  onChange={(e) => setPrintTimeHours(e.target.value)}
                  placeholder="2.5"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Filament fiyatı (₺/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filamentPricePerKg}
                  onChange={(e) => setFilamentPricePerKg(e.target.value)}
                  placeholder="200"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Kullanılan filament (g)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filamentUsedGram}
                  onChange={(e) => setFilamentUsedGram(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Üretim adedi</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Calculator className="w-5 h-5" />
              <span className="font-medium">Sonuç</span>
            </div>
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
            <div className="flex justify-between text-sm pt-2 border-t border-white/5">
              <span className="text-slate-300 font-medium">Toplam maliyet:</span>
              <span className="text-cyan-400 font-bold">{totalCost.toFixed(2)} ₺</span>
            </div>
            {qty > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Adet başına:</span>
                <span className="text-emerald-400 font-bold">{costPerUnit.toFixed(2)} ₺</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
