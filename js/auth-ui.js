/**
 * auth-ui.js — Google giriş ekranı & kullanıcı menüsü
 */

import { loginWithGoogle, logout, onAuthStateChanged, auth } from './firebase.js';

const AuthUI = (() => {

  /* ── Login screen ───────────────────────────────────────────── */
  function _buildLoginScreen() {
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
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Google ile Giriş Yap
          </button>
          <p class="login-note">Verileriniz güvenle saklanır ve sadece size özeldir.</p>
        </div>
      </div>`;
    return el;
  }

  /* ── User avatar/menu in topbar ─────────────────────────────── */
  function _buildUserMenu(user) {
    const existing = document.getElementById('user-menu-wrap');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.id = 'user-menu-wrap';
    wrap.className = 'user-menu-wrap';
    wrap.innerHTML = `
      <button class="user-avatar-btn" id="user-avatar-btn" title="${user.displayName}">
        ${user.photoURL
          ? `<img src="${user.photoURL}" class="user-avatar-img" referrerpolicy="no-referrer" />`
          : `<div class="user-avatar-fallback">${(user.displayName||'?')[0].toUpperCase()}</div>`
        }
      </button>
      <div class="user-dropdown" id="user-dropdown">
        <div class="user-dropdown-header">
          <div class="udd-name">${user.displayName || 'Kullanıcı'}</div>
          <div class="udd-email">${user.email || ''}</div>
        </div>
        <div class="user-dropdown-divider"></div>
        <button class="user-dropdown-item" id="logout-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
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
    });
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init(onLogin, onLogout) {
    onAuthStateChanged(auth, async user => {
      const loginScreen = document.getElementById('login-screen');

      if (user) {
        // Kullanıcı giriş yaptı
        loginScreen?.remove();
        document.getElementById('sidebar').style.display = '';
        document.querySelector('.main-content').style.display = '';
        _buildUserMenu(user);
        await onLogin(user);
      } else {
        // Oturum yok → login ekranı göster
        document.getElementById('sidebar').style.display = 'none';
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('user-menu-wrap')?.remove();

        if (!document.getElementById('login-screen')) {
          document.body.appendChild(_buildLoginScreen());
        }
        document.getElementById('google-login-btn').addEventListener('click', async () => {
          const btn = document.getElementById('google-login-btn');
          btn.disabled = true;
          btn.textContent = 'Giriş yapılıyor...';
          try {
            await loginWithGoogle();
          } catch {
            btn.disabled = false;
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18">...</svg> Google ile Giriş Yap`;
          }
        });
        onLogout();
      }
    });
  }

  return { init };
})();

export default AuthUI;
window.AuthUI = AuthUI;
