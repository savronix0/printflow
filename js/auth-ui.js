/**
 * auth-ui.js — Google giriş ekranı & kullanıcı menüsü
 * signInWithRedirect tabanlı — popup sorunlarını çözer
 */

import {
  loginWithGoogle, handleRedirectResult,
  logout, onAuthStateChanged, auth
} from './firebase.js';

const AuthUI = (() => {

  /* ── Yükleniyor ekranı (redirect dönüşünde) ─────────────── */
  function _showLoading(msg = 'Giriş yapılıyor...') {
    let el = document.getElementById('app-loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'app-loading';
      el.className = 'app-loading';
      el.innerHTML = `
        <div class="app-loading-logo">Print<span>Flow</span></div>
        <div class="spinner"></div>
        <div id="loading-msg" style="font-size:13px;color:var(--clr-muted);margin-top:8px">${msg}</div>`;
      document.body.appendChild(el);
    } else {
      document.getElementById('loading-msg').textContent = msg;
    }
  }

  function _hideLoading() {
    document.getElementById('app-loading')?.remove();
  }

  /* ── Login ekranı ────────────────────────────────────────── */
  function _showLoginScreen() {
    if (document.getElementById('login-screen')) return;

    const el = document.createElement('div');
    el.id = 'login-screen';
    el.innerHTML = `
      <div class="login-overlay">
        <div class="login-card">
          <div class="login-logo">Print<span>Flow</span></div>
          <div class="login-sub">3D Yazıcı Üretim Takibi</div>
          <div class="login-divider"></div>
          <p class="login-desc">Baskı sürelerin, filament stoğun ve maliyetlerin tek yerde.</p>
          <button class="btn-google" id="google-login-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" style="flex-shrink:0">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Google ile Giriş Yap
          </button>
          <div id="login-error" style="display:none;margin-top:12px;padding:10px 14px;background:var(--clr-red-bg);border:1px solid var(--clr-red-br);border-radius:var(--r-md);font-size:13px;color:var(--clr-red)"></div>
          <p class="login-note">Verileriniz güvenle saklanır ve sadece size özeldir.</p>
        </div>
      </div>`;
    document.body.appendChild(el);

    document.getElementById('google-login-btn').addEventListener('click', async () => {
      const btn = document.getElementById('google-login-btn');
      const errEl = document.getElementById('login-error');
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.lastChild.textContent = ' Yönlendiriliyor...';
      errEl.style.display = 'none';
      try {
        await loginWithGoogle();
        // Sayfa buradan redirect ile yenilenir — burası çalışmaz
      } catch (err) {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.lastChild.textContent = ' Google ile Giriş Yap';
        errEl.style.display = 'block';
        errEl.textContent = _friendlyError(err.code);
      }
    });
  }

  function _hideLoginScreen() {
    document.getElementById('login-screen')?.remove();
  }

  /* ── Kullanıcı menüsü (topbar) ───────────────────────────── */
  function _buildUserMenu(user) {
    document.getElementById('user-menu-wrap')?.remove();

    const wrap = document.createElement('div');
    wrap.id = 'user-menu-wrap';
    wrap.className = 'user-menu-wrap';

    const avatar = user.photoURL
      ? `<img src="${user.photoURL}" class="user-avatar-img" referrerpolicy="no-referrer" />`
      : `<div class="user-avatar-fallback">${(user.displayName || '?')[0].toUpperCase()}</div>`;

    wrap.innerHTML = `
      <button class="user-avatar-btn" id="user-avatar-btn" title="${user.displayName || ''}">
        ${avatar}
      </button>
      <div class="user-dropdown" id="user-dropdown">
        <div class="user-dropdown-header">
          <div class="udd-name">${user.displayName || 'Kullanıcı'}</div>
          <div class="udd-email">${user.email || ''}</div>
        </div>
        <div class="user-dropdown-divider"></div>
        <button class="user-dropdown-item" id="logout-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Çıkış Yap
        </button>
      </div>`;

    document.querySelector('.topbar-actions').prepend(wrap);

    document.getElementById('user-avatar-btn').addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('user-dropdown').classList.toggle('open');
    });
    document.addEventListener('click', () => {
      document.getElementById('user-dropdown')?.classList.remove('open');
    });
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await logout();
      window.location.reload();
    });
  }

  /* ── App show/hide ───────────────────────────────────────── */
  function _showApp() {
    document.getElementById('sidebar').style.display = '';
    document.querySelector('.main-content').style.display = '';
  }
  function _hideApp() {
    document.getElementById('sidebar').style.display = 'none';
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('user-menu-wrap')?.remove();
  }

  /* ── Hata mesajları Türkçe ───────────────────────────────── */
  function _friendlyError(code) {
    const map = {
      'auth/popup-blocked':         'Tarayıcı popup\'u engelledi. Redirect yöntemi deneniyor...',
      'auth/popup-closed-by-user':  'Giriş penceresi kapatıldı. Tekrar dene.',
      'auth/unauthorized-domain':   'Bu domain Firebase\'de yetkili değil. README\'deki adımı tamamla.',
      'auth/network-request-failed':'İnternet bağlantısı yok.',
      'auth/cancelled-popup-request': 'Birden fazla giriş isteği. Tekrar dene.',
    };
    return map[code] || `Giriş hatası: ${code}`;
  }

  /* ── Ana init ────────────────────────────────────────────── */
  async function init(onLogin, onLogout) {
    // Uygulama başlarken önce loading göster
    _showLoading('Bağlanıyor...');
    _hideApp();

    // Redirect dönüşünü yakala (Google'dan geri gelindiyse)
    await handleRedirectResult();

    // Auth state dinle
    onAuthStateChanged(auth, async user => {
      _hideLoading();

      if (user) {
        _hideLoginScreen();
        _showApp();
        _buildUserMenu(user);
        await onLogin(user);
      } else {
        _hideApp();
        _showLoginScreen();
        onLogout();
      }
    });
  }

  return { init };
})();

export default AuthUI;
window.AuthUI = AuthUI;
