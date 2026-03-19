/**
 * app-firebase.js — Firebase entegrasyonlu ana giriş noktası
 */

import Store  from './store-firebase.js';
import AuthUI from './auth-ui.js';

// Pages registry
const Pages = {
  dashboard: DashboardPage,
  prints:    PrintsPage,
  filaments: FilamentsPage,
  printers:  PrintersPage,
  cost:      CostPage,
};
window.Pages = Pages;

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // UI sistemi başlat (nav, modal, burger — auth olmadan da çalışır)
  UI.init();

  // Auth state manager
  AuthUI.init(
    /* onLogin  */ async (user) => {
      UI.toast(`Hoş geldin, ${user.displayName?.split(' ')[0] || 'Kullanıcı'}! 👋`, 'success');

      // Veri yükle
      await Store.load();
      await Store.seedDemo();

      // Real-time dinleyiciler — Firestore değişince UI güncellenir
      Store.startListeners((collection) => {
        Store.syncPrinterStats();
        Pages.dashboard.render();
        if (collection === 'prints')    Pages.prints.render();
        if (collection === 'filaments') Pages.filaments.render();
        if (collection === 'printers')  Pages.printers.render();
        Pages.cost.render();
        Charts.update();
      });

      // Sayfa init
      DashboardPage.init();
      PrintsPage.init();
      FilamentsPage.init();
      PrintersPage.init();
      CostPage.init();

      // Charts
      Charts.init();

      // İlk render
      Object.values(Pages).forEach(p => p.render());

      // Hash routing
      const hash = window.location.hash.replace('#', '');
      if (hash && Pages[hash]) UI.showPage(hash);
    },

    /* onLogout */ () => {
      Store.stopListeners();
    }
  );
});
