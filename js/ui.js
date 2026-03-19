/**
 * ui.js — Genel UI yönetimi
 * Modal, toast, navigasyon, burger menü
 */

const UI = (() => {

  /* ── Toast ──────────────────────────────────────────────── */
  function toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 320);
    }, duration);
  }

  /* ── Modal ──────────────────────────────────────────────── */
  function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
    document.body.style.overflow = '';
  }

  /* ── Navigation ─────────────────────────────────────────── */
  const pageTitles = {
    dashboard: 'Dashboard',
    prints:    'Baskılar',
    filaments: 'Filament Stok',
    printers:  'Yazıcılar',
    cost:      'Maliyet Hesabı',
  };

  let _currentPage = 'dashboard';

  function showPage(pageId) {
    if (!document.getElementById('page-' + pageId)) return;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Deactivate nav items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Show target page
    document.getElementById('page-' + pageId).classList.add('active');

    // Activate nav item
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');

    // Update topbar title
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = pageTitles[pageId] || pageId;

    // Update hash
    window.location.hash = pageId;

    // Close sidebar on mobile
    closeSidebar();

    _currentPage = pageId;

    // Trigger page-specific render
    if (typeof Pages !== 'undefined' && Pages[pageId]) {
      Pages[pageId].render();
    }
  }

  function getCurrentPage() { return _currentPage; }

  /* ── Sidebar (mobile) ───────────────────────────────────── */
  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.style.overflow = '';
    }
  }

  /* ── Sidebar printer status ─────────────────────────────── */
  function updateSidebarStatus(status, printerName, metaText) {
    const dot  = document.getElementById('sb-status-dot');
    const name = document.getElementById('sb-printer-name');
    const meta = document.getElementById('sb-printer-meta');
    if (dot)  { dot.className = 'status-dot ' + status; }
    if (name && printerName) name.textContent = printerName;
    if (meta && metaText)    meta.textContent = metaText;
  }

  /* ── Event Delegation Setup ─────────────────────────────── */
  function init() {
    // Nav items
    document.getElementById('main-nav').addEventListener('click', e => {
      const item = e.target.closest('.nav-item');
      if (item) { e.preventDefault(); showPage(item.dataset.page); }
    });

    // "Tümünü Gör" and other ghost nav buttons
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-page]');
      if (btn && !btn.classList.contains('nav-item')) {
        e.preventDefault();
        showPage(btn.dataset.page);
      }
    });

    // Modal close buttons
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-close]');
      if (btn) closeModal(btn.dataset.close);

      // Click outside modal content
      if (e.target.classList.contains('modal-overlay')) {
        closeAllModals();
      }
    });

    // Burger
    document.getElementById('burger-btn').addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    // Sidebar overlay
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

    // Hash routing
    const hash = window.location.hash.replace('#', '');
    if (hash && pageTitles[hash]) showPage(hash);

    // Keyboard: Escape closes modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  return {
    toast, openModal, closeModal, closeAllModals,
    showPage, getCurrentPage,
    openSidebar, closeSidebar,
    updateSidebarStatus,
    init,
  };
})();
