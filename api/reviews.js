/* PRIME-CBT admin: Reviews section (complete, self-contained)
   Use:  <div id="reviewsPanel"></div>  +  <script src="reviews-admin.js"></script>
   Then call  loadReviews()  when the Reviews section is opened (after PIN sign-in).
   Talks to /api/admin (same site), using the existing admin session cookie. */
(function () {
  function start() {
    var panel = document.getElementById('reviewsPanel');
    if (!panel) return;

    /* ---------- styles ---------- */
    var css = document.createElement('style');
    css.textContent =
      '.rev-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}' +
      '.rev-top h2{font-size:1.05rem;margin:0}' +
      '.rev-tools{display:flex;gap:8px}' +
      '.rev-tools select,.rev-tools button,.rev-actions button{padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9;cursor:pointer;font-size:.8rem}' +
      '.rev-card{background:#0f172a;border:1px solid #334155;border-radius:14px;padding:14px;margin-bottom:10px}' +
      '.rev-card.new{border-color:#34d399}' +
      '.rev-head{font-weight:600;font-size:.9rem;overflow-wrap:anywhere}' +
      '.rev-meta{font-size:.75rem;color:#94a3b8;margin:4px 0 8px}' +
      '.rev-msg{font-size:.9rem;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}' +
      '.rev-actions{display:flex;gap:8px;margin-top:10px}' +
      '.rev-empty{color:#94a3b8;font-size:.9rem;padding:12px 0}';
    document.head.appendChild(css);

    /* ---------- markup (static, no user data) ---------- */
    panel.innerHTML =
      '<div class="rev-top">' +
        '<h2>Reviews <span id="revCount"></span></h2>' +
        '<div class="rev-tools">' +
          '<select id="revFilter">' +
            '<option value="all">All</option>' +
            '<option value="new">New only</option>' +
            '<option value="review">Reviews</option>' +
            '<option value="bug">Bugs</option>' +
            '<option value="suggestion">Suggestions</option>' +
          '</select>' +
          '<button id="revRefresh" type="button">Refresh</button>' +
        '</div>' +
      '</div>' +
      '<div id="revList"></div>';

    var listEl = document.getElementById('revList');
    var countEl = document.getElementById('revCount');
    var filterEl = document.getElementById('revFilter');

    /* ---------- API ---------- */
    async function adminApi(body) {
      var r = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.error || 'Request failed');
      return d;
    }

    function note(text) {
      listEl.replaceChildren();
      var d = document.createElement('div');
      d.className = 'rev-empty';
      d.textContent = text;
      listEl.appendChild(d);
    }

    /* ---------- render ---------- */
    async function loadReviews() {
      var f = filterEl.value;
      var filters = {};
      if (f === 'new') filters.status = 'new';
      else if (f !== 'all') filters.category = f;

      var out;
      try {
        out = await adminApi({ action: 'list', table: 'reviews', limit: 100, filters: filters });
      } catch (e) { note(e.message); return; }

      var rows = out.rows || [];
      countEl.textContent = '(' + (out.total || 0) + ')';
      if (!rows.length) { note('No reviews yet.'); return; }

      listEl.replaceChildren();
      rows.forEach(function (r) {
        var card = document.createElement('div');
        card.className = 'rev-card' + (r.status === 'new' ? ' new' : '');

        var head = document.createElement('div');
        head.className = 'rev-head';
        head.textContent = (r.user_name || 'Student') + (r.user_email ? ' \u00b7 ' + r.user_email : '');

        var meta = document.createElement('div');
        meta.className = 'rev-meta';
        var stars = r.rating ? '\u2605'.repeat(r.rating) + '\u2606'.repeat(5 - r.rating) : 'No rating';
        meta.textContent = r.category + ' \u00b7 ' + stars + ' \u00b7 ' + new Date(r.created_at).toLocaleString();

        var msg = document.createElement('div');
        msg.className = 'rev-msg';
        msg.textContent = r.message;

        var actions = document.createElement('div');
        actions.className = 'rev-actions';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.textContent = r.status === 'new' ? 'Mark resolved' : 'Reopen';
        toggle.addEventListener('click', async function () {
          toggle.disabled = true;
          try {
            await adminApi({ action: 'save', table: 'reviews', id: r.id,
              data: { status: r.status === 'new' ? 'resolved' : 'new' } });
          } catch (e) { alert(e.message); }
          loadReviews();
        });

        var del = document.createElement('button');
        del.type = 'button';
        del.textContent = 'Delete';
        del.addEventListener('click', async function () {
          if (!confirm('Delete this review?')) return;
          del.disabled = true;
          try { await adminApi({ action: 'remove', table: 'reviews', id: r.id }); }
          catch (e) { alert(e.message); }
          loadReviews();
        });

        actions.append(toggle, del);
        card.append(head, meta, msg, actions);
        listEl.appendChild(card);
      });
    }

    filterEl.addEventListener('change', loadReviews);
    document.getElementById('revRefresh').addEventListener('click', loadReviews);

    // refresh every 30s while the Reviews section is visible
    setInterval(function () {
      if (!document.hidden && panel.offsetParent) loadReviews();
    }, 30000);

    window.loadReviews = loadReviews;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
