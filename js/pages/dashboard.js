/**
 * pages/dashboard.js — Dashboard & aktif baskı takibi
 */

const DashboardPage = (() => {
  let _activePrint  = null;
  let _timerStart   = null;
  let _timerInterval = null;

  /* ── Render ─────────────────────────────────────────────── */
  function render() {
    _renderStats();
    _renderRecentTable();
    Charts.update();
    _refreshBanner();
  }

  /* ── Stats ──────────────────────────────────────────────── */
  function _renderStats() {
    const prints  = Store.getPrints();
    const done    = prints.filter(p => p.status === 'done');

    const totalH  = +(done.reduce((a, p) => a + (p.duration || 0), 0) / 60).toFixed(1);
    const totalG  = done.reduce((a, p) => a + (p.grams || 0), 0);
    const totalCost = done.reduce((a, p) => a + (p.cost || 0), 0);

    document.getElementById('s-total').textContent  = prints.length;
    document.getElementById('s-hours').textContent  = totalH + 's';
    document.getElementById('s-grams').textContent  = totalG + 'g';
    document.getElementById('s-cost').textContent   = Utils.fmtCost(totalCost);
  }

  /* ── Recent Prints Table ────────────────────────────────── */
  function _renderRecentTable() {
    const tbody  = document.getElementById('tbody-recent');
    const recent = Store.getPrints().slice(0, 6);

    if (!recent.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--clr-muted)">
        Henüz baskı yok — sağ üstten ekle.
      </td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(p => `
      <tr onclick="DashboardPage.showDetail('${p.id}')">
        <td class="td-primary">${p.name}</td>
        <td class="td-muted">${_printerName(p.printer)}</td>
        <td class="td-green">${p.grams}g</td>
        <td class="td-blue">${Utils.fmtDuration(p.duration)}</td>
        <td class="td-accent">${Utils.fmtCost(p.cost)}</td>
        <td>${Utils.statusBadge(p.status)}</td>
      </tr>`).join('');
  }

  /* ── Active Print Banner ────────────────────────────────── */
  function setActivePrint(print) {
    _activePrint = print;
    _timerStart  = Date.now() - (print._elapsed || 0);
    _startTimer();
    _showBanner();
    UI.updateSidebarStatus('printing', _printerName(print.printer), '⬡ Baskı Devam Ediyor');
  }

  function _startTimer() {
    clearInterval(_timerInterval);
    _timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - _timerStart) / 1000);
      const el = document.getElementById('ab-timer');
      if (el) el.textContent = Utils.fmtTimer(elapsed);
    }, 1000);
  }

  function _showBanner() {
    if (!_activePrint) return;
    const banner = document.getElementById('active-banner');
    banner.style.display = 'flex';

    document.getElementById('ab-model-name').textContent = _activePrint.name;
    const pr  = Store.getPrinterById(_activePrint.printer);
    const fil = Store.getFilamentById(_activePrint.filament);
    document.getElementById('ab-sub').textContent =
      `${pr ? pr.name : '—'} · ${fil ? fil.brand + ' ' + fil.colorName : '—'} · ${_activePrint.grams}g`;
  }

  function _refreshBanner() {
    if (_activePrint) { _showBanner(); return; }
    document.getElementById('active-banner').style.display = 'none';
  }

  function completePrint() {
    if (!_activePrint) return;
    const elapsedMin = Math.round((Date.now() - _timerStart) / 60000);
    Store.updatePrint(_activePrint.id, {
      status:   'done',
      duration: elapsedMin || _activePrint.duration,
      cost:     Store.calcPrintCost(_activePrint.grams, elapsedMin || _activePrint.duration, _activePrint.filament),
    });
    Store.deductFilament(_activePrint.filament, _activePrint.grams);
    Store.syncPrinterStats();
    _stopActive();
    UI.toast('Baskı tamamlandı! ✓', 'success');
    render();
    Pages.prints.render();
  }

  function failPrint() {
    if (!_activePrint) return;
    Store.updatePrint(_activePrint.id, { status: 'failed' });
    _stopActive();
    UI.toast('Baskı başarısız olarak işaretlendi.', 'error');
    render();
    Pages.prints.render();
  }

  function _stopActive() {
    clearInterval(_timerInterval);
    _activePrint  = null;
    _timerStart   = null;
    document.getElementById('active-banner').style.display = 'none';
    const pr = Store.getPrinters()[0];
    UI.updateSidebarStatus('idle', pr ? pr.name : '—', 'Boşta');
  }

  function getActivePrint() { return _activePrint; }

  /* ── Print Detail Modal ─────────────────────────────────── */
  function showDetail(id) {
    const p = Store.getPrintById(id);
    if (!p) return;

    const fil = Store.getFilamentById(p.filament);
    document.getElementById('detail-title').textContent = p.name;
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-cell">
          <span class="label">Yazıcı</span>
          <span class="value" style="font-size:14px">${_printerName(p.printer)}</span>
        </div>
        <div class="detail-cell">
          <span class="label">Durum</span>
          <span class="value">${Utils.statusBadge(p.status)}</span>
        </div>
        <div class="detail-cell">
          <span class="label">Filament</span>
          <span class="value" style="font-size:13px">${fil ? fil.brand + ' ' + fil.colorName + ' (' + fil.type + ')' : '—'}</span>
        </div>
        <div class="detail-cell">
          <span class="label">Kullanılan</span>
          <span class="value" style="color:var(--clr-green)">${p.grams}g</span>
        </div>
        <div class="detail-cell">
          <span class="label">Süre</span>
          <span class="value" style="color:var(--clr-blue)">${Utils.fmtDuration(p.duration)}</span>
        </div>
        <div class="detail-cell">
          <span class="label">Maliyet</span>
          <span class="value" style="color:var(--clr-accent)">${Utils.fmtCost(p.cost)}</span>
        </div>
        <div class="detail-cell">
          <span class="label">Katman</span>
          <span class="value" style="font-size:14px">${p.layer || '—'}mm</span>
        </div>
        <div class="detail-cell">
          <span class="label">Doluluk</span>
          <span class="value" style="font-size:14px">%${p.infill || '—'}</span>
        </div>
      </div>
      <div class="label" style="margin-bottom:6px">NOTLAR</div>
      <div class="notes-box">${p.notes || 'Not girilmemiş.'}</div>
      <div class="detail-date">${Utils.fmtDate(p.date)}</div>
      <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--clr-border);margin-top:16px">
        <button class="btn btn-danger btn-sm" onclick="Pages.prints.deletePrint('${p.id}');UI.closeModal('modal-detail')">🗑 Sil</button>
      </div>`;

    UI.openModal('modal-detail');
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    document.getElementById('btn-complete').addEventListener('click', completePrint);
    document.getElementById('btn-fail').addEventListener('click', failPrint);

    // Check for in-progress print on reload
    const inProgress = Store.getPrints().find(p => p.status === 'printing');
    if (inProgress) {
      _activePrint = inProgress;
      _timerStart  = inProgress.date;
      _startTimer();
      _showBanner();
      const pr = Store.getPrinterById(inProgress.printer);
      UI.updateSidebarStatus('printing', pr ? pr.name : '—', '⬡ Baskı Devam Ediyor');
    } else {
      const pr = Store.getPrinters()[0];
      UI.updateSidebarStatus('idle', pr ? pr.name : '—', 'Boşta');
    }
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function _printerName(id) {
    const p = Store.getPrinterById(id);
    return p ? p.name : '—';
  }

  return { init, render, showDetail, setActivePrint, getActivePrint, completePrint, failPrint };
})();
