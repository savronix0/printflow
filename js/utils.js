/**
 * utils.js — Yardımcı fonksiyonlar
 */

const Utils = (() => {

  /* ── ID Generator ───────────────────────────────────────── */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ── Time Formatting ────────────────────────────────────── */
  function fmtDuration(minutes) {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}dk`;
    if (m === 0) return `${h}s`;
    return `${h}s ${m}dk`;
  }

  function fmtTimer(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  function fmtDateShort(ts) {
    return new Date(ts).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'short',
    });
  }

  /* ── Currency ───────────────────────────────────────────── */
  function fmtCost(val) {
    const n = parseFloat(val) || 0;
    return '₺' + n.toFixed(n % 1 === 0 ? 0 : 2);
  }

  /* ── Status Badge ───────────────────────────────────────── */
  function statusBadge(status) {
    const map = {
      done:     ['badge-done',     '✓ Tamamlandı'],
      printing: ['badge-printing', '⬡ Devam Ediyor'],
      failed:   ['badge-failed',   '✕ Başarısız'],
      paused:   ['badge-paused',   '⏸ Duraklatıldı'],
    };
    const [cls, label] = map[status] || ['', status];
    return `<span class="badge ${cls}">${label}</span>`;
  }

  /* ── Filament progress color ────────────────────────────── */
  function filamentColor(pct) {
    if (pct > 50) return 'var(--clr-green)';
    if (pct > 20) return 'var(--clr-amber)';
    return 'var(--clr-red)';
  }

  /* ── Empty state HTML ───────────────────────────────────── */
  function emptyState(icon, title, sub) {
    return `<div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-sub">${sub}</div>
    </div>`;
  }

  /* ── Debounce ───────────────────────────────────────────── */
  function debounce(fn, delay = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  return {
    uid,
    fmtDuration, fmtTimer, fmtDate, fmtDateShort,
    fmtCost, statusBadge, filamentColor, emptyState, debounce,
  };
})();
