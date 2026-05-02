(function () {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQPLu4QSVJaZp2rJ3Yc5r59jc4KmbwQ7qXL5tAWA5VuJXuYeHDW335g8CYArvLMQdNdw/exec';
  const TOKEN_KEY = 'ts_auth_token';
  let currentTab = 'login';

  async function authCall(data) {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow'
    });
    return res.json();
  }

  function getWall() { return document.getElementById('auth-wall'); }

  function showWall() {
    getWall().style.display = 'flex';
    document.getElementById('auth-email').focus();
  }

  function hideWall() {
    getWall().style.display = 'none';
  }

  function setMsg(msg, ok) {
    const el = document.getElementById('auth-msg');
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

  async function checkToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { showWall(); return; }
    try {
      const res = await authCall({ action: 'check', token });
      if (res.ok) { hideWall(); showLogoutBtn(res.email); }
      else { localStorage.removeItem(TOKEN_KEY); showWall(); }
    } catch (_) { localStorage.removeItem(TOKEN_KEY); showWall(); }
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
    if (isReg) {
      tr.style.background = '#0AB9E6'; tr.style.color = '#fff';
      tl.style.background = 'transparent'; tl.style.color = '#555';
    } else {
      tl.style.background = '#0AB9E6'; tl.style.color = '#fff';
      tr.style.background = 'transparent'; tr.style.color = '#555';
    }
  }

  function init() {
    checkToken();

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
