/**
 * app.js — Ana giriş noktası
 * Tüm modülleri başlatır.
 */

// Pages registry — UI.showPage() bu objeyi kullanır
const Pages = {
  dashboard: DashboardPage,
  prints:    PrintsPage,
  filaments: FilamentsPage,
  printers:  PrintersPage,
  cost:      CostPage,
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Veri yükle
  Store.load();
  Store.seedDemo();

  // 2. UI sistemi başlat (nav, modal, burger vb.)
  UI.init();

  // 3. Her sayfayı başlat (event listener'lar)
  DashboardPage.init();
  PrintsPage.init();
  FilamentsPage.init();
  PrintersPage.init();
  CostPage.init();

  // 4. Grafikleri başlat
  Charts.init();

  // 5. İlk render
  DashboardPage.render();
  PrintsPage.render();
  FilamentsPage.render();
  PrintersPage.render();
  CostPage.render();

  // 6. Hash'e göre sayfa belirle (veya dashboard varsayılan)
  const hash = window.location.hash.replace('#', '');
  const validPages = Object.keys(Pages);
  if (hash && validPages.includes(hash)) {
    UI.showPage(hash);
  }

  console.log('PrintFlow v1.0 — hazır ✓');
});
