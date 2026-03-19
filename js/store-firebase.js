/**
 * store-firebase.js — Firebase Firestore veri katmanı
 *
 * store.js ile aynı public API'yi sunar.
 * app.js'de sadece script src değişir, geri kalan kod aynı kalır.
 */

import {
  auth, onAuthStateChanged,
  fsGetAll, fsAdd, fsUpdate, fsDelete, fsListen,
  serverTimestamp,
} from './firebase.js';

const Store = (() => {
  /* ── Local cache (UI anlık okur, Firestore async günceller) ── */
  let _printers  = [];
  let _filaments = [];
  let _prints    = [];
  let _settings  = { electricityPrice: 5.8, currency: '₺' };
  let _uid       = null;

  /* ── Unsubscribe handles ────────────────────────────────────── */
  let _unsubs = [];

  /* ── Auth state ─────────────────────────────────────────────── */
  function onUser(callback) {
    onAuthStateChanged(auth, callback);
  }

  /* ── Load (ilk yükleme, one-shot) ──────────────────────────── */
  async function load() {
    _uid = auth.currentUser?.uid;
    if (!_uid) return;

    const [printers, filaments, prints] = await Promise.all([
      fsGetAll('printers'),
      fsGetAll('filaments'),
      fsGetAll('prints'),
    ]);

    _printers  = printers;
    _filaments = filaments;
    _prints    = prints.map(_hydratePrint);
  }

  /* ── Real-time listeners (her koleksiyon değişince UI günceller) */
  function startListeners(onUpdate) {
    // Eski listener'ları temizle
    _unsubs.forEach(u => u());
    _unsubs = [];

    _unsubs.push(fsListen('printers',  docs => { _printers  = docs;                    onUpdate('printers'); }));
    _unsubs.push(fsListen('filaments', docs => { _filaments = docs;                    onUpdate('filaments'); }));
    _unsubs.push(fsListen('prints',    docs => { _prints    = docs.map(_hydratePrint); onUpdate('prints'); }));
  }

  function stopListeners() {
    _unsubs.forEach(u => u());
    _unsubs = [];
  }

  /* ── Firestore timestamp → JS Date dönüşümü ─────────────────── */
  function _hydratePrint(p) {
    return {
      ...p,
      date: p.createdAt?.seconds ? p.createdAt.seconds * 1000 : (p.date || Date.now()),
    };
  }

  /* ── save() — no-op (Firestore otomatik persist eder) ──────── */
  function save() { /* Firestore ile gerek yok */ }

  /* ── Seed demo — sadece ilk girişte ────────────────────────── */
  async function seedDemo() {
    if (_printers.length > 0) return;

    const pid = await fsAdd('printers', {
      name: 'Ender 3 Pro', brand: 'Creality',
      watt: 200, bed: '220×220×250', price: 4500,
      notes: 'BLTouch takılı, Sprite Extruder',
      totalPrints: 0, totalFilament: 0,
    });

    const f1 = await fsAdd('filaments', { brand:'eSun',       type:'PLA+', colorName:'Beyaz',    color:'#f0f0ec', total:1000, remaining:740,  price:420, temp:210, notes:'' });
    const f2 = await fsAdd('filaments', { brand:'Bambu Lab',  type:'PETG', colorName:'Koyu Gri', color:'#2a2d35', total:1000, remaining:290,  price:680, temp:235, notes:'Güçlü parçalar için' });
    const f3 = await fsAdd('filaments', { brand:'Polymaker',  type:'PLA',  colorName:'Turuncu',  color:'#ff6b35', total:1000, remaining:910,  price:380, temp:205, notes:'' });

    const demos = [
      { name:'Benchy',          printer:pid, filament:f1, grams:28,  duration:65,  layer:0.2, infill:15, status:'done',   notes:'Mükemmel çıktı.' },
      { name:'Kasa Kapağı',     printer:pid, filament:f1, grams:142, duration:310, layer:0.2, infill:30, status:'done',   notes:'Elektronik proje.' },
      { name:'Mini Vazo',       printer:pid, filament:f3, grams:55,  duration:90,  layer:0.15,infill:0,  status:'done',   notes:'Spiral vase mode.' },
      { name:'Bisiklet Tutucu', printer:pid, filament:f2, grams:210, duration:480, layer:0.25,infill:50, status:'failed', notes:'PETG warping.' },
    ];
    for (const d of demos) {
      await fsAdd('prints', { ...d, cost: calcPrintCost(d.grams, d.duration, d.filament) });
    }
    await load();
  }

  /* ── Getters ─────────────────────────────────────────────────── */
  function getPrinters()       { return _printers; }
  function getFilaments()      { return _filaments; }
  function getPrints()         { return _prints; }
  function getSettings()       { return _settings; }
  function getPrinterById(id)  { return _printers.find(p => p.id === id); }
  function getFilamentById(id) { return _filaments.find(f => f.id === id); }
  function getPrintById(id)    { return _prints.find(p => p.id === id); }

  /* ── Printers ────────────────────────────────────────────────── */
  async function addPrinter(pr) {
    const id = await fsAdd('printers', { ...pr, totalPrints:0, totalFilament:0 });
    return { id, ...pr };
  }
  async function deletePrinter(id) { await fsDelete('printers', id); }

  /* ── Filaments ───────────────────────────────────────────────── */
  async function addFilament(f) {
    const id = await fsAdd('filaments', f);
    return { id, ...f };
  }
  async function updateFilament(id, patch) { await fsUpdate('filaments', id, patch); }
  async function deleteFilament(id)        { await fsDelete('filaments', id); }

  /* ── Prints ──────────────────────────────────────────────────── */
  async function addPrint(pr) {
    const id = await fsAdd('prints', { ...pr, date: Date.now() });
    return { id, ...pr };
  }
  async function updatePrint(id, patch) { await fsUpdate('prints', id, patch); }
  async function deletePrint(id)        { await fsDelete('prints', id); }

  /* ── Business Logic ──────────────────────────────────────────── */
  function calcPrintCost(grams, durationMin, filamentId) {
    const fil      = getFilamentById(filamentId);
    const filCost  = fil ? (grams / 1000) * fil.price : 0;
    const elecCost = (durationMin / 60) * (200 / 1000) * (_settings.electricityPrice || 5.8);
    return Math.round((filCost + elecCost) * 100) / 100;
  }

  async function syncPrinterStats() {
    for (const pr of _printers) {
      const done = _prints.filter(p => p.printer === pr.id && p.status === 'done');
      const totalPrints   = done.length;
      const totalFilament = done.reduce((a, p) => a + (p.grams || 0), 0);
      await fsUpdate('printers', pr.id, { totalPrints, totalFilament });
    }
  }

  async function deductFilament(filamentId, grams) {
    const fil = getFilamentById(filamentId);
    if (fil) {
      const remaining = Math.max(0, (fil.remaining || 0) - grams);
      await fsUpdate('filaments', filamentId, { remaining });
    }
  }

  /* ── Public API (store.js ile aynı) ─────────────────────────── */
  return {
    load, save, seedDemo,
    onUser, startListeners, stopListeners,
    getPrinters, getFilaments, getPrints, getSettings,
    getPrinterById, getFilamentById, getPrintById,
    addPrinter,  deletePrinter,
    addFilament, updateFilament, deleteFilament,
    addPrint,    updatePrint,    deletePrint,
    calcPrintCost, syncPrinterStats, deductFilament,
  };
})();

export default Store;
window.Store = Store; // global erişim için
