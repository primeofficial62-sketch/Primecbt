/* PRIME-CBT shared navigation.
   Mobile (<1024px): bottom nav + "More" sheet.  Desktop (>=1024px): hamburger button + slide-in drawer.
   Same links and order as home.html. Add to any page with:
     <link rel="stylesheet" href="nav.css">   (in <head>)
     <script src="nav.js" defer></script>     (before </body>)
   Optional <body> attributes:
     data-nav="off"                 no nav at all (exam, results, reader)
     data-bottom-nav="off"          no bottom nav on mobile (hamburger still works on desktop)
     data-nav-parent="progress.html" highlight this item for sub-pages (e.g. achievements) */
(() => {
  'use strict';
  const b = document.body;
  if (!b || b.dataset.nav === 'off' || document.getElementById('pnDrawer')) return;

  const SUPABASE_URL = 'https://xuofkjjhupgmrphzgyun.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
  const LOGIN_PAGE = 'auth.html';
  const SUPPORT_FALLBACK = 'home.html#support';   // used only if the page has no support handler

  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
    materials: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M2 5a1 1 0 011-1h5a4 4 0 014 4v12a3 3 0 00-3-3H3a1 1 0 01-1-1zM22 5a1 1 0 00-1-1h-5a4 4 0 00-4 4v12a3 3 0 013-3h6a1 1 0 001-1z"/></svg>',
    practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 14l2 2 4-4"/></svg>',
    progress: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="18" rx="1"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
    community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4H8M2 14h2M20 14h2M9 13v2M15 13v2"/></svg>',
    support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
  };

  const BOTTOM = [['home.html', 'Home', I.home], ['materials.html', 'Materials', I.materials], ['practice.html', 'Practice', I.practice], ['progress.html', 'Progress', I.progress]];
  const MORE = [['profile.html', 'Profile', I.profile], ['community.html', 'Community', I.community], ['ai-assistant.html', 'AI Assistant', I.ai]];
  const SIDE = [['home.html', 'Home'], ['practice.html', 'Practice'], ['community.html', 'Community'], ['progress.html', 'Progress'], ['materials.html', 'Materials'], ['my-study-plan.html', 'Study Plan'], ['ai-assistant.html', 'AI Assistant'], ['profile.html', 'Profile']];

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const cur = (b.dataset.navParent || here).toLowerCase();
  const act = (h) => (h === cur ? ' is-active' : '');
  const cp = (h) => (h === cur ? ' aria-current="page"' : '');
  const moreActive = MORE.some((m) => m[0] === cur);
  const wantBottom = b.dataset.bottomNav !== 'off';

  /* ---------- build markup ---------- */
  const bottom = !wantBottom ? '' : `
    <nav class="pn-bottom" aria-label="Main">
      ${BOTTOM.map(([h, t, ic]) => `<a href="${h}" class="pn-item${act(h)}"${cp(h)}>${ic}<span>${t}</span></a>`).join('')}
      <button type="button" class="pn-item${moreActive ? ' is-active' : ''}" id="pnMoreBtn" aria-haspopup="dialog">${I.more}<span>More</span></button>
    </nav>
    <div class="pn-sheet-wrap" id="pnSheet" hidden>
      <div class="pn-sheet" role="dialog" aria-modal="true" aria-label="More">
        <div class="pn-sheet-head"><b>More</b><button type="button" class="pn-close" id="pnMoreClose">Close</button></div>
        <div class="pn-grid">
          ${MORE.map(([h, t, ic]) => `<a href="${h}" class="pn-tile${act(h)}"${cp(h)}>${ic}${t}</a>`).join('')}
          <button type="button" class="pn-tile" id="pnSupportTile">${I.support}Support &amp; Review</button>
          <button type="button" class="pn-tile is-danger" id="pnLogoutTile">${I.logout}Log out</button>
        </div>
      </div>
    </div>`;

  const drawer = `
    <div class="pn-backdrop pn-backdrop--drawer" id="pnBackdrop" hidden></div>
    <nav class="pn-drawer" id="pnDrawer" aria-label="Sidebar">
      <div class="pn-drawer-head">
        <div class="pn-avatar" id="pnAvatar">?</div>
        <div style="min-width:0"><div class="pn-uname" id="pnName">Student</div><div class="pn-usub" id="pnSub"></div></div>
      </div>
      <ul class="pn-list">
        ${SIDE.map(([h, t]) => `<li><a href="${h}" class="pn-link${act(h)}"${cp(h)}>${t}</a></li>`).join('')}
        <li><button type="button" class="pn-link" id="pnSupportBtn">Support &amp; Review</button></li>
      </ul>
      <button type="button" class="pn-link pn-logout" id="pnLogoutBtn">Log out</button>
    </nav>`;

  const holder = document.createElement('div');
  holder.innerHTML = bottom + drawer;
  while (holder.firstChild) b.appendChild(holder.firstChild);
  if (wantBottom) b.classList.add('pn-has-bottom');

  const $ = (id) => document.getElementById(id);
  const drawerEl = $('pnDrawer'), backdrop = $('pnBackdrop');

  /* ---------- hamburger button (replaces the back button on desktop) ---------- */
  const burger = document.createElement('button');
  burger.type = 'button'; burger.className = 'pn-burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-controls', 'pnDrawer');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = I.burger;

  const back = document.querySelector('header .icon-btn[aria-label^="Back"], header .icon-btn[aria-label="Go back"], header [data-back]');
  const header = document.querySelector('header');
  if (back && back.parentNode) {
    back.classList.add('pn-back');
    back.parentNode.insertBefore(burger, back);
  } else if (header && header.firstElementChild) {
    header.firstElementChild.insertBefore(burger, header.firstElementChild.firstChild);
  } else {
    burger.classList.add('pn-burger--float');
    b.appendChild(burger);
  }

  /* ---------- open / close ---------- */
  const desktop = window.matchMedia('(min-width:1024px)');
  function setDrawer(open) {
    if (open === drawerEl.classList.contains('is-open')) return;
    drawerEl.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('pn-lock', open);
    if (open) { const first = drawerEl.querySelector('a,button'); if (first) first.focus(); }
    else burger.focus();
  }
  burger.addEventListener('click', () => setDrawer(!drawerEl.classList.contains('is-open')));
  backdrop.addEventListener('click', () => setDrawer(false));
  drawerEl.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });

  const sheet = $('pnSheet');
  function setSheet(open) {
    if (!sheet) return;
    sheet.hidden = !open;
    document.documentElement.classList.toggle('pn-lock', open);
    if (open) { const first = sheet.querySelector('a,button'); if (first) first.focus(); }
    else { const m = $('pnMoreBtn'); if (m) m.focus(); }
  }
  if (sheet) {
    $('pnMoreBtn').addEventListener('click', () => setSheet(true));
    $('pnMoreClose').addEventListener('click', () => setSheet(false));
    sheet.addEventListener('click', (e) => { if (e.target === sheet) setSheet(false); });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drawerEl.classList.contains('is-open')) setDrawer(false);
    else if (sheet && !sheet.hidden) setSheet(false);
  });
  const onChange = () => { if (desktop.matches) setSheet(false); else setDrawer(false); };
  (desktop.addEventListener ? desktop.addEventListener('change', onChange) : desktop.addListener(onChange));

  /* ---------- support + logout ---------- */
  function support() {
    setDrawer(false); setSheet(false);
    const ev = new CustomEvent('prime:support', { cancelable: true });
    if (!document.dispatchEvent(ev)) return;                       // page handled it
    if (typeof window.openSupport === 'function') return window.openSupport();
    location.href = SUPPORT_FALLBACK;
  }
  async function logout() {
    try { localStorage.removeItem('pcbt_snap'); } catch (_) {}   // same as home's log out
    try {
      if (window.supabase) {
        const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        await db.auth.signOut();
      }
    } catch (err) { console.error('[nav] sign out failed:', err); }
    location.replace(`${LOGIN_PAGE}?mode=login`);
  }
  [['pnSupportBtn', support], ['pnSupportTile', support], ['pnLogoutBtn', logout], ['pnLogoutTile', logout]]
    .forEach(([id, fn]) => { const n = $(id); if (n) n.addEventListener('click', fn); });

  /* ---------- who is signed in (read from the saved session, no extra network call) ---------- */
  try {
    const raw = localStorage.getItem('sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
    const s = raw && JSON.parse(raw);
    const u = s && (s.user || (s.currentSession && s.currentSession.user));
    if (u) {
      const m = u.user_metadata || {};
      const name = m.full_name || m.name || (u.email ? u.email.split('@')[0] : 'Student');
      const parts = name.trim().split(/\s+/).filter(Boolean);
      $('pnName').textContent = name;
      $('pnSub').textContent = u.email || '';
      $('pnAvatar').textContent = ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    }
  } catch (_) { /* leave defaults */ }
})();
