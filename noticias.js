
// ============================================
// TS GAME STORE — noticias.js
// ============================================
(function injectNoticiasStyles() {
  if (document.getElementById('ts-noticias-styles')) return;
  const s = document.createElement('style');
  s.id = 'ts-noticias-styles';
  s.textContent = `
    .ts-card {
      transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s cubic-bezier(.4,0,.2,1);
      will-change: transform;
    }
    .ts-card:hover {
      transform: translateY(-10px) scale(1.04);
      box-shadow: 0 20px 50px rgba(10,185,230,.22), 0 8px 24px rgba(0,0,0,.7) !important;
    }
    .ts-card:hover .ts-cimg { transform: scale(1.08); }

    .ts-spotlight {
      transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s cubic-bezier(.4,0,.2,1);
      will-change: transform;
    }
    .ts-spotlight:hover {
      transform: translateY(-12px) scale(1.05);
      box-shadow: 0 24px 60px rgba(10,185,230,.28), 0 10px 28px rgba(0,0,0,.8) !important;
    }
    .ts-spotlight:hover .ts-cimg { transform: scale(1.08); }

    .ts-news-big, .ts-news-sm {
      transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s cubic-bezier(.4,0,.2,1);
    }
    .ts-news-big:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,.65) !important;
    }
    .ts-news-big:hover .ts-cimg { transform: scale(1.08); }
    .ts-news-sm:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 28px rgba(0,0,0,.55) !important;
    }
    .ts-news-sm:hover .ts-cimg { transform: scale(1.06); }

    .ts-cat {
      transition: transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s cubic-bezier(.4,0,.2,1);
      cursor: pointer;
    }
    .ts-cat:hover {
      transform: translateY(-8px) scale(1.06);
      box-shadow: 0 0 28px rgba(123,47,247,.4), 0 12px 30px rgba(0,0,0,.6) !important;
    }

    .ts-cimg { transition: transform .35s cubic-bezier(.4,0,.2,1); }

    @keyframes ts-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(220,0,0,.65); }
      50%      { box-shadow: 0 0 0 15px rgba(220,0,0,0); }
    }
    .ts-play { animation: ts-pulse 2.5s ease-in-out infinite; }
    .ts-play:active { transform: translate(-50%,-50%) scale(.86) !important; }

    @keyframes ts-glow {
      0%,100% { text-shadow: 0 0 8px rgba(10,185,230,.7); }
      50%      { text-shadow: 0 0 20px rgba(10,185,230,1), 0 0 32px rgba(10,185,230,.4); }
    }
    .ts-cdglow { animation: ts-glow 2s ease-in-out infinite; }

    .ts-sec-title {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px 12px;
      font-size: 17px;
      font-weight: 900;
      color: #fff;
      letter-spacing: .3px;
    }
    .ts-sec-title::before {
      content: '';
      width: 4px;
      height: 20px;
      border-radius: 3px;
      background: linear-gradient(180deg, #0AB9E6, #7b2ff7);
      flex-shrink: 0;
    }

    .ts-hscroll::-webkit-scrollbar { display: none; }
    .ts-hscroll { scrollbar-width: none; }

    .ts-dot { transition: width .3s ease, background .3s ease; }
    #contenedor-noticias *[onclick],
#contenedor-noticias div[onclick],
#contenedor-noticias .ts-card,
#contenedor-noticias .ts-spotlight,
#contenedor-noticias .ts-news-big,
#contenedor-noticias .ts-news-sm,
#contenedor-noticias .ts-cat {
  -webkit-tap-highlight-color: transparent;
}
  `;
  document.head.appendChild(s);
})();
function getVitrina() {
  if (typeof G === 'undefined') return [];
  const badgeConfig = {
    'Estreno':    { color: '#7b2ff7', label: 'ESTRENO'    },
    'estreno':    { color: '#7b2ff7', label: 'ESTRENO'    },
    'Oferta':     { color: '#ff6a00', label: 'OFERTA'     },
    'oferta':     { color: '#ff6a00', label: 'OFERTA'     },
    'Update':     { color: '#0AB9E6', label: 'UPDATE'     },
    'update':     { color: '#0AB9E6', label: 'UPDATE'     },
    'Nuevo':      { color: '#00b09b', label: 'NUEVO'      },
    'nuevo':      { color: '#00b09b', label: 'NUEVO'      },
    'Uncensored': { color: '#ffcc00', label: 'UNCENSORED' },
    'uncensored': { color: '#ffcc00', label: 'UNCENSORED' },
    'dlc':        { color: '#ff6a00', label: 'DLC'        },
    'DLC':        { color: '#ff6a00', label: 'DLC'        },
    'Demo':       { color: '#e67e22', label: 'DEMO'       },
    'demo':       { color: '#e67e22', label: 'DEMO'       }
};

  return G
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.badge)
    .map(({ g, i }) => ({
      titulo:      g.t,
      descripcion: (g.d || '').substring(0, 110) + '...',
      imagen:      g.c || '',
      col:         g.col || '#1a1a2e',
      indice:      i,
      gameKey:     g.t,
      config:      badgeConfig[g.badge] || { color: '#0AB9E6', label: g.badge.toUpperCase() }
    }));
}
async function obtenerTrailers(pageToken = '') {
  const API_KEY = 'AIzaSyCwaiAlOlmRehnYKijJnbXS--BzMxjpvec';
  const UPLOADS_ID = 'UUGIY_O-8vW4rfX98KlMkvRg';
  const EXCLUIR = ['switch 2', 'nintendo switch 2', 'nswitch2'];

  let apiUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?key=' + API_KEY +
    '&playlistId=' + UPLOADS_ID +
    '&part=snippet&maxResults=12';

  if (pageToken) {
    apiUrl += '&pageToken=' + pageToken;
  }

  try {
    const r = await fetch(apiUrl);
    const d = await r.json();

    if (d.error) {
      console.warn('YouTube API error:', d.error.message);
      return { videos: [], nextPageToken: null };
    }

    if (!d.items || !d.items.length) {
      return { videos: [], nextPageToken: null };
    }

    const videos = d.items
      .filter(v => v.snippet && v.snippet.resourceId && v.snippet.resourceId.videoId)
      .filter(v => !EXCLUIR.some(kw => v.snippet.title.toLowerCase().includes(kw)))
      .map(v => ({
        titulo: v.snippet.title,
        imagen: v.snippet.thumbnails.medium.url,
        url: 'https://www.youtube.com/watch?v=' + v.snippet.resourceId.videoId
      }));

    return {
      videos,
      nextPageToken: d.nextPageToken || null
    };

  } catch (e) {
    console.warn('obtenerTrailers falló:', e);
    return { videos: [], nextPageToken: null };
  }
}
async function fetchRSS(rssUrl, fuente, color) {
  const API = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);

  function extraerImagen(item) {
    return (
      item.thumbnail ||
      item.enclosure?.link ||
      item['media:thumbnail']?.link ||
      item['media:content']?.url ||
      (Array.isArray(item['media:content']) && item['media:content'][0] && item['media:content'][0].url) ||
      (item.description && (item.description.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1]) ||
      (item.content && (item.content.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1]) ||
      ''
    );
  }

  try {
    const r = await fetch(API);
    const d = await r.json();
    if (!d.items) return [];

    return d.items.slice(0, 5).map(item => {
      let imagen = extraerImagen(item);

// mejorar resolución si es posible
if (imagen) {
  // quitar tamaños típicos tipo -150x150
  imagen = imagen.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp))/i, '');

  // algunos sitios usan parámetros de tamaño
  imagen = imagen.replace(/([?&])(w|width|h|height)=\d+/gi, '');
}

      return {
        fuente,
        color,
        titulo: item.title,
        descripcion: (item.description || item.content || '')
          .replace(/<[^>]*>/g, '')
          .substring(0, 100) + '...',
        imagen,
        url: item.link
      };
    });
  } catch (e) {
    return [];
  }
}
async function traducirTexto(texto, from = 'en', to = 'es') {
  if (!texto || !texto.trim()) return texto;

  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
    encodeURIComponent(from) +
    '&tl=' + encodeURIComponent(to) +
    '&dt=t&q=' + encodeURIComponent(texto);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) return texto;
    const d = await r.json();
    if (!Array.isArray(d) || !Array.isArray(d[0])) return texto;
    return d[0].map(parte => parte[0]).join('').trim() || texto;
  } catch (e) {
    return texto;
  }
}

