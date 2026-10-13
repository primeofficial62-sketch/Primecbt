// PRIME-CBT AI Study Assistant - browser chat script (loaded by ai-assistant.html)
// Talks to /api/assistant (chat) and /api/study-tools (summaries, flashcards)

(function () {
  // ========== SUPABASE CLIENT (same project as the rest of the app) ==========
  var SUPABASE_URL = "https://xuofkjjhupgmrphzgyun.supabase.co";
  var SUPABASE_KEY = "sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh";
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  var $ = function (id) { return document.getElementById(id); };
  var chatArea = $('chatArea'), chatStream = $('chatStream');
  var welcomeBlock = $('welcomeBlock'), promptSuggestions = $('promptSuggestions');
  var chatForm = $('chatForm'), chatInput = $('chatInput'), sendBtn = $('sendBtn');
  var newChatBtn = $('newChatBtn'), offlineBanner = $('offlineBanner');

  var history = [];          // [{id?, role:'user'|'assistant', content, image?}]
  var busy = false;
  var loading = true;        // true while the saved chat is loading
  var controller = null;
  var userId = null;
  var persist = true;        // flips to false if the ai_messages table doesn't exist yet
  var pendingImage = null;   // compressed photo waiting to be sent

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function ymd(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function nearBottom() {
    return chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 90;
  }
  function scrollToBottom() { chatArea.scrollTop = chatArea.scrollHeight; }
  function autosize() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
  }
  function setBusy(b) {
    busy = b;
    sendBtn.classList.toggle('is-stop', b);
    sendBtn.setAttribute('aria-label', b ? 'Stop' : 'Send');
    chatStream.setAttribute('aria-busy', b ? 'true' : 'false');
  }
  function showIntro(show) {
    welcomeBlock.hidden = !show;
    promptSuggestions.hidden = !show;
  }
  async function getToken() {
    var s = await sb.auth.getSession();
    var session = s && s.data && s.data.session;
    return session ? session.access_token : null;
  }

  // ---------- tiny safe markdown renderer (escapes HTML first) + maths (KaTeX) ----------
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  }
  function renderBlocks(text) {
    var lines = esc(text).split('\n');
    var out = '', list = null, para = [];
    function flushPara() { if (para.length) { out += '<p>' + para.join('<br>') + '</p>'; para = []; } }
    function closeList() { if (list) { out += '</' + list + '>'; list = null; } }
    lines.forEach(function (raw) {
      var line = raw.replace(/\s+$/, ''), m;
      if (!line.trim()) { flushPara(); closeList(); return; }
      if ((m = line.match(/^\s{0,3}#{1,4}\s+(.*)$/))) { flushPara(); closeList(); out += '<h4>' + inline(m[1]) + '</h4>'; return; }
      if ((m = line.match(/^\s*[-*\u2022]\s+(.*)$/))) {
        flushPara();
        if (list !== 'ul') { closeList(); out += '<ul>'; list = 'ul'; }
        out += '<li>' + inline(m[1]) + '</li>'; return;
      }
      if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
        flushPara();
        if (list !== 'ol') { closeList(); out += '<ol start="' + m[1] + '">'; list = 'ol'; }
        out += '<li>' + inline(m[2]) + '</li>'; return;
      }
      closeList(); para.push(inline(line));
    });
    flushPara(); closeList();
    return out;
  }
  function katexHtml(tex, display) {
    try {
      if (window.katex) return window.katex.renderToString(tex.trim(), { displayMode: display, throwOnError: false });
    } catch (e) { /* fall through */ }
    return esc(display ? '$$' + tex + '$$' : '$' + tex + '$');
  }
  function renderMarkdown(src) {
    var math = [];
    function stash(tex, display) {
      math.push(katexHtml(tex, display));
      return '\uE000' + (math.length - 1) + '\uE001';
    }
    return src.split('```').map(function (part, i) {
      if (i % 2 === 1) {
        var code = part.replace(/^[^\n]*\n/, '').replace(/\n$/, '');
        return '<pre><code>' + esc(code) + '</code></pre>';
      }
      // pull maths out first so the markdown rules don't damage it
      part = part
        .replace(/\$\$([\s\S]+?)\$\$/g, function (_, t) { return stash(t, true); })
        .replace(/\\\[([\s\S]+?)\\\]/g, function (_, t) { return stash(t, true); })
        .replace(/\\\(([\s\S]+?)\\\)/g, function (_, t) { return stash(t, false); })
        .replace(/\$([^\s$](?:[^$\n]*?[^\s$])?)\$(?!\d)/g, function (_, t) { return stash(t, false); });
      return renderBlocks(part).replace(/\uE000(\d+)\uE001/g, function (_, n) { return math[+n]; });
    }).join('');
  }

  // ---------- saved chat (Supabase table ai_messages) ----------
  function persistFailed(err) {
    var msg = (err && err.message) || '';
    if (err && (err.code === '42P01' || err.code === 'PGRST205' || /does not exist|schema cache/i.test(msg))) persist = false;
  }
  async function saveMessage(role, content) {
    if (!persist || !userId) return null;
    try {
      var r = await sb.from('ai_messages').insert({ role: role, content: content }).select('id').single();
      if (r.error) { persistFailed(r.error); return null; }
      return r.data.id;
    } catch (e) { return null; }
  }
  async function deleteMessage(id) {
    if (!persist || !id) return;
    try { await sb.from('ai_messages').delete().eq('id', id); } catch (e) { /* best effort */ }
  }
  async function loadHistory() {
    try {
      var r = await sb.from('ai_messages').select('id,role,content')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(40);
      if (r.error) { persistFailed(r.error); return; }
      var rows = (r.data || []).reverse();
      if (!rows.length) return;
      showIntro(false);
      rows.forEach(function (m) {
        history.push({ id: m.id, role: m.role, content: m.content });
        if (m.role === 'user') addUser(m.content);
        else finishAssistant(addAssistantBubble(), m.content);
      });
      refreshActions();
      scrollToBottom();
    } catch (e) { /* the chat still works without saved history */ }
  }

  // ---------- chat UI ----------
  function addUser(text, image) {
    var node = el('div', 'message user');
    if (image) {
      var img = el('img', 'aix-thumb');
      img.src = image;
      img.alt = 'Photo you sent';
      node.appendChild(img);
    }
    node.appendChild(document.createTextNode(text));
    chatStream.appendChild(node);
    scrollToBottom();
  }
  function addAssistantBubble() {
    var node = el('div', 'message assistant');
    node.innerHTML = '<span class="typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>';
    chatStream.appendChild(node);
    scrollToBottom();
    return node;
  }
  function addError(msg) {
    var node = el('div', 'message error');
    var span = el('span', null, msg);
    var btn = el('button', 'retry-btn', 'Retry');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      if (busy) return;
      node.remove();
      requestReply();
    });
    node.appendChild(span);
    node.appendChild(btn);
    chatStream.appendChild(node);
    scrollToBottom();
  }

  // Final render of a finished assistant reply (text + Copy button)
  function finishAssistant(bubble, text) {
    bubble.innerHTML = renderMarkdown(text);
    bubble.dataset.raw = text;
    var bar = el('div', 'msg-actions');
    var copy = el('button', 'act-btn', 'Copy');
    copy.type = 'button';
    copy.addEventListener('click', function () {
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
      else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        ta.remove();
      }
    });
    bar.appendChild(copy);
    bubble.appendChild(bar);
  }

  // Only the newest assistant reply gets a "Regenerate" button
  function refreshActions() {
    chatStream.querySelectorAll('.regen-btn').forEach(function (b) { b.remove(); });
    if (busy) return;
    var last = history[history.length - 1];
    if (!last || last.role !== 'assistant') return;
    var bubbles = chatStream.querySelectorAll('.message.assistant');
    var bubble = bubbles[bubbles.length - 1];
    var bar = bubble && bubble.querySelector('.msg-actions');
    if (!bar) return;
    var btn = el('button', 'act-btn regen-btn', 'Regenerate');
    btn.type = 'button';
    btn.addEventListener('click', regenerate);
    bar.appendChild(btn);
  }

  function regenerate() {
    if (busy) return;
    var last = history[history.length - 1];
    if (!last || last.role !== 'assistant') return;
    var bubbles = chatStream.querySelectorAll('.message.assistant');
    if (bubbles.length) bubbles[bubbles.length - 1].remove();
    deleteMessage(last.id);
    history.pop();
    requestReply();
  }

  // ---------- talk to the live model (streamed) ----------
  async function requestReply() {
    setBusy(true);
    refreshActions();
    var bubble = addAssistantBubble();
    var full = '';
    var raf = 0;
    controller = new AbortController();

    function paint() {
      raf = 0;
      var stick = nearBottom();
      bubble.innerHTML = renderMarkdown(full);
      if (stick) scrollToBottom();
    }
    async function keep() {
      finishAssistant(bubble, full);
      var entry = { role: 'assistant', content: full };
      history.push(entry);
      entry.id = await saveMessage('assistant', full);
    }

    try {
      var token = await getToken();
      if (!token) { window.location.replace('/auth.html?mode=login'); return; }

      var recent = history.slice(-20);
      var lastEntry = recent[recent.length - 1];
      var payload = {
        messages: recent.map(function (m) { return { role: m.role, content: m.content }; }),
        today: ymd(new Date())
      };
      // a photo is sent only with the newest student message
      if (lastEntry && lastEntry.role === 'user' && lastEntry.image) payload.image = lastEntry.image;

      var res = await fetch('/api/assistant', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        var msg = '';
        try { msg = (await res.json()).error; } catch (e) { /* not JSON */ }
        var err = new Error(msg || ('Something went wrong (' + res.status + ').'));
        err.status = res.status;
        throw err;
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buf += decoder.decode(chunk.value, { stream: true });
        var parts = buf.split('\n');
        buf = parts.pop();
        for (var i = 0; i < parts.length; i++) {
          var line = parts[i].trim();
          if (line.indexOf('data:') !== 0) continue;
          var data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            var j = JSON.parse(data);
            var delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
            if (delta) { full += delta; if (!raf) raf = requestAnimationFrame(paint); }
          } catch (e) { /* ignore partial JSON */ }
        }
      }

      if (raf) cancelAnimationFrame(raf);
      if (!full.trim()) throw new Error('The assistant sent an empty reply. Please try again.');
      await keep();
    } catch (err) {
      if (raf) cancelAnimationFrame(raf);
      if (err && err.name === 'AbortError') {
        // Stopped by the student: keep what was already written
        if (full.trim()) await keep(); else bubble.remove();
      } else {
        bubble.remove();
        addError(!navigator.onLine ? "You're offline. Reconnect and try again." : (err && err.message) || "Couldn't reach the assistant. Please try again.");
        if (err && err.status === 401) setTimeout(function () { window.location.replace('/auth.html?mode=login'); }, 1800);
      }
    } finally {
      controller = null;
      setBusy(false);
      refreshActions();
    }
  }

  async function submit(text) {
    text = (text || '').trim();
    var image = pendingImage;
    if ((!text && !image) || busy || loading) return;
    if (!text) text = 'Please help me with this photo.';
    showIntro(false);
    addUser(text, image);
    var entry = { role: 'user', content: text };
    if (image) entry.image = image;
    history.push(entry);
    clearPhoto();
    chatInput.value = '';
    autosize();
    saveMessage('user', image ? '[Photo] ' + text : text).then(function (id) { entry.id = id; });
    requestReply();
  }

  async function newChat() {
    if (controller) controller.abort();
    history = [];
    chatStream.innerHTML = '';
    clearPhoto();
    showIntro(true);
    chatInput.value = '';
    autosize();
    chatInput.focus();
    if (persist && userId) {
      try { await sb.from('ai_messages').delete().eq('user_id', userId); } catch (e) { /* best effort */ }
    }
  }

  // ====================================================================
  //  NEW: tool bar (photo, voice, study tools, quick actions)
  // ====================================================================
  var css = document.createElement('style');
  css.textContent =
    '.aix-bar{display:flex;gap:8px;overflow-x:auto;padding:8px 12px 6px;-webkit-overflow-scrolling:touch;scrollbar-width:none}' +
    '.aix-bar::-webkit-scrollbar{display:none}' +
    '.aix-chip{flex:0 0 auto;border:1px solid rgba(45,212,191,.45);background:rgba(45,212,191,.08);color:#99f6e4;border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;cursor:pointer;white-space:nowrap}' +
    '.aix-chip:active{background:rgba(45,212,191,.2)}' +
    '.aix-chip.on{background:#2dd4bf;color:#042f2e;border-color:#2dd4bf}' +
    '.aix-chip[hidden]{display:none}' +
    '.aix-note{padding:2px 14px 4px;font-size:13px;color:#fca5a5}' +
    '.aix-note:empty{display:none}' +
    '.aix-preview{display:flex;align-items:center;gap:10px;padding:6px 14px}' +
    '.aix-preview[hidden]{display:none}' +
    '.aix-preview img{height:52px;width:52px;object-fit:cover;border-radius:10px}' +
    '.aix-preview button{border:0;background:transparent;color:inherit;font-size:14px;text-decoration:underline;cursor:pointer}' +
    '.aix-thumb{display:block;max-width:100%;max-height:200px;border-radius:10px;margin-bottom:6px}' +
    '.aix-modal{position:fixed;inset:0;z-index:50;background:rgba(2,6,23,.75);display:flex;align-items:flex-end;justify-content:center}' +
    '.aix-modal[hidden]{display:none}' +
    '.aix-panel{width:100%;max-width:640px;max-height:92vh;overflow-y:auto;background:#0b1220;color:#e5e7eb;border:1px solid rgba(255,255,255,.12);border-radius:18px 18px 0 0;padding:16px}' +
    '.aix-ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:17px}' +
    '.aix-x{border:0;background:transparent;color:inherit;font-size:26px;line-height:1;cursor:pointer;padding:0 6px}' +
    '.aix-search,.aix-select{width:100%;box-sizing:border-box;background:#111a2e;color:inherit;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;font:inherit;font-size:15px;margin-bottom:8px}' +
    '.aix-select{height:170px}' +
    '.aix-row{display:flex;gap:8px;margin:4px 0 12px}' +
    '.aix-go{flex:1;border:0;border-radius:10px;padding:11px;font:inherit;font-weight:600;background:#2dd4bf;color:#042f2e;cursor:pointer}' +
    '.aix-go:disabled{opacity:.5}' +
    '.aix-out{font-size:15px;line-height:1.55}' +
    '.aix-card{min-height:150px;display:flex;align-items:center;justify-content:center;text-align:center;padding:18px;border-radius:14px;border:1px solid rgba(45,212,191,.4);background:#111a2e;cursor:pointer;font-size:17px}' +
    '.aix-card.back{background:rgba(45,212,191,.12)}' +
    '.aix-cc{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px}' +
    '.aix-cc button{border:1px solid rgba(255,255,255,.2);background:transparent;color:inherit;border-radius:10px;padding:8px 14px;font:inherit;cursor:pointer}' +
    '.aix-hint{font-size:13px;opacity:.7;margin-top:6px;text-align:center}';
  document.head.appendChild(css);

  var bar = el('div', 'aix-bar');
  function chip(label, onClick) {
    var b = el('button', 'aix-chip', label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    bar.appendChild(b);
    return b;
  }
  var noteBox = el('div', 'aix-note');
  noteBox.setAttribute('role', 'status');
  var noteTimer = 0;
  function note(msg) {
    noteBox.textContent = msg;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { noteBox.textContent = ''; }, 4000);
  }

  var preview = el('div', 'aix-preview');
  preview.hidden = true;
  var previewImg = el('img');
  previewImg.alt = 'Photo ready to send';
  var previewRemove = el('button', null, 'Remove photo');
  previewRemove.type = 'button';
  preview.appendChild(previewImg);
  preview.appendChild(previewRemove);

  chatForm.parentNode.insertBefore(bar, chatForm);
  chatForm.parentNode.insertBefore(noteBox, chatForm);
  chatForm.parentNode.insertBefore(preview, chatForm);

  // ---------- photo questions ----------
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) return reject(new Error('Please choose an image.'));
      if (file.size > 20 * 1024 * 1024) return reject(new Error('That image is too large.'));
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        function make(max, q) {
          var sc = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * sc);
          c.height = Math.round(img.height * sc);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          return c.toDataURL('image/jpeg', q);
        }
        var out = make(1280, 0.8);
        if (out.length > 1800000) out = make(1024, 0.6);
        if (out.length > 2000000) return reject(new Error('That image is still too big. Try a closer crop.'));
        resolve(out);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Couldn't read that image. Try a JPG, PNG or a screenshot."));
      };
      img.src = url;
    });
  }
  function clearPhoto() {
    pendingImage = null;
    preview.hidden = true;
    previewImg.removeAttribute('src');
  }
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!f) return;
    compressImage(f).then(function (data) {
      pendingImage = data;
      previewImg.src = data;
      preview.hidden = false;
      chatInput.placeholder = 'Add a note about the photo (optional)';
      chatInput.focus();
    }, function (e) { note(e.message); });
  });
  previewRemove.addEventListener('click', clearPhoto);

  // ---------- voice input ----------
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, listening = false, voiceBase = '';

  // ---------- chips ----------
  var photoChip = chip('Photo', function () { if (!busy) fileInput.click(); });
  var voiceChip = chip('Voice', function () {
    if (!SR) return;
    if (listening && rec) { rec.stop(); return; }
    try {
      rec = new SR();
      rec.lang = navigator.language || 'en-US';
      rec.interimResults = true;
      rec.continuous = false;
      voiceBase = chatInput.value.trim();
      rec.onstart = function () { listening = true; voiceChip.textContent = 'Listening...'; voiceChip.classList.add('on'); };
      rec.onresult = function (e) {
        var t = '';
        for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        chatInput.value = (voiceBase ? voiceBase + ' ' : '') + t;
        autosize();
      };
      rec.onerror = function (e) {
        note(e.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in your browser settings.' : 'Voice input stopped. Try again.');
      };
      rec.onend = function () { listening = false; voiceChip.textContent = 'Voice'; voiceChip.classList.remove('on'); };
      rec.start();
    } catch (e) { note('Voice input is not available on this device.'); }
  });
  if (!SR) voiceChip.hidden = true;

  var toolsChip = chip('Summaries & flashcards', function () { openTools(); });
  chip('Quiz me', function () { submit('Start quiz mode. Ask me which course or topic I want, then quiz me one question at a time.'); });
  chip('Study plan', function () { submit('Build me a day-by-day study plan from today until my exam date.'); });
  chip('My weak areas', function () { submit('Based on my test results, which courses am I weakest in, and what should I study next?'); });
  chip('Explain simply', function () {
    chatInput.value = 'Explain this topic simply: ';
    autosize();
    chatInput.focus();
    chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
  });

  // ---------- study tools: summaries and flashcards ----------
  var modal = el('div', 'aix-modal');
  modal.hidden = true;
  modal.innerHTML =
    '<div class="aix-panel" role="dialog" aria-label="Summaries and flashcards">' +
    '<div class="aix-ph"><strong>Summaries and flashcards</strong><button type="button" class="aix-x" aria-label="Close">&times;</button></div>' +
    '<input class="aix-search" type="search" placeholder="Search your materials">' +
    '<select class="aix-select" size="6" aria-label="Choose a material"></select>' +
    '<div class="aix-row"><button type="button" class="aix-go" data-a="summary">Summarise</button><button type="button" class="aix-go" data-a="flashcards">Flashcards</button></div>' +
    '<div class="aix-out" aria-live="polite"></div></div>';
  document.body.appendChild(modal);

  var mSearch = modal.querySelector('.aix-search');
  var mSelect = modal.querySelector('.aix-select');
  var mOut = modal.querySelector('.aix-out');
  var mGo = modal.querySelectorAll('.aix-go');
  var materials = [], materialsLoaded = false;

  function closeTools() { modal.hidden = true; }
  modal.querySelector('.aix-x').addEventListener('click', closeTools);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeTools(); });

  function fillOptions() {
    var q = mSearch.value.trim().toLowerCase();
    mSelect.innerHTML = '';
    materials.filter(function (m) {
      return !q || ((m.title || '') + ' ' + (m.course || '') + ' ' + (m.topic || '')).toLowerCase().indexOf(q) > -1;
    }).slice(0, 200).forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = (m.course ? m.course + ' - ' : '') + (m.title || 'Untitled');
      mSelect.appendChild(o);
    });
  }
  mSearch.addEventListener('input', fillOptions);

  async function openTools() {
    modal.hidden = false;
    if (materialsLoaded) return;
    mOut.textContent = 'Loading your materials...';
    try {
      var r = await sb.from('materials').select('id,title,course,topic,file_url').order('created_at', { ascending: false }).limit(300);
      if (r.error) throw r.error;
      materials = (r.data || []).filter(function (m) { return /\.(pdf|pptx|docx)(\?|#|$)/i.test(m.file_url || ''); });
      materialsLoaded = true;
      mOut.textContent = materials.length ? 'Pick a material, then choose Summarise or Flashcards.' : 'No materials are available yet.';
    } catch (e) {
      mOut.textContent = "Couldn't load materials. Check your connection and try again.";
    }
    fillOptions();
  }

  function setGo(disabled) { mGo.forEach(function (b) { b.disabled = disabled; }); }

  mGo.forEach(function (b) {
    b.addEventListener('click', async function () {
      var id = mSelect.value;
      var action = b.getAttribute('data-a');
      if (!id) { mOut.textContent = 'Choose a material first.'; return; }
      var title = mSelect.options[mSelect.selectedIndex].textContent;
      mOut.textContent = 'Working on it. This can take up to a minute...';
      setGo(true);
      try {
        var token = await getToken();
        if (!token) { window.location.replace('/auth.html?mode=login'); return; }
        var res = await fetch('/api/study-tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ action: action, material_id: id })
        });
        var data = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error(data.error || 'Something went wrong (' + res.status + ').');
        if (action === 'summary') showSummary(data, title); else showCards(data.cards, data.clipped);
      } catch (e) {
        mOut.textContent = e.message || 'Something went wrong. Please try again.';
      } finally { setGo(false); }
    });
  });

  function showSummary(d, title) {
    var md = d.summary;
    if (d.key_points && d.key_points.length) md += '\n\n#### Key points\n' + d.key_points.map(function (p) { return '- ' + p; }).join('\n');
    if (d.likely_questions && d.likely_questions.length) md += '\n\n#### Likely exam questions\n' + d.likely_questions.map(function (q, i) { return (i + 1) + '. ' + q; }).join('\n');
    mOut.innerHTML = renderMarkdown(md);
    if (d.clipped) mOut.appendChild(el('p', 'aix-hint', 'This PDF is long, so only the first part was used.'));
    var ask = el('button', 'aix-go', 'Ask the assistant about this');
    ask.type = 'button';
    ask.style.marginTop = '12px';
    ask.addEventListener('click', function () {
      closeTools();
      chatInput.value = 'I just read the summary of "' + title + '". Quiz me on it, one question at a time.';
      autosize();
      chatInput.focus();
    });
    mOut.appendChild(ask);
  }

  function showCards(cards, clipped) {
    var deck = cards.slice(), i = 0, flipped = false;
    mOut.innerHTML = '';
    var card = el('div', 'aix-card');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    var counter = el('span');
    var prev = el('button', null, 'Back');
    var next = el('button', null, 'Next');
    var shuffle = el('button', null, 'Shuffle');
    [prev, next, shuffle].forEach(function (b) { b.type = 'button'; });
    var ctl = el('div', 'aix-cc');
    ctl.appendChild(prev); ctl.appendChild(counter); ctl.appendChild(shuffle); ctl.appendChild(next);
    mOut.appendChild(card);
    mOut.appendChild(ctl);
    mOut.appendChild(el('p', 'aix-hint', 'Tap the card to flip it.' + (clipped ? ' Only the first part of this long PDF was used.' : '')));
    function draw() {
      card.classList.toggle('back', flipped);
      card.innerHTML = renderMarkdown(flipped ? deck[i].back : deck[i].front);
      counter.textContent = (i + 1) + ' / ' + deck.length;
    }
    function flip() { flipped = !flipped; draw(); }
    card.addEventListener('click', flip);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    prev.addEventListener('click', function () { i = (i - 1 + deck.length) % deck.length; flipped = false; draw(); });
    next.addEventListener('click', function () { i = (i + 1) % deck.length; flipped = false; draw(); });
    shuffle.addEventListener('click', function () {
      for (var k = deck.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1)), t = deck[k]; deck[k] = deck[j]; deck[j] = t;
      }
      i = 0; flipped = false; draw();
    });
    draw();
  }

  // ---------- events ----------
  chatForm.addEventListener('submit', function (e) { e.preventDefault(); submit(chatInput.value); });

  sendBtn.addEventListener('click', function () {
    if (busy) { if (controller) controller.abort(); }
    else chatForm.requestSubmit();
  });

  chatInput.addEventListener('input', autosize);
  chatInput.addEventListener('keydown', function (e) {
    // Desktop: Enter sends, Shift+Enter = new line. Touch keyboards: Enter = new line.
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(pointer: fine)').matches) {
      e.preventDefault();
      if (!busy) chatForm.requestSubmit();
    }
  });

  document.querySelectorAll('.prompt-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var text = card.getAttribute('data-prompt') || '';
      if (card.getAttribute('data-mode') === 'send') { submit(text); return; }
      chatInput.value = text;
      autosize();
      chatInput.focus();
      chatInput.setSelectionRange(text.length, text.length);
    });
  });

  newChatBtn.addEventListener('click', newChat);

  function syncOnline() { offlineBanner.hidden = navigator.onLine; }
  window.addEventListener('online', syncOnline);
  window.addEventListener('offline', syncOnline);
  syncOnline();

  // ---------- start: check login, load the saved chat, then handle "?ask=" links ----------
  (async function init() {
    var ask = '';
    try {
      var s = await sb.auth.getSession();
      if (!s.data.session) { window.location.replace('/auth.html?mode=login'); return; }
      userId = s.data.session.user.id;
      sb.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_OUT') window.location.replace('/auth.html?mode=login');
      });
      await loadHistory();
    } finally {
      loading = false;
    }
    try {
      var params = new URLSearchParams(window.location.search);
      ask = (params.get('ask') || '').slice(0, 1000);
      if (ask) window.history.replaceState(null, '', window.location.pathname);
    } catch (e) { ask = ''; }
    if (ask) submit(ask);
  })();
})();
