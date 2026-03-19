/**
 * pages/filaments.js — Filament stok yönetimi
 */

const FilamentsPage = (() => {
  const SWATCHES = [
    '#f0f0ec','#1a1a2e','#ff6b35','#4a9eff','#2ecc8a',
    '#a78bfa','#ffaa00','#ff4757','#ff6b9d','#c8d6e5',
  ];

  function render() {
    const grid      = document.getElementById('filament-grid');
    const filaments = Store.getFilaments();

    if (!filaments.length) {
      grid.innerHTML = Utils.emptyState('◎', 'Filament Yok', 'İlk makaranı eklemek için butona tıkla.');
      return;
    }

    grid.innerHTML = filaments.map(f => {
      const pct   = Math.round((f.remaining / f.total) * 100);
      const color = Utils.filamentColor(pct);
      return `
        <div class="filament-card">
          <div class="fc-header">
            <div>
              <div class="fc-brand">${f.brand}</div>
              <div class="fc-name">${f.colorName}</div>
            </div>
            <div class="fc-right">
              <div class="fc-dot" style="background:${f.color}"></div>
              <span class="type-tag">${f.type}</span>
            </div>
          </div>
          <div class="progress-wrap">
            <div class="progress-labels">
              <span>${f.remaining}g kalan</span>
              <span>%${pct}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
            </div>
          </div>
          <div class="fc-meta">
            <div class="fc-meta-item"><span class="label">TOPLAM</span><span class="value">${f.total}g</span></div>
            <div class="fc-meta-item"><span class="label">FİYAT</span><span class="value">₺${f.price}/kg</span></div>
            <div class="fc-meta-item"><span class="label">SICAKLIK</span><span class="value">${f.temp}°C</span></div>
            <div class="fc-meta-item"><span class="label">100g MALİYET</span><span class="value">₺${(f.price * 0.1).toFixed(0)}</span></div>
          </div>
          ${f.notes ? `<div class="fc-notes">${f.notes}</div>` : ''}
          <div class="fc-actions">
            <button class="btn btn-sm btn-danger" style="flex:1" onclick="Pages.filaments.deleteFilament('${f.id}')">🗑 Sil</button>
          </div>
        </div>`;
    }).join('');
  }

  function openAddModal() {
    ['f-brand','f-color-name','f-notes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-total').value     = 1000;
    document.getElementById('f-remaining').value = 1000;
    document.getElementById('f-price').value     = 450;
    document.getElementById('f-temp').value      = 210;
    document.getElementById('f-type').value      = 'PLA';
    document.getElementById('f-color').value     = '#ff6b35';
    _buildSwatches();
    UI.openModal('modal-filament');
  }

  function _buildSwatches() {
    const row = document.getElementById('color-swatches');
    row.innerHTML = SWATCHES.map(c =>
      `<div class="color-swatch" style="background:${c}" data-color="${c}"></div>`
    ).join('');
    row.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        row.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        document.getElementById('f-color').value = sw.dataset.color;
      });
    });
  }

  function saveFilament() {
    const brand     = document.getElementById('f-brand').value.trim();
    const colorName = document.getElementById('f-color-name').value.trim();
    if (!brand || !colorName) { UI.toast('Marka ve renk adı zorunlu!', 'error'); return; }

    const total     = parseFloat(document.getElementById('f-total').value)     || 1000;
    const remaining = parseFloat(document.getElementById('f-remaining').value) || total;

    Store.addFilament({
      brand, colorName,
      type:      document.getElementById('f-type').value,
      color:     document.getElementById('f-color').value,
      total, remaining,
      price:     parseFloat(document.getElementById('f-price').value) || 0,
      temp:      parseFloat(document.getElementById('f-temp').value)  || 210,
      notes:     document.getElementById('f-notes').value,
    });

    UI.closeModal('modal-filament');
    UI.toast('Filament eklendi!', 'success');
    render();
  }

  function deleteFilament(id) {
    if (!confirm('Bu makarayı silmek istediğine emin misin?')) return;
    Store.deleteFilament(id);
    UI.toast('Filament silindi.', 'info');
    render();
  }

  function init() {
    document.getElementById('filament-add-btn').addEventListener('click', openAddModal);
    document.getElementById('btn-save-filament').addEventListener('click', saveFilament);
  }

  return { init, render, deleteFilament, openAddModal };
})();
