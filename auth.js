(function () {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQPLu4QSVJaZp2rJ3Yc5r59jc4KmbwQ7qXL5tAWA5VuJXuYeHDW335g8CYArvLMQdNdw/exec';
  const isLocalDev = /^(localhost|127\.0\.0\.1|.*\.replit\.dev|.*\.repl\.co)$/i.test(location.hostname);
  const SCRIPT_URL = isLocalDev ? '/api/auth' : APPS_SCRIPT_URL;
  const TOKEN_KEY = 'ts_auth_token';
  const VERSION_KEY = 'ts_site_version';
  const VERSION_URL = 'sw.js';
  let currentTab = 'login';
  let _pendingEmail = '', _pendingPwd = '', _pollTimer = null;

  async function authCall(data) {
    // Use text/plain when calling Apps Script directly to avoid CORS preflight
    const headers = isLocalDev
      ? { 'Content-Type': 'application/json' }
      : { 'Content-Type': 'text/plain;charset=utf-8' };
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headers,
      redirect: 'follow'
    });
    return res.json();
  }

  function getWall() { return document.getElementById('auth-wall'); }
  function getForm() { return document.getElementById('auth-form-content'); }
  function getLoading() { return document.getElementById('auth-loading'); }

  function showFormContent() {
    const f = getForm(); const l = getLoading();
    if (f) f.style.display = 'block';
    if (l) l.style.display = 'none';
    const email = document.getElementById('auth-email');
    if (email) try { email.focus(); } catch (_) {}
  }

  function showLoadingState(text) {
    const f = getForm(); const l = getLoading();
    if (f) f.style.display = 'none';
    if (l) l.style.display = 'block';
    const t = document.getElementById('auth-loading-text');
    if (t && text) t.textContent = text;
  }

  function lockBodyScroll() {
    document.documentElement.classList.add('auth-locked');
    document.body.classList.add('auth-locked');
  }

  function unlockBodyScroll() {
    document.documentElement.classList.remove('auth-locked');
    document.body.classList.remove('auth-locked');
  }

  function showWall() {
    const w = getWall();
    w.style.opacity = '1';
    w.style.display = 'flex';
    lockBodyScroll();
    showFormContent();
  }

  function hideWall() {
    const w = getWall();
    w.style.transition = 'opacity .45s ease';
    w.style.opacity = '0';
    setTimeout(function () {
      w.style.display = 'none';
      w.style.opacity = '1';
      w.style.transition = '';
      unlockBodyScroll();
    }, 460);
  }

  function setMsg(msg, ok) {
    const el = document.getElementById('auth-msg');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#25D366' : '#ff6b6b';
    el.style.background = ok ? 'rgba(37,211,102,.08)' : 'rgba(255,107,107,.08)';
    el.style.display = msg ? 'block' : 'none';
  }

 function setLoading(on, btnText) {
    const btn = document.getElementById('auth-submit-btn');
    if (!btn) return;
    btn.disabled = on;
    btn.textContent = on ? '...' : btnText;
  }

  function showLogoutBtn(email) {
    const btn = document.getElementById('auth-logout-btn');
    if (btn) { btn.style.display = 'flex'; btn.title = 'Cerrar sesión (' + email + ')'; }
  }

  async function fetchSiteVersion() {
    try {
      const res = await fetch(VERSION_URL + '?_=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return null;
      const text = await res.text();
      const m = text.match(/CACHE\s*=\s*['"]([^'"]+)['"]/);
      return m ? m[1] : null;
    } catch (_) { return null; }
  }

  async function checkVersionAndToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    // No token at all → just show form
    if (!token) {
      const v = await fetchSiteVersion();
      if (v) localStorage.setItem(VERSION_KEY, v);
      showWall();
      return;
    }

    // Token exists → keep loading state visible while we validate
    showLoadingState('Verificando sesión');

    const siteVersion = await fetchSiteVersion();

    // If we got a version AND user had a stored version AND they differ → force logout
    if (siteVersion && storedVersion && siteVersion !== storedVersion) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(VERSION_KEY, siteVersion);
      showWall();
      setMsg('Tu sesión expiró por una actualización del sitio. Vuelve a iniciar sesión.', true);
      return;
    }

    // Update stored version (covers first-time and same-version cases)
    if (siteVersion) localStorage.setItem(VERSION_KEY, siteVersion);

    // Now validate token with server
