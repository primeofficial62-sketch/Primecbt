// PRIME-CBT usage helper. Limits come from the plan_limits table, nothing hardcoded here.
(function () {
  'use strict';
  var MODE = { general: 'General Practice', quick: 'Quick Practice', topic: 'Topic Practice', timed: 'Timed Practice', mock: 'Mock Exam' };
  var PRO = ['30 AI explanations a day', 'More practice sessions in every mode', 'AI revision notes and expanded summaries', 'Offline learning packs', 'Advanced analytics'];
  var cache = null, at = 0;

  function modeFor(kind) { return { generic: 'general', quick: 'quick', topic: 'topic', timed: 'timed', mock: 'mock' }[kind] || null; }

  async function usage(db, force) {
    if (!force && cache && Date.now() - at < 15000) return cache;
    try {
      var r = await db.rpc('my_quota_usage');
      if (r.error || !r.data) return null;
      cache = r.data; at = Date.now(); return cache;
    } catch (e) { return null; }
  }
  function left(u, m) {
    var l = u && u.limits && u.limits[m];
    if (!l) return null;
    return Math.max(0, l.limit - ((u.sessions && u.sessions[m]) || 0));
  }
  function resetIn() {   // Lagos is UTC+1, no daylight saving
    var now = Date.now(), l = new Date(now + 3600000);
    var ms = Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate() + 1) - 3600000 - now;
    var h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
    return h + 'h ' + m + 'm';
  }

  function popup(title, lines) {
    var o = document.createElement('div');
    o.setAttribute('style', 'position:fixed;inset:0;z-index:2000;background:rgba(2,6,23,.78);display:flex;align-items:center;justify-content:center;padding:16px');
    var b = document.createElement('div');
    b.setAttribute('role', 'dialog');
    b.setAttribute('style', 'width:100%;max-width:400px;background:#0f172a;color:#f1f5f9;border:1px solid #334155;border-radius:20px;padding:22px;font-family:Inter,system-ui,sans-serif');
    var h = document.createElement('h2'); h.textContent = title; h.setAttribute('style', 'font-size:1.05rem;margin-bottom:10px');
    b.appendChild(h);
    lines.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; p.setAttribute('style', 'color:#cbd5e1;font-size:.92rem;line-height:1.55;margin-bottom:10px'); b.appendChild(p); });
    var pro = document.createElement('p');
    pro.textContent = 'Prime Pro is coming soon: ' + PRO.join(' \u00b7 ');
    pro.setAttribute('style', 'color:#34d399;font-size:.82rem;line-height:1.5;margin:4px 0 14px');
    b.appendChild(pro);
    var ok = document.createElement('button'); ok.type = 'button'; ok.textContent = 'Got it';
    ok.setAttribute('style', 'width:100%;min-height:46px;border:0;border-radius:12px;background:linear-gradient(135deg,#10b981,#2dd4bf);color:#022c22;font-weight:700;font-size:.95rem;cursor:pointer');
    ok.onclick = function () { o.remove(); };
    b.appendChild(ok); o.appendChild(b);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    document.body.appendChild(o);
  }

  function showLimit(mode, limit) {
    var n = limit || 1, name = MODE[mode] || 'practice';
    popup('Daily limit reached', [
      'You\u2019ve used your ' + n + ' ' + name + (n === 1 ? ' session' : ' sessions') + ' for today.',
      'Your allowance resets at midnight (Lagos time), in ' + resetIn() + '. Your course materials and other learning resources stay open.'
    ]);
  }
  function showAiLimit(limit) {
    popup('AI explanations used up', [
      'You\u2019ve used all your ' + (limit || 3) + ' free AI explanations for today. Your allowance resets at midnight (Lagos time), in ' + resetIn() + '.',
      'You can keep reading your materials and practising.'
    ]);
  }
  function aiText(q) { return q ? 'AI explanations remaining today: ' + q.remaining + '/' + q.limit : ''; }

  window.PrimeQuota = { modeFor: modeFor, usage: usage, left: left, showLimit: showLimit, showAiLimit: showAiLimit, aiText: aiText };
})();
