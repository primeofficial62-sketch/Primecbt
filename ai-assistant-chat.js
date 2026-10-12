// PRIME-CBT AI Study Assistant - browser chat script (loaded by ai-assistant.html)
// Talks to the server function at /api/assistant

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

  var history = [];          // [{id?, role:'user'|'assistant', content}]
  var busy = false;
  var loading = true;        // true while the saved chat is loading
  var controller = null;
  var userId = null;
  var persist = true;        // flips to false if the ai_messages table doesn't exist yet

  // ---------- helpers ----------
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

  // ---------- tiny safe markdown renderer (escapes HTML first) ----------
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
  function renderMarkdown(src) {
    return src.split('```').map(function (part, i) {
      if (i % 2 === 1) {
        var code = part.replace(/^[^\n]*\n/, '').replace(/\n$/, '');
        return '<pre><code>' + esc(code) + '</code></pre>';
      }
      return renderBlocks(part);
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
  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'message user';
    el.textContent = text;
    chatStream.appendChild(el);
    scrollToBottom();
  }
  function addAssistantBubble() {
    var el = document.createElement('div');
    el.className = 'message assistant';
    el.innerHTML = '<span class="typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>';
    chatStream.appendChild(el);
    scrollToBottom();
    return el;
  }
  function addError(msg) {
    var el = document.createElement('div');
    el.className = 'message error';
    var span = document.createElement('span');
    span.textContent = msg;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'retry-btn';
    btn.textContent = 'Retry';
    btn.addEventListener('click', function () {
      if (busy) return;
      el.remove();
      requestReply();
    });
    el.appendChild(span);
    el.appendChild(btn);
    chatStream.appendChild(el);
    scrollToBottom();
  }

  // Final render of a finished assistant reply (text + Copy button)
  function finishAssistant(bubble, text) {
    bubble.innerHTML = renderMarkdown(text);
    bubble.dataset.raw = text;
    var bar = document.createElement('div');
    bar.className = 'msg-actions';
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'act-btn';
    copy.textContent = 'Copy';
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
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'act-btn regen-btn';
    btn.textContent = 'Regenerate';
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
      var s = await sb.auth.getSession();
      var session = s && s.data && s.data.session;
      if (!session) { window.location.replace('/auth.html?mode=login'); return; }

      var res = await fetch('/api/assistant', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body: JSON.stringify({
          messages: history.slice(-20).map(function (m) { return { role: m.role, content: m.content }; }),
          today: ymd(new Date())
        })
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
    if (!text || busy || loading) return;
    showIntro(false);
    addUser(text);
    var entry = { role: 'user', content: text };
    history.push(entry);
    chatInput.value = '';
    autosize();
    saveMessage('user', text).then(function (id) { entry.id = id; });
    requestReply();
  }

  async function newChat() {
    if (controller) controller.abort();
    history = [];
    chatStream.innerHTML = '';
    showIntro(true);
    chatInput.value = '';
    autosize();
    chatInput.focus();
    if (persist && userId) {
      try { await sb.from('ai_messages').delete().eq('user_id', userId); } catch (e) { /* best effort */ }
    }
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

  // ---------- start: check login, then load the saved chat ----------
  (async function init() {
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
  })();
})();
