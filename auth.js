(function () {
  const SCRIPT_URL = '/api/auth';
  const TOKEN_KEY = 'ts_auth_token';
  const VERSION_KEY = 'ts_site_version';
  const VERSION_URL = 'version.json';
  let currentTab = 'login';

  async function authCall(data) {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
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

  function showWall() {
    const w = getWall();
    w.style.opacity = '1';
    w.style.display = 'flex';
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
      const data = await res.json();
      return data && data.v != null ? String(data.v) : null;
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
      // Network failure — be lenient: keep token, let user in
      // (server will reject sensitive ops if token is invalid)
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
        hideWall(); showLogoutBtn(res.email);
      } else if (res.error === 'no_aprobado') {
        setMsg('Tu cuenta aún no ha sido aprobada por el administrador.');
      } else {
        setMsg('Correo o contraseña incorrectos.');
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
        setMsg('Cuenta creada. Espera la aprobación del administrador para ingresar.', true);
        setTimeout(() => switchTab('login'), 2500);
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
