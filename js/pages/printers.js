/**
 * pages/printers.js — Yazıcı yönetimi
 */

const PrintersPage = (() => {

  function render() {
    const grid     = document.getElementById('printer-grid');
    const printers = Store.getPrinters();
    const active   = DashboardPage.getActivePrint();

    if (!printers.length) {
      grid.innerHTML = Utils.emptyState('🖨', 'Yazıcı Yok', 'İlk yazıcını eklemek için butona tıkla.');
      return;
    }

    grid.innerHTML = printers.map(pr => {
      const isActive  = active && active.printer === pr.id;
      const totalCost = Store.getPrints()
        .filter(p => p.printer === pr.id && p.status === 'done')
        .reduce((a, p) => a + (p.cost || 0), 0);

      return `
        <div class="printer-card ${isActive ? 'is-active' : ''}">
          <div class="pc-header">
            <div class="pc-icon">🖨</div>
            <div class="pc-info">
              <div class="pc-name">${pr.name}</div>
              <div class="pc-model">${pr.brand} · ${pr.watt}W</div>
            </div>
            <span class="status-dot ${isActive ? 'printing' : 'idle'}"></span>
          </div>
          <div class="pc-stats">
            <div class="pc-stat">
              <div class="pc-stat-label">TOPLAM BASKI</div>
              <div class="pc-stat-value" style="color:var(--clr-accent)">${pr.totalPrints}</div>
            </div>
            <div class="pc-stat">
              <div class="pc-stat-label">KULLANILAN</div>
              <div class="pc-stat-value" style="color:var(--clr-green)">${pr.totalFilament}g</div>
            </div>
            <div class="pc-stat">
              <div class="pc-stat-label">TOPLAM MALİYET</div>
              <div class="pc-stat-value" style="color:var(--clr-purple)">${Utils.fmtCost(totalCost)}</div>
            </div>
            <div class="pc-stat">
              <div class="pc-stat-label">YATAK HACMİ</div>
              <div class="pc-stat-value" style="font-size:12px;color:var(--clr-blue)">${pr.bed || '—'}</div>
            </div>
          </div>
          ${pr.notes ? `<div class="pc-notes">${pr.notes}</div>` : ''}
          <div class="pc-footer">
            <button class="btn btn-sm btn-danger" onclick="Pages.printers.deletePrinter('${pr.id}')">🗑 Sil</button>
          </div>
        </div>`;
    }).join('');
  }

  function openAddModal() {
    ['pr-name','pr-bed','pr-notes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('pr-watt').value  = 200;
    document.getElementById('pr-price').value = '';
    UI.openModal('modal-printer');
  }

  function savePrinter() {
    const name = document.getElementById('pr-name').value.trim();
    if (!name) { UI.toast('Yazıcı adı zorunlu!', 'error'); return; }

    Store.addPrinter({
      name,
      brand: document.getElementById('pr-brand').value,
      watt:  parseFloat(document.getElementById('pr-watt').value)  || 200,
      bed:   document.getElementById('pr-bed').value,
      price: parseFloat(document.getElementById('pr-price').value) || 0,
      notes: document.getElementById('pr-notes').value,
    });

    UI.closeModal('modal-printer');
    UI.toast('Yazıcı eklendi!', 'success');
    render();
  }

  function deletePrinter(id) {
    if (!confirm('Yazıcıyı silmek istediğine emin misin?')) return;
    Store.deletePrinter(id);
    UI.toast('Yazıcı silindi.', 'info');
    render();
  }

  function init() {
    document.getElementById('printer-add-btn').addEventListener('click', openAddModal);
    document.getElementById('btn-save-printer').addEventListener('click', savePrinter);
  }

  return { init, render, deletePrinter, openAddModal };
})();


/* ══════════════════════════════════════════════════════════════
   pages/cost.js — Maliyet hesaplayıcı & özet
══════════════════════════════════════════════════════════════ */

const CostPage = (() => {

  function render() {
    _calcCost();
    _renderMonthlySummary();
    _renderFilamentBreakdown();
  }

  function _calcCost() {
    const grams  = parseFloat(document.getElementById('calc-grams').value)  || 0;
    const price  = parseFloat(document.getElementById('calc-price').value)  || 0;
    const hours  = parseFloat(document.getElementById('calc-hours').value)  || 0;
    const watt   = parseFloat(document.getElementById('calc-watt').value)   || 0;
    const kwh    = parseFloat(document.getElementById('calc-kwh').value)    || 0;
    const margin = parseFloat(document.getElementById('calc-margin').value) || 0;

    const filCost  = (grams / 1000) * price;
    const elecCost = hours * (watt / 1000) * kwh;
    const subtotal = filCost + elecCost;
    const profit   = subtotal * (margin / 100);
    const total    = subtotal + profit;

    document.getElementById('cost-result').innerHTML = `
      <div class="cost-row"><span class="cost-label">Filament maliyeti</span><span class="cost-value">₺${filCost.toFixed(2)}</span></div>
      <div class="cost-row"><span class="cost-label">Elektrik maliyeti</span><span class="cost-value">₺${elecCost.toFixed(2)}</span></div>
      <div class="cost-row"><span class="cost-label">Ara toplam</span><span class="cost-value">₺${subtotal.toFixed(2)}</span></div>
      <div class="cost-row"><span class="cost-label">Kâr (${margin}%)</span><span class="cost-value">₺${profit.toFixed(2)}</span></div>
      <div class="cost-row total"><span>Satış Fiyatı</span><span>₺${total.toFixed(2)}</span></div>`;
  }

  function _renderMonthlySummary() {
    const el  = document.getElementById('monthly-summary');
    if (!el) return;
    const now  = new Date();
    const thisMonth = Store.getPrints().filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const filCost  = thisMonth.reduce((a, p) => {
      const f = Store.getFilamentById(p.filament);
      return a + (f ? (p.grams / 1000) * f.price : 0);
    }, 0);
    const elecCost = thisMonth.reduce((a, p) => {
      const pr = Store.getPrinterById(p.printer);
      return a + ((p.duration || 0) / 60) * ((pr ? pr.watt : 200) / 1000) * 5.8;
    }, 0);

    el.innerHTML = `
      <div class="cost-row"><span class="cost-label">Bu ay baskı</span><span class="cost-value">${thisMonth.length} adet</span></div>
      <div class="cost-row"><span class="cost-label">Filament harcaması</span><span class="cost-value">₺${filCost.toFixed(2)}</span></div>
      <div class="cost-row"><span class="cost-label">Elektrik harcaması</span><span class="cost-value">₺${elecCost.toFixed(2)}</span></div>
      <div class="cost-row total"><span>Bu ay toplam</span><span>₺${(filCost + elecCost).toFixed(2)}</span></div>`;
  }

  function _renderFilamentBreakdown() {
    const el = document.getElementById('filament-breakdown');
    if (!el) return;
    const filaments = Store.getFilaments();
    if (!filaments.length) { el.innerHTML = '<div style="color:var(--clr-muted);font-size:13px;padding:8px 0">Filament yok.</div>'; return; }

    el.innerHTML = filaments.map(f => {
      const used = Store.getPrints()
        .filter(p => p.filament === f.id && p.status === 'done')
        .reduce((a, p) => a + p.grams, 0);
      const cost = (used / 1000) * f.price;
      return `<div class="cost-row">
        <span class="cost-label">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${f.color};margin-right:6px;vertical-align:middle"></span>
          ${f.brand} ${f.colorName} (${used}g)
        </span>
        <span class="cost-value">${Utils.fmtCost(cost)}</span>
      </div>`;
    }).join('');
  }

  function init() {
    ['calc-grams','calc-price','calc-hours','calc-watt','calc-kwh','calc-margin'].forEach(id => {
      document.getElementById(id).addEventListener('input', _calcCost);
    });
  }

  return { init, render };
})();
