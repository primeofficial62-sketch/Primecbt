/*!
 * PRIME-CBT profile reminder
 *
 * Shows a banner to signed-in users whose profile is missing a college,
 * department or WhatsApp number. "Complete profile" opens a small form,
 * saves to the `profiles` table (and the sign-in metadata), and the banner
 * never shows again for that user.
 *
 * Use: add this ONE line before </body> on every page where users are signed in
 * (home, dashboard, practice, profile ...):
 *
 *     <script src="profile-reminder.js" defer></script>
 *
 * It reuses the page's own Supabase client when it can find one
 * (supabaseClient / sb / supabase), otherwise it makes its own.
 * It skips auth.html, profile-setup.html and legal.html automatically.
 * To switch it off on a particular page: window.PROFILE_REMINDER_OFF = true;
 */
(function () {
  'use strict';

  if (window.__pcProfileReminder || window.PROFILE_REMINDER_OFF) return;
  window.__pcProfileReminder = true;
  if (/(^|\/)(auth|profile-setup|legal)\.html$/i.test(location.pathname)) return;

  const SUPABASE_URL = 'https://xuofkjjhupgmrphzgyun.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
  const SUPABASE_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  const FUNAAB_SCHOOL = 'Federal University of Agriculture, Abeokuta';
  const DISMISS_KEY = 'pc_profile_reminder_dismissed'; // per browser session: "Not now" hides it until next visit

  const empty = (v) => !v || !String(v).trim();

  // ---------- WhatsApp number -> international format (08012345678 -> +2348012345678) ----------
  function normalizeWhatsapp(raw) {
    let s = String(raw || '').trim().replace(/[\s\-().]/g, '');
    if (!s) return null;
    if (s.startsWith('00')) s = '+' + s.slice(2);
    if (s.startsWith('+')) {
      s = '+' + s.slice(1).replace(/\D/g, '');
      s = s.replace(/^\+2340/, '+234');
    } else {
      s = s.replace(/\D/g, '');
      if (/^0\d{10}$/.test(s)) s = '+234' + s.slice(1);
      else if (/^234\d{10}$/.test(s)) s = '+' + s;
      else if (/^[789]\d{9}$/.test(s)) s = '+234' + s;
      else return null;
    }
    return /^\+\d{10,15}$/.test(s) ? s : null;
  }

  // ---------- Supabase client ----------
  function findClient() {
    let c = null;
    try { if (typeof supabaseClient !== 'undefined') c = supabaseClient; } catch (e) {}
    if (!c) { try { if (typeof sb !== 'undefined') c = sb; } catch (e) {} }
    if (!c) { try { if (typeof supabase !== 'undefined' && typeof supabase.from === 'function') c = supabase; } catch (e) {} }
    if (!c) c = window.supabaseClient || window.sb || null;
    return c && c.auth && typeof c.from === 'function' ? c : null;
  }

  function getClient() {
    return new Promise((resolve) => {
      const found = findClient();
      if (found) return resolve(found);
      const make = () => {
        try { resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)); } catch (e) { resolve(null); }
      };
      if (window.supabase && window.supabase.createClient) return make();
      const s = document.createElement('script');
      s.src = SUPABASE_LIB;
      s.onload = make;
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  // ---------- Colleges and departments (public tables) ----------
  async function loadAcademics(db) {
    const [c, d] = await Promise.all([
      db.from('colleges').select('id,name,sort_order').eq('is_active', true),
      db.from('departments').select('name,college_id,sort_order').eq('is_active', true)
    ]);
    if (c.error || d.error || !c.data || !c.data.length) throw (c.error || d.error || new Error('empty'));
    const bySort = (a, b) => ((a.sort_order ?? 999) - (b.sort_order ?? 999)) || a.name.localeCompare(b.name);
    return c.data.slice().sort(bySort)
      .map((col) => ({
        name: col.name,
        departments: d.data.filter((x) => x.college_id === col.id).sort(bySort).map((x) => x.name)
      }))
      .filter((col) => col.departments.length);
  }

  // ---------- Styles ----------
  const CSS = `
.pcpr-banner{position:fixed;z-index:9998;left:50%;top:calc(env(safe-area-inset-top,0px) + 10px);transform:translateX(-50%);width:calc(100% - 24px);max-width:560px;display:flex;align-items:center;gap:12px 14px;flex-wrap:wrap;padding:14px 16px;background:linear-gradient(160deg,#15233C,#0D1627);border:1px solid rgba(49,211,162,.3);border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.35);color:#F4F6FC;font:500 14px/1.4 'Inter',system-ui,sans-serif;animation:pcprDrop .3s cubic-bezier(.2,.8,.2,1) both}
.pcpr-banner__text{flex:1 1 220px;min-width:0}
.pcpr-banner__title{font-weight:700;font-size:15px}
.pcpr-banner__sub{margin-top:2px;color:#9BA8BE;font-size:13px}
.pcpr-banner__actions{display:flex;align-items:center;gap:6px;flex:0 0 auto}
@media (max-width:420px){.pcpr-banner__actions{width:100%}.pcpr-banner__actions .pcpr-btn{flex:1}}
.pcpr-btn{min-height:44px;padding:0 18px;border:0;border-radius:999px;background:#31D3A2;color:#070D1C;font:700 15px 'Inter',system-ui,sans-serif;cursor:pointer;transition:background-color .2s ease}
.pcpr-btn:hover{background:#4BE0B5}
.pcpr-btn:active{background:#27B98D}
.pcpr-btn:disabled{opacity:.6;cursor:not-allowed}
.pcpr-btn--block{width:100%;min-height:54px;margin-top:6px}
.pcpr-link{min-height:44px;padding:0 12px;border:0;background:none;color:#9BA8BE;font:500 14px 'Inter',system-ui,sans-serif;cursor:pointer}
.pcpr-link:hover{color:#F4F6FC}
.pcpr-link--center{display:block;margin:2px auto 0}
.pcpr-banner :focus-visible,.pcpr-sheet :focus-visible{outline:2px solid #31D3A2;outline-offset:2px}

.pcpr-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;background:rgba(3,7,15,.62);animation:pcprFade .2s ease both}
.pcpr-sheet{width:100%;max-width:520px;max-height:92vh;max-height:92dvh;overflow:auto;padding:26px 20px calc(22px + env(safe-area-inset-bottom,0px));background:linear-gradient(160deg,#15233C,#0D1627);border:1px solid rgba(49,211,162,.3);border-bottom:0;border-radius:26px 26px 0 0;color:#F4F6FC;font:400 15px/1.5 'Inter',system-ui,sans-serif;animation:pcprUp .28s cubic-bezier(.2,.8,.2,1) both}
@media (min-width:600px){.pcpr-overlay{align-items:center;padding:20px}.pcpr-sheet{padding:30px 32px 28px;border-bottom:1px solid rgba(49,211,162,.3);border-radius:26px}}
.pcpr-h{margin:0 0 6px;font:700 24px/1.2 'Lora',Georgia,serif;color:#F4F6FC}
.pcpr-lead{margin:0 0 20px;color:#9BA8BE;font-size:14px}
.pcpr-form{display:flex;flex-direction:column;gap:16px}
.pcpr-field{display:flex;flex-direction:column;gap:7px;font-size:14px;font-weight:500;color:#F4F6FC}
.pcpr-field small{color:#9BA8BE;font-size:13px;font-weight:400}
.pcpr-field select,.pcpr-field input{width:100%;min-width:0;height:54px;padding:0 16px;background:#0B1324;border:1px solid #2A3850;border-radius:16px;color:#F4F6FC;font:400 16px 'Inter',system-ui,sans-serif;outline:none;transition:border-color .2s ease,box-shadow .2s ease}
.pcpr-field select{appearance:none;-webkit-appearance:none;padding-right:44px;text-overflow:ellipsis;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239BA8BE' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.pcpr-field select option{background:#10192B;color:#F4F6FC}
.pcpr-field select:disabled{opacity:.55;cursor:not-allowed}
.pcpr-field input::placeholder{color:#6F7F99}
.pcpr-field select:focus,.pcpr-field input:focus{border-color:#31D3A2;box-shadow:0 0 0 3px rgba(49,211,162,.2)}
.pcpr-err{margin:0;color:#F87171;font-size:13px}
@keyframes pcprDrop{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes pcprUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes pcprFade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.pcpr-banner,.pcpr-sheet,.pcpr-overlay{animation:none}}
`;

  function injectStyle() {
    if (document.getElementById('pcpr-style')) return;
    const st = document.createElement('style');
    st.id = 'pcpr-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // ---------- Banner ----------
  function showBanner(ctx) {
    injectStyle();
    const banner = document.createElement('div');
    banner.className = 'pcpr-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Profile reminder');
    banner.innerHTML =
      '<div class="pcpr-banner__text">' +
        '<div class="pcpr-banner__title">Complete your profile</div>' +
        '<div class="pcpr-banner__sub"></div>' +
      '</div>' +
      '<div class="pcpr-banner__actions">' +
        '<button type="button" class="pcpr-btn" data-open>Complete profile</button>' +
        '<button type="button" class="pcpr-link" data-dismiss>Not now</button>' +
      '</div>';

    const what = ctx.needAcad && ctx.needWa ? 'college, department and WhatsApp number'
      : ctx.needAcad ? 'college and department'
      : 'WhatsApp number';
    banner.querySelector('.pcpr-banner__sub').textContent = 'Add your ' + what + '.';

    const openBtn = banner.querySelector('[data-open]');
    openBtn.addEventListener('click', () => openSheet(ctx, banner, openBtn));
    banner.querySelector('[data-dismiss]').addEventListener('click', () => {
      try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
      banner.remove();
    });
    document.body.appendChild(banner);
  }

  // ---------- Form (bottom sheet on phones, centred card on larger screens) ----------
  function openSheet(ctx, banner, opener) {
    const overlay = document.createElement('div');
    overlay.className = 'pcpr-overlay';
    overlay.innerHTML =
      '<div class="pcpr-sheet" role="dialog" aria-modal="true" aria-labelledby="pcprTitle">' +
        '<h2 id="pcprTitle" class="pcpr-h">Complete your profile</h2>' +
        '<p class="pcpr-lead">This is saved to your account.</p>' +
        '<form class="pcpr-form" novalidate>' +
          (ctx.needAcad
            ? '<label class="pcpr-field"><span>College</span><select name="college" disabled><option value="">Loading colleges…</option></select></label>' +
              '<label class="pcpr-field"><span>Department</span><select name="department" disabled><option value="">Select your college first</option></select></label>'
            : '') +
          (ctx.needWa
            ? '<label class="pcpr-field"><span>WhatsApp number</span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 08012345678"><small>Outside Nigeria? Start with your country code, e.g. +44.</small></label>'
            : '') +
          '<p class="pcpr-err" role="alert" hidden></p>' +
          '<button type="submit" class="pcpr-btn pcpr-btn--block">Save profile</button>' +
          '<button type="button" class="pcpr-link pcpr-link--center" data-close>Cancel</button>' +
        '</form>' +
      '</div>';

    const sheet = overlay.querySelector('.pcpr-sheet');
    const form = overlay.querySelector('form');
    const errEl = overlay.querySelector('.pcpr-err');
    const collegeSel = form.elements.college || null;
    const deptSel = form.elements.department || null;
    const waInput = form.elements.whatsapp || null;
    const submitBtn = form.querySelector('[type="submit"]');
    let academics = [];

    const showErr = (msg) => { errEl.textContent = msg || ''; errEl.hidden = !msg; };
    const prevOverflow = document.documentElement.style.overflow;

    function close() {
      overlay.remove();
      document.documentElement.style.overflow = prevOverflow;
      if (opener && opener.isConnected) opener.focus();
    }

    function fillDepartments(collegeName, selected) {
      deptSel.innerHTML = '';
      const col = academics.find((c) => c.name === collegeName);
      if (!col) {
        deptSel.add(new Option('Select your college first', ''));
        deptSel.disabled = true;
        return;
      }
      deptSel.add(new Option('Select your department', ''));
      col.departments.forEach((n) => deptSel.add(new Option(n, n)));
      deptSel.disabled = false;
      if (selected) deptSel.value = selected;
    }

    if (ctx.needAcad) {
      collegeSel.addEventListener('change', () => { showErr(''); fillDepartments(collegeSel.value); });
      deptSel.addEventListener('change', () => showErr(''));
      loadAcademics(ctx.db).then((list) => {
        academics = list;
        collegeSel.innerHTML = '';
        collegeSel.add(new Option('Select your college', ''));
        list.forEach((c) => collegeSel.add(new Option(c.name, c.name)));
        collegeSel.disabled = false;
        // If they already typed a department earlier, pre-select it
        const dep = String(ctx.profile.department || '').trim().toLowerCase();
        if (dep) {
          for (const c of list) {
            const hit = c.departments.find((n) => n.toLowerCase() === dep);
            if (hit) { collegeSel.value = c.name; fillDepartments(c.name, hit); break; }
          }
        }
      }).catch(() => {
        collegeSel.innerHTML = '<option value="">Couldn’t load colleges</option>';
        showErr('Couldn’t load the college list. Check your connection and try again.');
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showErr('');
      const payload = {};
      const meta = {};

      if (ctx.needAcad) {
        const college = collegeSel.value;
        const department = deptSel.value;
        if (!college || !department) return showErr('Select your college and department.');
        payload.college = college;
        payload.department = department;
        meta.college = college;
        meta.department = department;
        if (empty(ctx.profile.institution)) payload.institution = FUNAAB_SCHOOL;
      }
      if (ctx.needWa) {
        const wa = normalizeWhatsapp(waInput.value);
        if (!wa) return showErr('Enter a valid WhatsApp number, e.g. 08012345678.');
        payload.whatsapp = wa;
        meta.whatsapp = wa;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';
      try {
        payload.updated_at = new Date().toISOString();
        let r = await ctx.db.from('profiles').update(payload).eq('id', ctx.user.id).select('id');
        if (r.error) throw r.error;
        if (!r.data || !r.data.length) {
          // No profile row yet: create it
          r = await ctx.db.from('profiles').insert(Object.assign({ id: ctx.user.id }, payload));
          if (r.error) throw r.error;
        }
        // Keep the sign-in metadata in step (non-critical)
        try { await ctx.db.auth.updateUser({ data: meta }); } catch (e2) {}

        sheet.innerHTML = '<h2 class="pcpr-h">Profile saved</h2><p class="pcpr-lead" style="margin:0">Thanks, you’re all set.</p>';
        banner.remove();
        try { window.dispatchEvent(new CustomEvent('pc:profile-updated', { detail: payload })); } catch (e3) {}
        setTimeout(close, 1200);
      } catch (err) {
        showErr('Couldn’t save your profile. Check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save profile';
      }
    });

    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const f = overlay.querySelectorAll('select:not(:disabled), input, button:not(:disabled)');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    const firstField = form.querySelector('select, input');
    if (firstField) firstField.focus();
  }

  // ---------- Decide whether to show ----------
  async function start() {
    try { if (sessionStorage.getItem(DISMISS_KEY)) return; } catch (e) {}
    const db = await getClient();
    if (!db) return;

    const { data } = await db.auth.getSession();
    const session = data && data.session;
    if (!session) return; // not signed in

    const res = await db.from('profiles')
      .select('college,department,whatsapp,institution')
      .eq('id', session.user.id)
      .maybeSingle();
    if (res.error) return;

    const profile = res.data || {};
    // Someone who told us they're at another school can't pick a FUNAAB college,
    // so they're only asked for their WhatsApp number.
    const otherSchool = !empty(profile.institution) && !/funaab|agricultur|abeokuta/i.test(profile.institution);
    const needAcad = !otherSchool && (empty(profile.college) || empty(profile.department));
    const needWa = empty(profile.whatsapp);
    if (!needAcad && !needWa) return;

    showBanner({ db, user: session.user, profile, needAcad, needWa });
  }

  function run() { start().catch(() => {}); }
  if (document.readyState === 'complete') setTimeout(run, 600);
  else window.addEventListener('load', () => setTimeout(run, 600));
})();
