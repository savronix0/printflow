/**
 * store.js — Veri katmanı
 * Şu an localStorage kullanıyor.
 * Firebase entegrasyonunda bu dosya değiştirilerek
 * Firestore'a geçiş yapılacak.
 */

const Store = (() => {
  const KEY = 'printflow_v2';

  let _data = {
    printers:  [],
    filaments: [],
    prints:    [],
    settings: {
      electricityPrice: 5.8,
      currency: '₺',
    },
  };

  /* ── Load / Save ────────────────────────────────────────── */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) _data = JSON.parse(raw);
    } catch (e) {
      console.warn('Store load error:', e);
    }
    _ensureDefaults();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(_data));
    } catch (e) {
      console.error('Store save error:', e);
    }
  }

  function _ensureDefaults() {
    if (!Array.isArray(_data.printers))  _data.printers  = [];
    if (!Array.isArray(_data.filaments)) _data.filaments = [];
    if (!Array.isArray(_data.prints))    _data.prints    = [];
    if (!_data.settings) _data.settings = { electricityPrice: 5.8, currency: '₺' };
  }

  /* ── Seed demo data ─────────────────────────────────────── */
  function seedDemo() {
    if (_data.printers.length > 0) return;

    const pid = Utils.uid();
    _data.printers.push({
      id: pid, name: 'Ender 3 Pro', brand: 'Creality',
      watt: 200, bed: '220×220×250', price: 4500,
      notes: 'BLTouch takılı, Sprite Extruder mod',
      totalPrints: 0, totalFilament: 0,
    });

    const fids = [Utils.uid(), Utils.uid(), Utils.uid()];
    _data.filaments.push(
      { id: fids[0], brand: 'eSun', type: 'PLA+', colorName: 'Beyaz',   color: '#f0f0ec', total: 1000, remaining: 740,  price: 420, temp: 210, notes: '' },
      { id: fids[1], brand: 'Bambu Lab', type: 'PETG', colorName: 'Koyu Gri', color: '#2a2d35', total: 1000, remaining: 290,  price: 680, temp: 235, notes: 'Yüksek dayanımlı parçalar için.' },
      { id: fids[2], brand: 'Polymaker', type: 'PLA',  colorName: 'Turuncu', color: '#ff6b35', total: 1000, remaining: 910,  price: 380, temp: 205, notes: '' },
    );

    const now = Date.now();
    const prints = [
      { n:'Benchy (Stres Testi)',   f:fids[0], g:28,  dur:65,  lay:0.2, inf:15, st:'done',   ago:3,  note:'Mükemmel çıktı, iz yok.' },
      { n:'Kasa Kapağı',           f:fids[0], g:142, dur:310, lay:0.2, inf:30, st:'done',   ago:7,  note:'Elektronik proje için.' },
      { n:'Mini Vazo',             f:fids[2], g:55,  dur:90,  lay:0.15,inf:0,  st:'done',   ago:14, note:'Spiral vase mode.' },
      { n:'Bisiklet Tutucu',       f:fids[1], g:210, dur:480, lay:0.25,inf:50, st:'failed', ago:20, note:'PETG warping sorunu.' },
      { n:'Filament Rehber Klibi', f:fids[0], g:15,  dur:25,  lay:0.2, inf:20, st:'done',   ago:25, note:'' },
      { n:'Drone Çerçeve Parçası', f:fids[1], g:88,  dur:200, lay:0.2, inf:40, st:'done',   ago:32, note:'Güçlendirilmiş köşeler.' },
    ];
    prints.forEach(p => {
      _data.prints.push({
        id: Utils.uid(), name: p.n, printer: pid, filament: p.f,
        grams: p.g, duration: p.dur, layer: p.lay, infill: p.inf,
        notes: p.note, status: p.st,
        date: now - p.ago * 86400000,
        cost: calcPrintCost(p.g, p.dur, p.f),
      });
    });

    syncPrinterStats();
    save();
  }

  /* ── Getters ────────────────────────────────────────────── */
  function getPrinters()  { return _data.printers; }
  function getFilaments() { return _data.filaments; }
  function getPrints()    { return _data.prints; }
  function getSettings()  { return _data.settings; }

  function getPrinterById(id)  { return _data.printers.find(p => p.id === id); }
  function getFilamentById(id) { return _data.filaments.find(f => f.id === id); }
  function getPrintById(id)    { return _data.prints.find(p => p.id === id); }

  /* ── Add / Update / Delete ──────────────────────────────── */
  function addPrinter(pr) {
    pr.id = Utils.uid();
    pr.totalPrints = 0;
    pr.totalFilament = 0;
    _data.printers.push(pr);
    save();
    return pr;
  }

  function deletePrinter(id) {
    _data.printers = _data.printers.filter(p => p.id !== id);
    save();
  }

  function addFilament(f) {
    f.id = Utils.uid();
    _data.filaments.unshift(f);
    save();
    return f;
  }

  function updateFilament(id, patch) {
    const idx = _data.filaments.findIndex(f => f.id === id);
    if (idx >= 0) { _data.filaments[idx] = { ..._data.filaments[idx], ...patch }; save(); }
  }

  function deleteFilament(id) {
    _data.filaments = _data.filaments.filter(f => f.id !== id);
    save();
  }

  function addPrint(pr) {
    pr.id = Utils.uid();
    pr.date = Date.now();
    _data.prints.unshift(pr);
    save();
    return pr;
  }

  function updatePrint(id, patch) {
    const idx = _data.prints.findIndex(p => p.id === id);
    if (idx >= 0) { _data.prints[idx] = { ..._data.prints[idx], ...patch }; save(); }
  }

  function deletePrint(id) {
    _data.prints = _data.prints.filter(p => p.id !== id);
    save();
  }

  /* ── Business Logic ─────────────────────────────────────── */
  function calcPrintCost(grams, durationMin, filamentId) {
    const fil = getFilamentById(filamentId);
    const settings = _data.settings;
    const filCost  = fil ? (grams / 1000) * fil.price : 0;
    const elecCost = (durationMin / 60) * (200 / 1000) * (settings.electricityPrice || 5.8);
    return Math.round((filCost + elecCost) * 100) / 100;
  }

  function syncPrinterStats() {
    _data.printers.forEach(pr => {
      const done = _data.prints.filter(p => p.printer === pr.id && p.status === 'done');
      pr.totalPrints   = done.length;
      pr.totalFilament = done.reduce((a, p) => a + (p.grams || 0), 0);
    });
    save();
  }

  function deductFilament(filamentId, grams) {
    const fil = getFilamentById(filamentId);
    if (fil) {
      fil.remaining = Math.max(0, fil.remaining - grams);
      save();
    }
  }

  /* ── Public API ─────────────────────────────────────────── */
  return {
    load, save, seedDemo,
    getPrinters, getFilaments, getPrints, getSettings,
    getPrinterById, getFilamentById, getPrintById,
    addPrinter, deletePrinter,
    addFilament, updateFilament, deleteFilament,
    addPrint, updatePrint, deletePrint,
    calcPrintCost, syncPrinterStats, deductFilament,
  };
})();
