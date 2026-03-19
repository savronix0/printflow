/**
 * pages/prints.js — Baskı listesi & form
 */

const PrintsPage = (() => {

  /* ── Render ─────────────────────────────────────────────── */
  function render() {
    const filter = document.getElementById('filter-status').value;
    let   prints = Store.getPrints();
    if (filter) prints = prints.filter(p => p.status === filter);

    document.getElementById('prints-count').textContent = prints.length;

    const tbody = document.getElementById('tbody-prints');
    if (!prints.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--clr-muted)">
        Baskı bulunamadı.</td></tr>`;
      return;
    }

    tbody.innerHTML = prints.map(p => {
      const fil = Store.getFilamentById(p.filament);
      return `
        <tr onclick="DashboardPage.showDetail('${p.id}')">
          <td class="td-primary">${p.name}</td>
          <td class="td-muted">${_printerName(p.printer)}</td>
          <td class="td-green">${p.grams}g</td>
          <td>${fil ? `<span class="type-tag">${fil.type}</span>` : '—'}</td>
          <td class="td-blue">${Utils.fmtDuration(p.duration)}</td>
          <td class="td-accent">${Utils.fmtCost(p.cost)}</td>
          <td>${Utils.statusBadge(p.status)}</td>
          <td>
            <button class="btn btn-icon btn-danger btn-sm"
              onclick="event.stopPropagation();Pages.prints.deletePrint('${p.id}')">🗑</button>
          </td>
        </tr>`;
    }).join('');
  }

  /* ── Delete ─────────────────────────────────────────────── */
  function deletePrint(id) {
    if (!confirm('Bu baskıyı silmek istediğine emin misin?')) return;
    Store.deletePrint(id);
    Store.syncPrinterStats();
    UI.toast('Baskı silindi.', 'info');
    render();
    Pages.dashboard.render();
  }

  /* ── Open Modal ─────────────────────────────────────────── */
  function openAddModal() {
    // Populate selects
    const printers = Store.getPrinters();
    document.getElementById('p-printer').innerHTML = printers.length
      ? printers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')
      : '<option value="">— Önce yazıcı ekle —</option>';

    const filaments = Store.getFilaments();
    document.getElementById('p-filament').innerHTML = filaments.length
      ? filaments.map(f => `<option value="${f.id}">${f.brand} ${f.colorName} (${f.type}) — ${f.remaining}g</option>`).join('')
      : '<option value="">— Önce filament ekle —</option>';

    // Reset fields
    ['p-name','p-grams','p-duration','p-layer','p-infill','p-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('p-status').value = 'printing';

    UI.openModal('modal-print');
  }

  /* ── Save ───────────────────────────────────────────────── */
  function savePrint() {
    const name   = document.getElementById('p-name').value.trim();
    const grams  = parseFloat(document.getElementById('p-grams').value) || 0;
    if (!name)  { UI.toast('Model adı gerekli!', 'error'); return; }
    if (!grams) { UI.toast('Filament gramajı gerekli!', 'error'); return; }

    const printerId  = document.getElementById('p-printer').value;
    const filamentId = document.getElementById('p-filament').value;
    const duration   = parseInt(document.getElementById('p-duration').value) || 0;
    const status     = document.getElementById('p-status').value;

    if (!printerId)  { UI.toast('Yazıcı seçmelisin.', 'error'); return; }

    const cost = Store.calcPrintCost(grams, duration, filamentId);

    const print = Store.addPrint({
      name, printer: printerId, filament: filamentId,
      grams, duration, cost, status,
      layer:  parseFloat(document.getElementById('p-layer').value)  || 0.2,
      infill: parseInt(document.getElementById('p-infill').value)    || 20,
      notes:  document.getElementById('p-notes').value,
    });

    // If actively printing, start timer
    if (status === 'printing') {
      if (DashboardPage.getActivePrint()) {
        DashboardPage.completePrint();
      }
      DashboardPage.setActivePrint(print);
    } else {
      // Deduct filament immediately
      if (filamentId) Store.deductFilament(filamentId, grams);
    }

    Store.syncPrinterStats();
    UI.closeModal('modal-print');
    UI.toast('Baskı eklendi!', 'success');
    render();
    Pages.dashboard.render();
    Pages.filaments.render();
    Pages.printers.render();
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    document.getElementById('btn-save-print').addEventListener('click', savePrint);
    document.getElementById('new-print-btn').addEventListener('click', openAddModal);
    document.getElementById('prints-add-btn').addEventListener('click', openAddModal);
    document.getElementById('filter-status').addEventListener('change', render);
  }

  function _printerName(id) {
    const p = Store.getPrinterById(id);
    return p ? p.name : '—';
  }

  return { init, render, deletePrint, openAddModal, savePrint };
})();