async function traducirNoticiasSiHaceFalta(items) {
  if (!items || !items.length) return items;

  const FUENTES_A_TRADUCIR = ['NINTENDO LIFE', 'NINTENDO EVERYTHING'];

  return Promise.all(items.map(async item => {
    if (!FUENTES_A_TRADUCIR.includes(item.fuente)) return item;

    const [titulo, descripcion] = await Promise.all([
      traducirTexto(item.titulo || ''),
      traducirTexto(item.descripcion || '')
    ]);

    return {
      ...item,
      titulo,
      descripcion
    };
  }));
}
async function obtenerNoticias() {
  const [nintendoEverything, nintendoLife] = await Promise.all([
    fetchRSS('https://nintendoeverything.com/feed/', 'NINTENDO EVERYTHING', '#ff3c41'),
    fetchRSS('https://www.nintendolife.com/feeds/latest', 'NINTENDO LIFE', '#00c853')
  ]);
  const result = [];
  const max = Math.max(nintendoEverything.length, nintendoLife.length);
  for (let i = 0; i < max; i++) {
    if (nintendoEverything[i]) result.push(nintendoEverything[i]);
    if (nintendoLife[i])      result.push(nintendoLife[i]);
  }
 return await traducirNoticiasSiHaceFalta(result);
}
async function obtenerConsolasEnOferta() {
  const url = (typeof SHEET_URL !== 'undefined') ? SHEET_URL : '';
  if (!url) return [];
  try {
    const tsv = (window._consolasData) ? window._consolasData : await fetch(url).then(r=>r.text());
    const rows = tsv.trim().split('\n').slice(1);
    const resultado = [];
    rows.forEach(function(row) {
      const cols = row.split('\u0009');
      const n = (cols[0] || '').trim();
      const p = parseFloat((cols[1] || '').trim());
      const img = (cols[3] || '').trim();
      const precioOferta = parseFloat((cols[6] || '').trim());
      if (!n) return;
      if (isNaN(p) || p <= 0) return;
      if (isNaN(precioOferta) || precioOferta <= 0) return;
      if (precioOferta >= p) return;
      resultado.push({ n: n, p: p, img: img, precioOferta: precioOferta });
    });
    return resultado;
  } catch (e) {
    return [];
  }
}
function normalizarTexto(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function abrirJuegoDesdeSpotlight(gameKey) {
  if (!gameKey) return;

  try {
    sessionStorage.setItem('ts_spotlight_game', gameKey);
  } catch (e) {}

  if (typeof setTab === 'function') {
    setTab('juegos');
  }

  setTimeout(function () {
    intentarAbrirJuegoPendiente();
  }, 120);
}

function intentarAbrirJuegoPendiente(intentos = 0) {
  let gameKey = '';
  try {
    gameKey = sessionStorage.getItem('ts_spotlight_game') || '';
  } catch (e) {}

  if (!gameKey) return;

  const buscado = normalizarTexto(gameKey);

  // Busca en los títulos de las cartas del catálogo (selector específico, no todo el DOM)
  const candidatos = Array.from(document.querySelectorAll('.ctit, .card .ctit'))
    .filter(el => {
      const txt = normalizarTexto(el.textContent || '');
      return txt && txt.includes(buscado);
    });

  if (candidatos.length) {
    const tituloEl = candidatos[0];

    // encuentra la carta clicable más cercana
    const clickable =
      tituloEl.closest('.card') ||
      tituloEl.closest('[onclick]') ||
      tituloEl.closest('article');

    if (clickable) {
      clickable.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(function () {
        clickable.click();

        try {
          sessionStorage.removeItem('ts_spotlight_game');
        } catch (e) {}
      }, 250);

      return;
    }
  }

  // si aún no aparece en DOM, reintenta un poco
  if (intentos < 30) {
    setTimeout(function () {
      intentarAbrirJuegoPendiente(intentos + 1);
    }, 250);
  }
}
function renderVitrina() {
  const items = getVitrina();
  if (!items.length) return '';

  const tarjetas = items.map(v =>
    '<div class="ts-spotlight" onclick="openGameSheet(G.find(j=>j.t===\'' + String(v.titulo).replace(/'/g, "\\'") + '\'))" ' +
    'style="flex:0 0 82%;scroll-snap-align:start;background:#12121f;border-radius:18px;border:1px solid ' + v.config.color + '40;overflow:hidden;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.55)">' +
      '<div style="position:relative;overflow:hidden">' +
        (v.imagen
          ? '<img src="' + v.imagen + '" class="ts-cimg" style="width:100%;height:185px;object-fit:cover;display:block" onerror="this.style.display=\'none\'">'
          : '<div style="width:100%;height:185px;background:' + v.col + ';display:flex;align-items:center;justify-content:center;font-size:52px">🎮</div>'
        ) +
        '<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.85))"></div>' +
        '<span style="position:absolute;top:12px;left:12px;background:' + v.config.color + ';padding:5px 13px;border-radius:20px;font-size:10px;font-weight:900;color:#fff;letter-spacing:1px;box-shadow:0 2px 12px ' + v.config.color + '88">' + v.config.label + '</span>' +
      '</div>' +
      '<div style="padding:14px 16px 16px">' +
        '<div style="font-size:15px;font-weight:900;color:#fff;margin-bottom:6px">' + v.titulo + '</div>' +
        '<div style="font-size:12px;color:#bbb;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + v.descripcion + '</div>' +
        '<div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between">' +
          '<span style="font-size:11px;font-weight:800;color:' + v.config.color + '">Ver en catálogo →</span>' +
          '<span style="font-size:10px;color:#555;background:rgba(255,255,255,.06);padding:3px 9px;border-radius:10px;border:1px solid rgba(255,255,255,.08)">Nintendo Switch</span>' +
        '</div>' +
      '</div>' +
    '</div>'
  ).join('');

  return '<section style="margin-bottom:32px">' +
    '<div class="ts-sec-title">Spotlight TS 🔥</div>' +
    '<div id="spotlight-scroll" class="ts-hscroll" style="display:flex;gap:14px;overflow-x:auto;padding:0 16px 12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">' +
      tarjetas +
    '</div>' +
    '<div id="spotlight-dots" style="display:flex;justify-content:center;gap:6px;padding-top:8px"></div>' +
  '</section>';
}
function renderVideos(videos) {
  if (!videos.length) return '';

  const tarjetas = videos.map(v =>
    '<div onclick="window.open(\'' + v.url + '\',\'_blank\')" style="flex:0 0 155px;scroll-snap-align:start;cursor:pointer">' +
      '<div class="ts-card" style="border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#12121f;position:relative">' +
        '<img src="' + v.imagen + '" class="ts-cimg" style="width:155px;height:155px;object-fit:cover;display:block" onerror="this.style.background=\'#1a1a2e\'">' +
        '<div style="position:absolute;inset:0;background:rgba(0,0,0,.18)"></div>' +
        '<div class="ts-play" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;background:rgba(220,0,0,.92);border-radius:50%;display:flex;align-items:center;justify-content:center">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>' +
        '</div>' +
        '<span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);padding:3px 8px;border-radius:10px;font-size:9px;font-weight:800;color:#0AB9E6;letter-spacing:.5px;border:1px solid rgba(10,185,230,.3)">▶ TRÁILER</span>' +
      '</div>' +
      '<div style="font-size:11px;color:#bbb;margin-top:8px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + v.titulo + '</div>' +
    '</div>'
  ).join('');

  return '<section style="margin-bottom:32px">' +
    '<div class="ts-sec-title">Sneak Peeks 🎬</div>' +
    '<div id="trailers-scroll" class="ts-hscroll" style="display:flex;gap:12px;overflow-x:auto;padding:0 16px 12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">' +
      tarjetas +
    '</div>' +
  '</section>';
}

function renderNoticias(items) {
  if (!items.length) return '<section style="margin-bottom:32px"><div class="ts-sec-title">TS Dispatch 📰</div><p style="padding:0 16px;font-size:13px;color:#555">Sin noticias disponibles.</p></section>';

  let html = '';

  for (let i = 0; i < items.length; i += 3) {
    const main = items[i];
    const subs = items.slice(i + 1, i + 3);

    html += '<div style="display:flex;gap:10px;padding:0 16px;margin-bottom:10px">';

    if (main) {
      html += '<div class="ts-news-big" onclick="window.open(\'' + main.url + '\',\'_blank\')" ' +
        'style="flex:1.2;background:#12121f;border-radius:14px;overflow:hidden;cursor:pointer;border:1px solid rgba(255,255,255,.07);box-shadow:0 4px 18px rgba(0,0,0,.4)">' +
        (main.imagen
          ? '<div style="overflow:hidden;border-radius:14px 14px 0 0"><img src="' + main.imagen + '" class="ts-cimg" style="width:100%;height:130px;object-fit:cover;display:block" onerror="this.style.display=\'none\'"></div>'
          : '<div style="width:100%;height:60px;background:#0d0d1a"></div>'
        ) +
        '<div style="padding:12px">' +
          '<span style="color:' + main.color + ';font-size:9px;font-weight:900;letter-spacing:1.5px">' + main.fuente + '</span>' +
          '<div style="font-size:12px;font-weight:800;color:#fff;margin:5px 0;line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">' + main.titulo + '</div>' +
          '<div style="font-size:10px;color:#666;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + main.descripcion + '</div>' +
        '</div>' +
      '</div>';
    }

    if (subs.length) {
      html += '<div style="flex:0.9;display:flex;flex-direction:column;gap:10px">';
      subs.forEach(s => {
        html += '<div class="ts-news-sm" onclick="window.open(\'' + s.url + '\',\'_blank\')" ' +
          'style="flex:1;background:#12121f;border-radius:12px;overflow:hidden;cursor:pointer;border:1px solid rgba(255,255,255,.07);box-shadow:0 4px 12px rgba(0,0,0,.35)">' +
          (s.imagen
            ? '<div style="overflow:hidden;border-radius:12px 12px 0 0"><img src="' + s.imagen + '" class="ts-cimg" style="width:100%;height:65px;object-fit:cover;display:block" onerror="this.style.display=\'none\'"></div>'
            : '<div style="width:100%;height:35px;background:#0d0d1a"></div>'
          ) +
          '<div style="padding:8px">' +
            '<span style="color:' + s.color + ';font-size:8px;font-weight:900;letter-spacing:1px">' + s.fuente + '</span>' +
            '<div style="font-size:10px;font-weight:700;color:#ddd;margin-top:3px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + s.titulo + '</div>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
  }

  return '<section style="margin-bottom:32px">' +
    '<div class="ts-sec-title">TS Dispatch 📰</div>' +
    html +
  '</section>';
}
function renderTopCharts() {
  if (typeof G === 'undefined' || !G.length) return '';

  const top = [...G].sort((a, b) => b.r - a.r).slice(0, 10);
  const medals = ['🥇', '🥈', '🥉'];

  const tarjetas = top.map((g, i) => {
    const sn = g.t.replace(/'/g, "\\'");
    const badge = i < 3
      ? '<span style="position:absolute;top:7px;left:7px;font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.7))">' + medals[i] + '</span>'
      : '<span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);padding:3px 8px;border-radius:9px;font-size:10px;font-weight:900;color:#fff;border:1px solid rgba(255,255,255,.15)">#' + (i + 1) + '</span>';

    return '<div class="ts-card" onclick="openGameSheet(G.find(x=>x.t===\'' + sn + '\'))" ' +
      'style="flex:0 0 118px;scroll-snap-align:start;border-radius:14px;overflow:hidden;background:#12121f;border:1px solid rgba(255,255,255,.07);box-shadow:0 4px 18px rgba(0,0,0,.45);cursor:pointer">' +
      '<div style="position:relative;overflow:hidden">' +
        '<img src="' + (g.c || '') + '" class="ts-cimg" style="width:118px;height:158px;object-fit:cover;display:block" onerror="this.style.background=\'' + (g.col || '#1a1a2e') + '\'">' +
        badge +
        '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.85));padding:6px 7px">' +
          '<div style="font-size:9px;color:#FFD700;font-weight:800">⭐ ' + g.r + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:8px">' +
        '<div style="font-size:10px;font-weight:700;color:#fff;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + g.t + '</div>' +
        '<div style="font-size:9px;color:#555;margin-top:3px">' + g.g + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<section style="margin-bottom:32px">' +
    '<div class="ts-sec-title">Top Charts TS 🏆</div>' +
    '<div class="ts-hscroll" style="display:flex;gap:10px;overflow-x:auto;padding:0 16px 12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">' +
      tarjetas +
    '</div>' +
  '</section>';
}
function renderProximosLanzamientos() {
  if (typeof G === 'undefined') return '';
  const estrenos = G.filter(g => g.badge === 'Estreno');
  if (!estrenos.length) return '';

  const tarjetas = estrenos.map(g => {
    const sn = g.t.replace(/'/g, "\\'");
    return '<div class="ts-card" onclick="openGameSheet(G.find(x=>x.t===\'' + sn + '\'))" ' +
      'style="flex:0 0 152px;scroll-snap-align:start;border-radius:16px;overflow:hidden;background:#12121f;border:1px solid rgba(123,47,247,.3);box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer">' +
      '<div style="position:relative;overflow:hidden">' +
        '<img src="' + (g.c || '') + '" class="ts-cimg" style="width:152px;height:152px;object-fit:cover;display:block" onerror="this.style.background=\'' + (g.col || '#1a1a2e') + '\'">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.8))"></div>' +
        '<span style="position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#7b2ff7,#f107a3);padding:4px 10px;border-radius:12px;font-size:9px;font-weight:900;color:#fff;letter-spacing:.5px;box-shadow:0 2px 10px rgba(123,47,247,.55)">✨ ESTRENO</span>' +
      '</div>' +
     '<div style="padding:10px 10px 12px">' +
  '<div style="font-size:10px;font-weight:700;color:#fff;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + g.t + '</div>' +
'</div>' +
      '</div>';
  }).join('');

  return '<section style="margin-bottom:32px">' +
    '<div class="ts-sec-title">Recién Llegados 🚀</div>' +
    '<div class="ts-hscroll" style="display:flex;gap:12px;overflow-x:auto;padding:0 16px 12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">' +
      tarjetas +
    '</div>' +
  '</section>';
}
function renderConsolasOfertas(consolasOferta) {
  if (!consolasOferta || !consolasOferta.length) {
    return '<section style="margin-bottom:32px">' +
      '<div class="ts-sec-title">Consolas en Oferta TS 🏷️</div>' +
      '<div style="padding:0 16px">' +
        '<div style="background:rgba(255,106,0,.07);border:1px dashed rgba(255,106,0,.3);border-radius:16px;padding:28px 20px;text-align:center">' +
          '<div style="font-size:32px;margin-bottom:8px">🏷️</div>' +
          '<div style="font-size:13px;font-weight:800;color:#ff6a00;margin-bottom:5px">Ofertas en camino</div>' +
          '<div style="font-size:11px;color:#555;line-height:1.6">Las mejores deals están por llegar.<br>¡Mantente atento!</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  const tarjetas = consolasOferta.map(function(c) {
    const desc = Math.round((1 - c.precioOferta / c.p) * 100);
    const imgSrc = c.img ? c.img.split('|')[0] : '';
    return '<div class="ts-card" ' +
      'style="border-radius:14px;overflow:hidden;background:#12121f;border:1px solid rgba(255,106,0,.25);box-shadow:0 4px 18px rgba(0,0,0,.45);cursor:pointer;position:relative">' +
      '<span style="position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#ff0055,#ff6a00);color:#fff;font-size:11px;font-weight:900;padding:4px 10px;border-radius:12px;z-index:2;box-shadow:0 2px 10px rgba(255,0,85,.45)">-' + desc + '%</span>' +
      '<div style="overflow:hidden">' +
        (imgSrc
          ? '<img src="' + imgSrc + '" class="ts-cimg" style="width:100%;height:115px;object-fit:cover;display:block" onerror="this.style.background=\'#1a1a2e\'">'
          : '<div style="width:100%;height:115px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:40px">🕹️</div>'
        ) +
      '</div>' +
      '<div style="padding:10px">' +
        '<div style="font-size:11px;font-weight:700;color:#fff;line-height:1.35;margin-bottom:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + c.n + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:11px;color:#444;text-decoration:line-through">' + c.p + ' USD</span>' +
          '<span style="font-size:14px;font-weight:900;color:#ff6a00">' + c.precioOferta + ' USD</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<section style="margin-bottom:32px">' +
    '<div class="ts-sec-title">Consolas en Oferta TS 🏷️</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px;padding:0 16px">' +
      tarjetas +
    '</div>' +
  '</section>';
}
function irAGenero(genero) {
  if (typeof setTab === 'function') setTab('juegos');
  setTimeout(() => {
    document.querySelectorAll('#gbar .gb').forEach(b => {
      if (b.textContent.trim() === genero) b.click();
    });
  }, 150);
}

function renderCategorias() {
  if (typeof G === 'undefined' || !G.length) return '';

  const genreConfig = {
    'Acción':              { icon: '⚔️',  color: '#e63946', bg: 'rgba(230,57,70,.12)'  },
    'Acción/Aventura':     { icon: '🗡️',  color: '#e07020', bg: 'rgba(224,112,32,.12)' },
    'Acción/Party':        { icon: '🎉',  color: '#f4a261', bg: 'rgba(244,162,97,.12)' },
    'Acción/Mundo Abierto':{ icon: '🌍',  color: '#2d6a4f', bg: 'rgba(45,106,79,.14)'  },
    'Acción/Arcade':       { icon: '👾',  color: '#0AB9E6', bg: 'rgba(10,185,230,.12)' },
    'Aventura':            { icon: '🗺️',  color: '#52b788', bg: 'rgba(82,183,136,.12)' },
    'Aventura/Terror':     { icon: '👻',  color: '#8b0000', bg: 'rgba(139,0,0,.18)'    },
    'Aventura/Plataformas':{ icon: '🌟',  color: '#e9c46a', bg: 'rgba(233,196,106,.12)'},
    'RPG':                 { icon: '🧙',  color: '#7b2ff7', bg: 'rgba(123,47,247,.14)' },
    'RPG/Aventura':        { icon: '📖',  color: '#9b59b6', bg: 'rgba(155,89,182,.14)' },
    'RPG/Estrategia':      { icon: '⚗️',  color: '#8e44ad', bg: 'rgba(142,68,173,.14)' },
    'RPG/Deportes':        { icon: '🏆',  color: '#f1c40f', bg: 'rgba(241,196,15,.12)' },
    'Plataformas':         { icon: '🎮',  color: '#e9822c', bg: 'rgba(233,130,44,.12)' },
    'Shooter':             { icon: '🎯',  color: '#c1121f', bg: 'rgba(193,18,31,.14)'  },
    'Simulación':          { icon: '🏙️',  color: '#3d8bcd', bg: 'rgba(61,139,205,.12)' },
    'Simulación/Granja':   { icon: '🌾',  color: '#52b788', bg: 'rgba(82,183,136,.12)' },
    'Estrategia':          { icon: '♟️',  color: '#2d6a4f', bg: 'rgba(45,106,79,.14)'  },
    'Deportes':            { icon: '⚽',  color: '#1d6fa0', bg: 'rgba(2,62,138,.18)'   },
    'Carreras':            { icon: '🏎️',  color: '#e63946', bg: 'rgba(230,57,70,.12)'  },
    'Multijugador':        { icon: '👥',  color: '#0AB9E6', bg: 'rgba(10,185,230,.12)' },
    'Terror':              { icon: '💀',  color: '#6b0f1a', bg: 'rgba(107,15,26,.22)'  },
    'Pelea':               { icon: '🥊',  color: '#e63946', bg: 'rgba(230,57,70,.12)'  },
    'Puzzle':              { icon: '🧩',  color: '#3d8bcd', bg: 'rgba(61,139,205,.12)' },
    'Puzles/Romance':      { icon: '💕',  color: '#ff69b4', bg: 'rgba(255,105,180,.12)'},
    'Supervivencia':       { icon: '🏕️',  color: '#5c8a3c', bg: 'rgba(92,138,60,.14)'  },
    'Roguelike/Acción':    { icon: '🎲',  color: '#7b2ff7', bg: 'rgba(123,47,247,.14)' }
  };

  const genres = [...new Set(G.map(g => g.g))].sort();

  const tarjetas = genres.map(genre => {
    const cfg = genreConfig[genre] || { icon: '🎮', color: '#0AB9E6', bg: 'rgba(10,185,230,.10)' };
    const count = G.filter(g => g.g === genre).length;
    const sGenre = genre.replace(/'/g, "\\'");
    return '<div class="ts-cat" onclick="irAGenero(\'' + sGenre + '\')" ' +
      'style="background:' + cfg.bg + ';border:1px solid ' + cfg.color + '30;border-radius:16px;padding:16px 8px;text-align:center">' +
      '<div style="font-size:26px;margin-bottom:7px;line-height:1">' + cfg.icon + '</div>' +
      '<div style="font-size:10px;font-weight:800;color:#fff;line-height:1.3;margin-bottom:4px">' + genre + '</div>' +
      '<div style="font-size:9px;font-weight:700;color:' + cfg.color + '">' + count + ' juego' + (count !== 1 ? 's' : '') + '</div>' +
    '</div>';
  }).join('');

  return '<section style="margin-bottom:40px">' +
    '<div class="ts-sec-title">Explorar por Género 🎯</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;padding:0 16px">' +
      tarjetas +
    '</div>' +
  '</section>';
}

let _noticiasYaCargadas = false;
let _trailersVideos = [];
let _trailersNextPageToken = null;
let _trailersCargando = false;
let _trailersScrollInicializado = false;

function appendVideos(videos) {
  const cont = document.getElementById('trailers-scroll');
  if (!cont || !videos || !videos.length) return;

  const html = videos.map(v =>
  '<div onclick="window.open(\'' + v.url + '\',\'_blank\')" style="flex:0 0 148px;scroll-snap-align:start;cursor:pointer">' +
  '<div class="ts-card" style="position:relative;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#12121f">' +
  '<img src="' + v.imagen + '" class="ts-cimg" style="width:148px;height:148px;object-fit:cover;display:block" onerror="this.style.background=\'#1a1a2e\'">' +
  '<div style="position:absolute;inset:0;background:rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center">' +
  '<div class="ts-play" style="width:40px;height:40px;background:rgba(220,0,0,.92);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.5);position:relative;overflow:hidden">' +
  '<span style="color:#fff;font-size:16px;margin-left:4px">▶</span></div></div></div>' +
  '<div style="font-size:11px;color:#ccc;margin-top:7px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + v.titulo + '</div></div>'
).join('');

  cont.insertAdjacentHTML('beforeend', html);
}

async function cargarMasTrailers() {
  if (_trailersCargando || !_trailersNextPageToken) return;

  _trailersCargando = true;

  try {
    const data = await obtenerTrailers(_trailersNextPageToken);
    if (data.videos && data.videos.length) {
      _trailersVideos = _trailersVideos.concat(data.videos);
      appendVideos(data.videos);
    }
    _trailersNextPageToken = data.nextPageToken || null;
  } catch (e) {
    console.warn('cargarMasTrailers falló:', e);
  } finally {
    _trailersCargando = false;
  }
}

function initScrollTrailers() {
  if (_trailersScrollInicializado) return;

  const cont = document.getElementById('trailers-scroll');
  if (!cont) return;

  _trailersScrollInicializado = true;

  cont.addEventListener('scroll', function () {
    const restante = cont.scrollWidth - cont.scrollLeft - cont.clientWidth;
    if (restante < 250) {
      cargarMasTrailers();
    }
  }, { passive: true });
}

let _trailersPlayDelegationInicializada = false;

function initTrailerPlayEffects() {
  if (_trailersPlayDelegationInicializada) return;

  document.addEventListener('click', function (e) {
    const play = e.target.closest('#trailers-scroll .ts-play');
    if (!play) return;

    const rect = play.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.position = 'absolute';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.background = 'rgba(255,255,255,.35)';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    ripple.style.transition = 'transform .45s ease, opacity .55s ease';

    play.appendChild(ripple);

    requestAnimationFrame(function () {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });

    setTimeout(function () {
      ripple.remove();
    }, 600);
  }, true);

  _trailersPlayDelegationInicializada = true;
}
async function cargarNoticias() {
  if (_noticiasYaCargadas) return;

  const contenedor = document.getElementById('contenedor-noticias');
  if (!contenedor) return;

  _noticiasYaCargadas = true;
  contenedor.innerHTML = '<div style="text-align:center;padding:50px 20px;color:#555;font-size:14px">⏳ Cargando...</div>';

 const [trailersData, noticias, consolasOferta] = await Promise.all([
    obtenerTrailers(),
    obtenerNoticias(),
    obtenerConsolasEnOferta()
  ]);

  _trailersVideos = trailersData.videos || [];
  _trailersNextPageToken = trailersData.nextPageToken || null;

  contenedor.innerHTML =
    renderVitrina() +
    renderVideos(_trailersVideos) +
    renderNoticias(noticias) +
    renderTopCharts() +
    renderProximosLanzamientos() +
    renderConsolasOfertas(consolasOferta) +
    renderCategorias();

  initAutoScrollSpotlightPro(5500);
  initScrollTrailers();
  initTrailerPlayEffects();
}

function initAutoScrollSpotlightPro(interval = 5500) {
  const cont = document.getElementById('spotlight-scroll');
  if (!cont) return;

  const tarjetas = Array.from(cont.children);
  if (!tarjetas.length) return;

  const dotsContainer = document.getElementById('spotlight-dots');
  let index = 0;
  let isPaused = false;
  let timer = null;

  if (dotsContainer) {
    tarjetas.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'ts-dot';
      d.style.cssText = 'height:6px;border-radius:3px;cursor:pointer;background:' +
        (i === 0 ? '#0AB9E6' : 'rgba(255,255,255,.2)') + ';width:' + (i === 0 ? '18px' : '6px');
      d.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(d);
    });
  }

  function updateDots() {
    if (!dotsContainer) return;
    Array.from(dotsContainer.children).forEach((d, i) => {
      d.style.width = i === index ? '18px' : '6px';
      d.style.background = i === index ? '#0AB9E6' : 'rgba(255,255,255,.2)';
    });
  }

  function goTo(n) {
    index = (n + tarjetas.length) % tarjetas.length;
    cont.scrollTo({ left: tarjetas[index].offsetLeft - cont.offsetLeft, behavior: 'smooth' });
    updateDots();
  }

  function tick() { if (!isPaused) goTo(index + 1); }

  function start() { clearInterval(timer); timer = setInterval(tick, interval); }

  cont.addEventListener('mouseenter', () => { isPaused = true; });
  cont.addEventListener('mouseleave', () => { isPaused = false; });
  cont.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
  cont.addEventListener('touchend',   () => { setTimeout(() => { isPaused = false; }, 2500); }, { passive: true });

  start();
}

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var sec = document.getElementById('sec-noticias');
    if (!sec) return;

    var observer = new MutationObserver(function () {
      if (sec.style.display !== 'none') cargarNoticias();
    });

    observer.observe(sec, { attributes: true, attributeFilter: ['style'] });

    intentarAbrirJuegoPendiente();
  });
})();
