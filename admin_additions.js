  /* ================= ADDED: Exam Preparation switch + Institutions manager ================= */

  // Put both in the sidebar under "Sign-up lists", right after "Levels"
  (function () {
    var at = SECTIONS.map(function (s) { return s.id; }).indexOf('levels') + 1 || SECTIONS.length - 1;
    SECTIONS.splice(at, 0,
      { id: 'examprep', label: 'Exam Preparation', group: 'Sign-up lists', kind: 'examprep', icon: 'award' },
      { id: 'institutions', label: 'Institutions', group: 'Sign-up lists', kind: 'institutions', icon: 'school' }
    );
  })();

  /* ---------- Exam Preparation: coming soon / live ---------- */
  function examState(r) {
    if (r.visible === false) return 'hidden';
    if (r.coming_soon) return 'soon';
    return r.enabled === false ? 'hidden' : 'live';
  }
  function examPatch(state) {
    if (state === 'live') return { enabled: true, coming_soon: false, visible: true };
    if (state === 'soon') return { enabled: true, coming_soon: true, visible: true };
    return { visible: false };
  }

  async function renderExamPrep() {
    var view = $('view');
    view.innerHTML = '<div class="count">Loading…</div>';
    var pw, ex;
    try {
      pw = (await api('list', { table: 'registration_pathways', limit: 20 })).rows || [];
      ex = (await fetchAllRows('exam_categories')).rows || [];
    } catch (e) { view.innerHTML = emptyHtml(e.message, true); return; }
    if (current !== 'examprep') return;
    ex.sort(function (a, b) { return (a.sort_order == null ? 999 : a.sort_order) - (b.sort_order == null ? 999 : b.sort_order); });
    var row = pw.filter(function (r) { return r.key === 'exam_preparation'; })[0];
    var mode = !row ? 'soon' : row.enabled === false ? 'hidden' : (row.coming_soon === false ? 'live' : 'soon');
    var MODES = [
      ['live', 'Live', 'Students can choose Exam Preparation, pick their exam and register.'],
      ['soon', 'Coming soon', 'Students see a "Coming soon" card and cannot open it yet.'],
      ['hidden', 'Hidden', 'The Exam Preparation option is not shown on sign-up at all.']
    ];
    var h = '<div class="card stack" style="max-width:640px"><div class="h3">Exam Preparation on sign-up</div>' +
      '<div class="count">Controls the Exam Preparation card students see when they sign up (JAMB, WAEC, NECO and the other external exams).</div>';
    MODES.forEach(function (m) {
      h += '<label class="fld check" style="align-items:flex-start;gap:10px"><input type="radio" name="epMode" value="' + m[0] + '"' + (mode === m[0] ? ' checked' : '') + '>' +
        '<span><b>' + m[1] + '</b><br><span class="count">' + m[2] + '</span></span></label>';
    });
    h += '<button class="btn primary" id="epSave">Save</button><div class="count" id="epSt"></div></div>';

    h += '<div class="card stack" style="max-width:640px;margin-top:14px"><div class="h3">Exams students can choose (' + ex.length + ')</div>' +
      '<div class="count">Set each exam to Live, Coming soon or Hidden. Only Live exams can be picked at sign-up.</div>';
    if (!ex.length) h += '<div class="count">No exams yet. Add the first one below.</div>';
    ex.forEach(function (r, i) {
      var st = examState(r);
      h += '<div class="row" style="align-items:center"><div class="row-main"><div class="row-title">' + esc(r.title || r.code) + '</div><div class="row-sub">' + esc(r.code || '') + '</div></div>' +
        '<select data-ex="' + i + '" aria-label="Status of ' + esc(r.title || r.code) + '" style="max-width:150px">' +
        '<option value="live"' + (st === 'live' ? ' selected' : '') + '>Live</option>' +
        '<option value="soon"' + (st === 'soon' ? ' selected' : '') + '>Coming soon</option>' +
        '<option value="hidden"' + (st === 'hidden' ? ' selected' : '') + '>Hidden</option></select></div>';
    });
    h += '<div class="h3" style="margin-top:6px">Add an exam</div>' +
      '<div class="fld"><label for="exCode">Code *</label><input id="exCode" type="text" placeholder="e.g. jamb"><div class="hint">Short, lowercase, no spaces. Cannot be changed later.</div></div>' +
      '<div class="fld"><label for="exTitle">Name *</label><input id="exTitle" type="text" placeholder="e.g. JAMB/UTME"></div>' +
      '<div class="fld"><label for="exDesc">Short description</label><input id="exDesc" type="text" placeholder="One line students will read"></div>' +
      '<button class="btn" id="exAdd">' + icon('plus') + 'Add exam (starts as Coming soon)</button></div>';
    view.innerHTML = h;

    $('epSave').onclick = async function () {
      var sel = document.querySelector('input[name=epMode]:checked');
      if (!sel) return;
      if (sel.value === 'live' && !confirm('Make Exam Preparation LIVE? Students will be able to choose it and register.')) return;
      var data = { enabled: sel.value !== 'hidden', coming_soon: sel.value === 'soon' };
      try {
        if (row && row.id != null) await api('save', { table: 'registration_pathways', id: row.id, data: data });
        else await api('save', { table: 'registration_pathways', data: Object.assign({ key: 'exam_preparation' }, data) });
        toast('Exam Preparation is now ' + (sel.value === 'live' ? 'live' : sel.value === 'soon' ? 'coming soon' : 'hidden'));
        renderExamPrep();
      } catch (e) { toast(e.message, true); }
    };
    view.querySelectorAll('select[data-ex]').forEach(function (s) {
      s.onchange = async function () {
        var r = ex[+s.getAttribute('data-ex')];
        if (r.id == null) { toast('This exam has no id. Run the setup SQL first.', true); return; }
        try { await api('save', { table: 'exam_categories', id: r.id, data: examPatch(s.value) }); toast((r.title || r.code) + ': ' + s.options[s.selectedIndex].text); }
        catch (e) { toast(e.message, true); }
      };
    });
    $('exAdd').onclick = async function () {
      var code = $('exCode').value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      var title = $('exTitle').value.trim();
      if (!code || !title) return toast('Enter a code and a name.', true);
      if (ex.some(function (r) { return r.code === code; })) return toast('That code is already used.', true);
      try {
        await api('save', { table: 'exam_categories', data: { code: code, title: title, description: $('exDesc').value.trim(), icon: 'book', enabled: true, coming_soon: true, visible: true, sort_order: ex.length + 1 } });
        toast('Added'); renderExamPrep();
      } catch (e) { toast(e.message, true); }
    };
  }

  /* ---------- Institutions: universities, polytechnics, colleges ---------- */
  var INST_TYPES = [['university', 'University'], ['polytechnic', 'Polytechnic'], ['college', 'College']];
  var INST_OWN = [['F', 'Federal'], ['S', 'State'], ['P', 'Private'], ['X', 'Other']];
  var INST_WORDS = ['Faculty', 'College', 'School'];
  var inst = { rows: [], q: '', type: 'all', cur: null, dirty: false };

  function instName(list, v) { var m = list.filter(function (o) { return o[0] === v; })[0]; return m ? m[1] : ''; }
  function instOpts(list, sel) { return list.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === sel ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
  function instPlural(w, n) { return n === 1 ? w : (w === 'Faculty' ? 'Faculties' : w + 's'); }
  function instStats(r) {
    var f = r.faculties || [], d = 0;
    f.forEach(function (x) { d += (x.departments || []).length; });
    return f.length + ' ' + instPlural(r.label || 'Faculty', f.length).toLowerCase() + ' · ' + d + ' department' + (d === 1 ? '' : 's');
  }
  function instClone(r) { return JSON.parse(JSON.stringify(r)); }
  function instSort() { inst.rows.sort(function (a, b) { return azCompare(a.name, b.name); }); }

  async function renderInstitutions() {
    var view = $('view');
    view.innerHTML = '<div class="count">Loading institutions…</div>';
    try { inst.rows = (await fetchAllRows('institutions')).rows; }
    catch (e) { view.innerHTML = emptyHtml(e.message, true); return; }
    if (current !== 'institutions') return;
    instSort();
    inst.cur = null; inst.dirty = false;
    instList();
  }

  function instList() {
    var view = $('view');
    view.oninput = null; view.onchange = null; view.onkeydown = null;
    view.innerHTML = '<div class="stack">' +
      '<div class="card stack"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<input id="inQ" type="search" placeholder="Search institutions" aria-label="Search institutions" style="flex:1 1 200px" value="' + esc(inst.q) + '">' +
      '<select id="inT" aria-label="Type" style="flex:0 1 150px"><option value="all">All types</option>' + instOpts(INST_TYPES, inst.type) + '</select>' +
      '<button class="btn primary" id="inAdd">' + icon('plus') + 'Add institution</button></div>' +
      '<div class="count" id="inCount"></div></div>' +
      '<div class="stack" id="inRows"></div></div>';
    instPaint();
    $('inQ').oninput = function () { inst.q = this.value; instPaint(); };
    $('inT').onchange = function () { inst.type = this.value; instPaint(); };
    $('inAdd').onclick = function () {
      var nt = inst.type === 'all' ? 'university' : inst.type;
      inst.cur = { id: null, name: '', type: nt, ownership: 'S', state: '', label: nt === 'university' ? 'Faculty' : 'School', faculties: [], is_active: true };
      inst.dirty = false; instEdit();
    };
    view.onclick = function (e) {
      var el = e.target.closest('[data-iid]');
      if (!el) return;
      var r = inst.rows.filter(function (x) { return String(x.id) === el.getAttribute('data-iid'); })[0];
      if (r) { inst.cur = instClone(r); inst.dirty = false; instEdit(); }
    };
  }

  function instPaint() {
    var q = inst.q.trim().toLowerCase();
    var list = inst.rows.filter(function (r) {
      return (inst.type === 'all' || r.type === inst.type) && (!q || (r.name + ' ' + (r.state || '')).toLowerCase().indexOf(q) > -1);
    });
    $('inCount').textContent = list.length + ' of ' + inst.rows.length + ' institutions';
    var cap = 150, h = '';
    list.slice(0, cap).forEach(function (r) {
      var meta = [instName(INST_TYPES, r.type), instName(INST_OWN, r.ownership), r.state].filter(Boolean).join(' · ');
      h += '<div class="row tap" data-iid="' + esc(r.id) + '"><div class="row-main"><div class="row-title">' + esc(r.name) +
        (r.is_active === false ? ' <span class="tag red">Hidden</span>' : '') + '</div>' +
        '<div class="row-sub">' + esc(meta) + '</div><div class="row-sub">' + esc(instStats(r)) + '</div></div></div>';
    });
    if (list.length > cap) h += '<div class="count" style="padding:6px 2px">Showing the first ' + cap + '. Search to narrow the list.</div>';
    if (!list.length) h = '<div class="empty">No institutions match.</div>';
    $('inRows').innerHTML = h;
  }

  function instDirty() {
    inst.dirty = true;
    $('view').querySelectorAll('[data-st]').forEach(function (s) { s.textContent = 'Unsaved changes'; });
  }

  function instEdit(keep) {
    var view = $('view'), c = inst.cur, w = c.label || 'Faculty', y = window.scrollY;
    var top = '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<button class="btn small" data-a="back">← All institutions</button>' +
      '<button class="btn small primary" data-a="save">Save changes</button>' +
      '<span class="count" data-st>' + (inst.dirty ? 'Unsaved changes' : '') + '</span></div>';
    var h = '<div class="stack" style="max-width:760px">' + top +
      '<div class="card stack"><div class="h3">' + (c.id ? 'Edit institution' : 'New institution') + '</div>' +
      '<div class="fld"><label for="dName">Name *</label><input id="dName" data-f="name" type="text" value="' + esc(c.name) + '" placeholder="e.g. University of Ibadan">' +
      '<div class="hint">Renaming only affects new sign-ups. Students who already signed up keep the old name.</div></div>' +
      '<div class="fld"><label for="dType">Type</label><select id="dType" data-f="type">' + instOpts(INST_TYPES, c.type) + '</select></div>' +
      '<div class="fld"><label for="dOwn">Ownership</label><select id="dOwn" data-f="ownership">' + instOpts(INST_OWN, c.ownership) + '</select></div>' +
      '<div class="fld"><label for="dState">State</label><input id="dState" data-f="state" type="text" value="' + esc(c.state || '') + '" placeholder="e.g. Oyo"></div>' +
      '<div class="fld"><label for="dLabel">What does this school call its divisions?</label><select id="dLabel" data-f="label">' +
      instOpts(INST_WORDS.map(function (x) { return [x, x]; }), w) + '</select></div>' +
      '<div class="fld check"><input type="checkbox" id="dActive" data-f="is_active"' + (c.is_active !== false ? ' checked' : '') + '><label for="dActive" style="margin:0">Show on sign-up</label></div></div>' +
      '<div class="h3" style="margin-top:4px">' + esc(instPlural(w, 2)) + ' and departments</div>';
    if (!c.faculties.length) h += '<div class="count">None yet. Add the first ' + esc(w.toLowerCase()) + ' below.</div>';
    c.faculties.forEach(function (f, fi) {
      h += '<div class="card stack">' +
        '<div style="display:flex;gap:8px;align-items:center"><input data-fn="' + fi + '" type="text" value="' + esc(f.name) + '" aria-label="' + esc(w) + ' name" style="font-weight:600">' +
        '<button class="btn small danger" data-a="delF" data-fi="' + fi + '">Delete</button></div>' +
        '<div class="count">Departments (' + f.departments.length + ')</div>';
      f.departments.forEach(function (d, di) {
        h += '<div style="display:flex;gap:8px;align-items:center"><input data-dn="' + fi + '-' + di + '" type="text" value="' + esc(d) + '" aria-label="Department name">' +
          '<button class="btn small" data-a="delD" data-fi="' + fi + '" data-di="' + di + '" aria-label="Remove department">' + icon('x') + '</button></div>';
      });
      h += '<div style="display:flex;gap:8px;align-items:center"><input id="addD' + fi + '" data-addd="' + fi + '" type="text" placeholder="Add a department" aria-label="New department name">' +
        '<button class="btn small primary" data-a="addD" data-fi="' + fi + '">' + icon('plus') + 'Add</button></div></div>';
    });
    h += '<div class="card stack"><div class="h3">Add a ' + esc(w.toLowerCase()) + '</div>' +
      '<div style="display:flex;gap:8px"><input id="newF" type="text" placeholder="e.g. Faculty of Science" aria-label="New ' + esc(w.toLowerCase()) + ' name">' +
      '<button class="btn primary" data-a="addF">' + icon('plus') + 'Add</button></div></div>' +
      '<div class="card stack"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<button class="btn primary" data-a="save">Save changes</button>' +
      (c.id ? '<button class="btn danger" data-a="delI">Delete institution</button>' : '') +
      '<span class="count" data-st>' + (inst.dirty ? 'Unsaved changes' : '') + '</span></div></div></div>';
    view.innerHTML = h;
    if (keep) window.scrollTo(0, y); else window.scrollTo(0, 0);

    view.oninput = function (e) {
      var t = e.target, k;
      if (t.hasAttribute('data-f')) {
        k = t.getAttribute('data-f');
        inst.cur[k] = t.type === 'checkbox' ? t.checked : t.value;
        instDirty();
        if (k === 'type' && !inst.cur.id && !inst.cur.faculties.length) { inst.cur.label = t.value === 'university' ? 'Faculty' : 'School'; instEdit(true); }
        else if (k === 'label') instEdit(true);
      } else if (t.hasAttribute('data-fn')) {
        inst.cur.faculties[+t.getAttribute('data-fn')].name = t.value; instDirty();
      } else if (t.hasAttribute('data-dn')) {
        var p = t.getAttribute('data-dn').split('-');
        inst.cur.faculties[+p[0]].departments[+p[1]] = t.value; instDirty();
      }
    };
    view.onchange = null;
    view.onkeydown = function (e) {
      if (e.key !== 'Enter') return;
      var t = e.target;
      if (t.hasAttribute('data-addd')) { e.preventDefault(); instAddDept(+t.getAttribute('data-addd')); }
      else if (t.id === 'newF') { e.preventDefault(); instAddFaculty(); }
    };
    view.onclick = async function (e) {
      var b = e.target.closest('[data-a]');
      if (!b) return;
      var a = b.getAttribute('data-a'), c2 = inst.cur, fi = +b.getAttribute('data-fi'), di = +b.getAttribute('data-di');
      if (a === 'back') {
        if (inst.dirty && !(await confirmBox({ title: 'Leave without saving?', text: 'Your changes will be lost.', yes: 'Leave', danger: true }))) return;
        inst.cur = null; inst.dirty = false; instList();
      } else if (a === 'save') { instSave(); }
      else if (a === 'addF') { instAddFaculty(); }
      else if (a === 'addD') { instAddDept(fi); }
      else if (a === 'delD') { c2.faculties[fi].departments.splice(di, 1); instDirty(); instEdit(true); }
      else if (a === 'delF') {
        var f = c2.faculties[fi];
        if (!(await confirmBox({ title: 'Delete "' + (f.name || 'this ' + w.toLowerCase()) + '"?', text: 'Its ' + f.departments.length + ' departments are removed too. Nothing is saved until you press Save changes.', yes: 'Delete', danger: true }))) return;
        c2.faculties.splice(fi, 1); instDirty(); instEdit(true);
      } else if (a === 'delI') {
        if (!(await confirmBox({ title: 'Delete ' + (c2.name || 'this institution') + '?', text: 'It disappears from the sign-up list. Students who already signed up are not affected.', yes: 'Delete', danger: true }))) return;
        try {
          await api('remove', { table: 'institutions', id: c2.id });
          inst.rows = inst.rows.filter(function (r) { return r.id !== c2.id; });
          inst.cur = null; inst.dirty = false; toast('Deleted'); instList();
        } catch (err) { toast(err.message, true); }
      }
    };
  }

  function instAddFaculty() {
    var nm = ($('newF').value || '').trim();
    if (!nm) return toast('Type a name first.', true);
    inst.cur.faculties.push({ name: nm, departments: [] });
    instDirty(); instEdit(true);
    var el = $('addD' + (inst.cur.faculties.length - 1));
    if (el) el.focus();
  }
  function instAddDept(fi) {
    var inp = $('addD' + fi), v = inp ? inp.value.trim() : '';
    if (!v) return toast('Type a department name first.', true);
    inst.cur.faculties[fi].departments.push(v);
    instDirty(); instEdit(true);
    var el = $('addD' + fi);
    if (el) el.focus();
  }

  async function instSave() {
    var c = inst.cur, name = String(c.name || '').trim();
    if (!name) return toast('Give the institution a name.', true);
    var dup = inst.rows.filter(function (r) { return r.id !== c.id && String(r.name).trim().toLowerCase() === name.toLowerCase(); })[0];
    if (dup) return toast('Another institution already has that name.', true);
    var faculties = c.faculties.map(function (f) {
      return { name: String(f.name || '').trim(), departments: f.departments.map(function (d) { return String(d || '').trim(); }).filter(Boolean) };
    }).filter(function (f) { return f.name; });
    var data = { name: name, type: c.type, ownership: c.ownership, state: String(c.state || '').trim(), label: c.label || 'Faculty', faculties: faculties, is_active: c.is_active !== false, updated_at: new Date().toISOString() };
    var btns = $('view').querySelectorAll('[data-a="save"]');
    btns.forEach(function (b) { b.disabled = true; });
    try {
      await api('save', { table: 'institutions', id: c.id || undefined, data: data });
      inst.rows = (await fetchAllRows('institutions')).rows; instSort();
      var fresh = inst.rows.filter(function (r) { return r.name === name; })[0];
      inst.cur = fresh ? instClone(fresh) : null;
      inst.dirty = false;
      toast('Saved');
      if (current !== 'institutions') return;
      if (inst.cur) instEdit(true); else instList();
    } catch (e) {
      btns.forEach(function (b) { b.disabled = false; });
      toast(e.message, true);
    }
  }