try {
      const res = await authCall({ action: 'check', token });
      if (res.ok) {
        hideWall();
        showLogoutBtn(res.email);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        showWall();
      }
    } catch (_) {
      hideWall();
    }
  }

  async function doLogin() {
    const email = document.getElementById('auth-email').value.trim();
    const pwd = document.getElementById('auth-pwd').value;
    if (!email || !pwd) { setMsg('Completa todos los campos'); return; }
    setLoading(true, 'Iniciar sesión'); setMsg('');
    try {
      const res = await authCall({ action: 'login', email, password: pwd });
     if (res.ok) {
        localStorage.setItem(TOKEN_KEY, res.token);
        const v = await fetchSiteVersion();
        if (v) localStorage.setItem(VERSION_KEY, v);
        hideWall();
        showLogoutBtn(res.email);
      } else if (res.error === 'no_aprobado') {
        setMsg('Tu cuenta aún no ha sido aprobada por el administrador.');
      } else {
        setMsg('Correo o contraseña incorrectos. Si no tienes cuenta, presiona "Registrarse" arriba.');
      }
    } catch (_) { setMsg('Error de conexión. Intenta de nuevo.'); }
    finally { setLoading(false, 'Iniciar sesión'); }
  }

  async function doRegister() {
    const email = document.getElementById('auth-email').value.trim();
    const pwd = document.getElementById('auth-pwd').value;
    const pwd2 = document.getElementById('auth-pwd2').value;
    if (!email || !pwd || !pwd2) { setMsg('Completa todos los campos'); return; }
    if (pwd !== pwd2) { setMsg('Las contraseñas no coinciden'); return; }
    if (pwd.length < 6) { setMsg('La contraseña debe tener mínimo 6 caracteres'); return; }
    setLoading(true, 'Registrarse'); setMsg('');
    try {
      const res = await authCall({ action: 'register', email, password: pwd });
      if (res.ok) {
        _pendingEmail = email;
        _pendingPwd = pwd;
        showWAGate();
      } else if (res.error === 'email_existe') {
        setMsg('Este correo ya está registrado.');
      } else {
        setMsg('Error al registrar. Intenta de nuevo.');
      }
    } catch (_) { setMsg('Error de conexión. Intenta de nuevo.'); }
    finally { setLoading(false, 'Registrarse'); }
  }

  function switchTab(tab) {
    currentTab = tab;
    setMsg('');
    const isReg = tab === 'register';
    document.getElementById('auth-pwd2-wrap').style.display = isReg ? 'block' : 'none';
    document.getElementById('auth-submit-btn').textContent = isReg ? 'Registrarse' : 'Iniciar sesión';
    const tl = document.getElementById('auth-tab-login');
    const tr = document.getElementById('auth-tab-register');
    tl.classList.toggle('at-active', !isReg);
    tr.classList.toggle('at-active', isReg);
  }
 function showWAGate() {
    showFormContent();
    const f = getForm();
    if (!f) return;
    const waNum = (window.WA) || '5355207586';
    const msg = '\uD83D\uDC4B Hola TS Epic Den, me acabo de registrar en el cat\u00E1logo con el correo: *' + _pendingEmail + '*. \u00A1Solicito acceso! \uD83C\uDFAE';

    f.innerHTML =
      '<div style="text-align:center">' +
        '<img src="logo.png" alt="TS Epic Den" style="width:64px;height:64px;border-radius:16px;object-fit:contain;background:#000;padding:3px;margin-bottom:16px"/>' +
        '<div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:8px">\u00A1Bienvenido al cat\u00E1logo! \uD83C\uDFAE</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:20px">Este cat\u00E1logo es <strong style="color:#fff">exclusivo para clientes de TS Epic Den</strong>.<br/>Para solicitar acceso, conf\u00EDrmanos por WhatsApp.</div>' +
        '<div style="font-size:11px;color:rgba(10,185,230,.7);background:rgba(10,185,230,.07);border:1px solid rgba(10,185,230,.15);border-radius:10px;padding:10px 14px;margin-bottom:20px;line-height:1.6">' +
          '\uD83D\uDCE7 Registrado como:<br/><span style="font-weight:800;color:#0AB9E6;font-size:12px">' + _pendingEmail + '</span>' +
        '</div>' +
        '<button id="wa-gate-btn" style="width:100%;padding:15px;border:none;border-radius:12px;background:#25D366;color:#fff;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 4px 18px rgba(37,211,102,.35);margin-bottom:12px;font-family:inherit">\uD83D\uDCF2 Confirmar por WhatsApp</button>' +
      '</div>';

    document.getElementById('wa-gate-btn').onclick = function () {
      window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent(msg), '_blank');
      _showWaitingScreen();
      _pollApproval();
    };
  }

  function _showWaitingScreen() {
    const f = getForm();
    if (!f) return;
    f.innerHTML =
      '<div style="text-align:center;padding:12px 0">' +
        '<div class="auth-spinner"></div>' +
        '<div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:10px">Esperando aprobaci\u00F3n</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,.55);line-height:1.7;margin-bottom:16px">El administrador activar\u00E1 tu cuenta en breve.<br/>Esta pantalla se actualizar\u00E1 autom\u00E1ticamente.</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,.2)">Verificando cada 5 segundos...</div>' +
      '</div>';
  }

  function _pollApproval() {
    clearTimeout(_pollTimer);
    _pollTimer = setTimeout(async function () {
      try {
        const res = await authCall({ action: 'login', email: _pendingEmail, password: _pendingPwd });
        if (res.ok) {
          localStorage.setItem(TOKEN_KEY, res.token);
          const v = await fetchSiteVersion();
          if (v) localStorage.setItem(VERSION_KEY, v);
          showLogoutBtn(res.email);
          _pendingEmail = '';
          _pendingPwd = '';
          hideWall();
          return;
        }
      } catch (_) {}
      _pollApproval();
    }, 5000);
  }
 
 function init() {
    // Decide what to show: if there's a token, keep loading state; otherwise jump straight to form
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    if (!hasToken) showFormContent();

    document.getElementById('auth-tab-login').addEventListener('click', () => switchTab('login'));
    document.getElementById('auth-tab-register').addEventListener('click', () => switchTab('register'));

    document.getElementById('auth-submit-btn').addEventListener('click', function () {
      if (currentTab === 'login') doLogin(); else doRegister();
    });

    ['auth-email', 'auth-pwd', 'auth-pwd2'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('auth-submit-btn').click();
      });
    });

    const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    function togglePwdVisibility(btn) {
      if (!btn) return;
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const wasFocused = document.activeElement === input;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
      btn.innerHTML = showing ? EYE_OPEN : EYE_OFF;
      // Only re-focus if it was already focused (avoid forcing keyboard open)
      if (wasFocused) {
        try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
      }
    }
    // Use pointerdown so it fires BEFORE focus changes / keyboard dismiss on Android
    let lastPwdToggleTs = 0;
    function handlePwdToggle(e) {
      const btn = e.target && e.target.closest && e.target.closest('.pwd-toggle');
      if (!btn) return;
      // Debounce: dedupe pointerdown + click on devices that fire both
      const now = Date.now();
      if (now - lastPwdToggleTs < 400) { e.preventDefault(); return; }
      lastPwdToggleTs = now;
      e.preventDefault();
      e.stopPropagation();
      togglePwdVisibility(btn);
    }
    if (window.PointerEvent) {
      document.addEventListener('pointerdown', handlePwdToggle);
    } else {
      document.addEventListener('touchstart', handlePwdToggle, { passive: false });
    }
    // Fallback for any environment that didn't fire pointerdown
    document.addEventListener('click', handlePwdToggle);

    const logoutBtn = document.getElementById('auth-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem(TOKEN_KEY);
        location.reload();
      });
    }

    checkVersionAndToken();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
