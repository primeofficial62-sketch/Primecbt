(() => {
  'use strict';
  const SUPABASE_URL = 'https://xuofkjjhupgmrphzgyun.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name) => ({
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    study:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H21v17H6.5A3.5 3.5 0 0 0 3 22z"/><path d="M3 5.5v13A3.5 3.5 0 0 1 6.5 15H21"/></svg>',
    test:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8M14 10h3M8 15l1.5 1.5L12 14M14 16h3"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z"/></svg>',
    more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 4.5v14A2.5 2.5 0 0 1 6.5 16H20"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>',
    file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>',
    monitor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    group:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></svg>',
    spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    store:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10h18l-2-7H5zM5 10v11h14V10M9 21v-7h6v7"/></svg>',
    settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 1.8z"/></svg>'
  })[name] || '';
  function hydrateIcons() {
    const names={BELL:'bell',USER:'user',ARROW:'arrow',MONITOR:'monitor',BOOK:'book',STORE:'store',PLAY:'play',FILE:'file',SPARK:'spark',SEARCH:'search',GROUP:'group',SETTINGS:'settings',HOME:'home'};
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{const raw=node.nodeValue.trim();const key=raw.startsWith('{{')&&raw.endsWith('}}')?raw.slice(2,-2):'';if(!names[key])return;const template=document.createElement('template');template.innerHTML=icon(names[key]);const svg=template.content.firstElementChild;if(svg)node.replaceWith(svg);});
  }
  function toast(message, error=false) {
    let el = $('toast');
    if (!el) { el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el); }
    el.textContent=message;el.style.color=error?'#F87171':'#F4F6FC';el.classList.remove('hidden');
    clearTimeout(window.__primeToastTimer);window.__primeToastTimer=setTimeout(()=>el.classList.add('hidden'),3200);
  }
  async function requireExternalProfile() {
    const {data,error}=await db.auth.getSession();
    const session=data?.session;
    if(error || !session?.user){location.replace('auth.html?mode=login');return null;}
    const user=session.user;
    const meta=user.user_metadata||{};
    const name=String(meta.full_name||meta.name||user.email?.split('@')[0]||'Student').slice(0,100);
    const {error:profileError}=await db.from('external_exam_profiles').upsert({
      user_id:user.id,full_name:name,email:user.email||null,updated_at:new Date().toISOString()
    },{onConflict:'user_id',ignoreDuplicates:true});
    if(profileError){console.error('[external] profile bootstrap failed',profileError);toast('We could not prepare your External Exams profile. Please try again.',true);return null;}
    return {user,session};
  }
  function mountNav(active) {
    const nav=$('bottomNav');if(!nav)return;
    const items=[['home','Home','home.html'],['study','Study','study.html'],['test','Test','test.html'],['chat','Chat','chat.html'],['more','More','more.html']];
    nav.innerHTML=items.map(([key,label,url])=>'<a class="nav-item '+(active===key?'active':'')+'" href="'+url+'" '+(active===key?'aria-current="page"':'')+'>'+icon(key)+'<span>'+label+'</span></a>').join('');
  }
  function mountQuickActions() {
    const fab=$('quickPlus'),sheet=$('quickSheet');
    if(!fab||!sheet)return;
    fab.addEventListener('click',()=>{sheet.classList.toggle('hidden');fab.setAttribute('aria-expanded',String(!sheet.classList.contains('hidden')));});
    sheet.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(!a)return;const action=a.dataset.action;const target={buy:'more.html#school-store',exam:'test.html',ask:'chat.html?tab=question',post:'chat.html?tab=question',group:'chat.html?tab=groups',mimi:'chat.html?tab=mimi'}[action];if(target)location.href=target;});
  }
  async function boot(active) {
    const profile=await requireExternalProfile();
    if(!profile)return null;
    mountNav(active);mountQuickActions();
    const name=$('studentName');if(name)name.textContent=profile.user.user_metadata?.full_name||profile.user.email?.split('@')[0]||'Student';
    const logout=$('logoutButton');if(logout)logout.addEventListener('click',async()=>{await db.auth.signOut();location.replace('auth.html?mode=login');});
    return profile;
  }
  const subjectLabel=(s)=>s.name||'Subject';
  async function initHome() {
    const profile=await boot('home');if(!profile)return;
    const updates=await db.from('external_exam_updates').select('id,update_type,title,summary,starts_at,published_at').eq('is_published',true).order('published_at',{ascending:false}).limit(8);
    const events=(updates.data||[]).filter(x=>x.update_type==='event');
    const news=(updates.data||[]).filter(x=>x.update_type==='news');
    const ev=$('eventsList'),nw=$('newsList');
    if(ev)ev.innerHTML=events.length?events.map(x=>'<article class="event-card"><div class="event-date">'+esc(x.starts_at?new Date(x.starts_at).toLocaleDateString():'UPCOMING')+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.summary||'PRIME-CBT examination update')+'</p></article>').join(''):'<div class="empty-state" style="min-width:100%"><strong>No upcoming events yet</strong>New mock examinations and revision events will appear here.</div>';
    if(nw)nw.innerHTML=news.length?news.map(x=>'<article class="news-card"><div class="news-thumb">'+icon('file')+'</div><div><h3>'+esc(x.title)+'</h3><p>'+esc(x.summary||'Examination news and announcements')+'</p></div></article>').join(''):'<div class="empty-state" style="min-width:100%"><strong>No news published yet</strong>Verified examination updates will appear here.</div>';
  }
  async function initStudy() {
    await boot('study');
    const subjectsEl=$('subjectsList'),resourcesEl=$('resourcesList'),search=$('resourceSearch'),exam=$('studyExam'),kind=$('resourceKind');
    if(!subjectsEl||!resourcesEl)return;
    let subjects=[];
    async function load(){
      let q=db.from('external_exam_resources').select('id,title,description,exam_code,resource_type,source_year,subject_id,external_url').eq('is_published',true).order('created_at',{ascending:false}).limit(50);
      if(exam.value!=='ALL')q=q.eq('exam_code',exam.value);
      if(kind.value!=='ALL')q=q.eq('resource_type',kind.value);
      const [r,s]=await Promise.all([q,db.from('external_exam_subjects').select('id,name,exam_code').eq('is_active',true).order('sort_order')]);
      subjects=s.data||[];
      const requestedType=new URLSearchParams(location.search).get('type');
      if(requestedType&&kind.value==='ALL'&&[...kind.options].some(o=>o.value===requestedType))kind.value=requestedType;
      const term=search.value.trim().toLowerCase();
      const rows=(r.data||[]).filter(x=>!term||(x.title+' '+(x.description||'')).toLowerCase().includes(term));
      subjectsEl.innerHTML=subjects.length?subjects.filter(x=>exam.value==='ALL'||x.exam_code===exam.value).map(x=>'<a class="chip" href="#resources" data-subject="'+x.id+'">'+esc(x.name)+'</a>').join(''):'<div class="empty-state"><strong>Subjects are being prepared</strong>Subjects will appear here as the syllabus is added.</div>';
      resourcesEl.innerHTML=rows.length?rows.map(x=>'<a class="list-card" href="'+(x.external_url?esc(x.external_url):'#')+'" '+(x.external_url?'target="_blank" rel="noopener"':'')+'><span class="feature-icon">'+icon(x.resource_type==='video_lesson'||x.resource_type==='topic_video'?'play':x.resource_type==='workbook'?'book':'file')+'</span><span><h3>'+esc(x.title)+'</h3><p>'+esc(x.exam_code)+' · '+esc(x.resource_type.replaceAll('_',' '))+(x.source_year?' · '+x.source_year:'')+'</p></span><span class="arrow">›</span></a>').join(''):'<div class="empty-state"><strong>No resources published yet</strong>We will show verified past questions, videos, workbooks, novels and lessons here once they are added to the question and learning library.</div>';
    }
    subjectsEl.addEventListener('click',e=>{const a=e.target.closest('[data-subject]');if(!a)return;const selected=subjects.find(x=>x.id===a.dataset.subject);if(selected){search.value=selected.name;load();}});
    [search,exam,kind].forEach(el=>el.addEventListener(el===search?'input':'change',load));
    await load();
  }
  async function initTest() {
    await boot('test');
    const exam=$('examCode'),subjectBox=$('examSubjects'),start=$('startExam'),mode=$('examMode'),count=$('questionCount'),duration=$('examDuration');
    if(!exam||!subjectBox)return;
    const requestedExam=new URLSearchParams(location.search).get('exam');
    if(requestedExam&&[...exam.options].some(o=>o.value===requestedExam))exam.value=requestedExam;
    async function loadSubjects(){
      const {data,error}=await db.from('external_exam_subjects').select('id,name').eq('exam_code',exam.value).eq('is_active',true).order('sort_order');
      if(error){toast('Could not load subjects. Please retry.',true);return;}
      subjectBox.innerHTML=(data||[]).length?(data||[]).map(s=>'<label class="option"><input type="checkbox" value="'+s.id+'"><span>'+esc(s.name)+'</span></label>').join(''):'<div class="empty-state"><strong>No subjects are available yet</strong>Subject lists will appear when the official syllabus data is loaded.</div>';
    }
    exam.addEventListener('change',loadSubjects);await loadSubjects();
    start?.addEventListener('click',async()=>{
      const ids=[...subjectBox.querySelectorAll('input:checked')].map(x=>x.value);
      if(!ids.length){toast('Select at least one subject.',true);return;}
      start.disabled=true;start.textContent='Preparing exam…';
      const {data,error}=await db.rpc('start_external_exam_attempt',{
        p_exam_code:exam.value,p_subject_ids:ids,p_question_count:Number(count.value),
        p_duration_seconds:Number(duration.value),p_mode:mode.value
      });
      start.disabled=false;start.textContent='Start examination';
      if(error){toast(error.message.includes('No published questions')?'Questions for this selection are not available yet. Please try another subject later.':error.message,true);return;}
      location.href='exam.html?attempt='+encodeURIComponent(data);
    });
  }
  async function initExam(){
    const profile=await boot('test');if(!profile)return;
    const attemptId=new URLSearchParams(location.search).get('attempt');
    const title=$('examTitle'),question=$('questionContent'),options=$('answerOptions'),number=$('questionNumber'),prev=$('previousQuestion'),next=$('nextQuestion'),submit=$('submitExam'),timer=$('examTimer'),grid=$('questionGrid');
    if(!attemptId||!question||!options){location.replace('test.html');return;}
    const {data:attempt,error}=await db.from('external_exam_attempts').select('*').eq('id',attemptId).maybeSingle();
    if(error||!attempt){toast('Examination session not found.',true);location.replace('test.html');return;}
    const {data:rows,error:loadError}=await db.from('external_exam_attempt_questions').select('position,question:external_exam_questions(id,question_text,options,image_url)').eq('attempt_id',attemptId).order('position');
    if(loadError||!rows?.length){toast('Could not load examination questions.',true);return;}
    const questions=rows.map(x=>({...x.question,position:x.position}));let current=0;const answers={};
    const {data:savedAnswers}=await db.from('external_exam_attempt_answers').select('question_id,selected_option_index').eq('attempt_id',attemptId);
    (savedAnswers||[]).forEach(a=>{answers[a.question_id]=a.selected_option_index;});
    title.textContent=attempt.exam_code+' CBT Simulator';
    function draw(){
      const q=questions[current];number.textContent='Question '+(current+1)+' of '+questions.length;
      question.textContent=q.question_text;
      options.innerHTML=(q.options||[]).map((opt,i)=>'<label class="option '+(answers[q.id]===i?'selected':'')+'"><input type="radio" name="answer" value="'+i+'" '+(answers[q.id]===i?'checked':'')+'><span><b>'+String.fromCharCode(65+i)+'.</b> '+esc(typeof opt==='string'?opt:opt.text||JSON.stringify(opt))+'</span></label>').join('');
      options.querySelectorAll('input').forEach(input=>input.addEventListener('change',async()=>{answers[q.id]=Number(input.value);draw();const {error}=await db.rpc('save_external_exam_answer',{p_attempt_id:attemptId,p_question_id:q.id,p_selected_option_index:answers[q.id]});if(error)toast('Answer could not be saved: '+error.message,true);}));
      prev.disabled=current===0;next.disabled=current===questions.length-1;
      if(grid)grid.innerHTML=questions.map((item,i)=>'<button type="button" data-q="'+i+'" class="'+(i===current?'current ':'')+(answers[item.id]!==undefined?'answered':'')+'">'+(i+1)+'</button>').join('');
    }
    grid?.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b){current=Number(b.dataset.q);draw();}});
    prev?.addEventListener('click',()=>{if(current>0){current--;draw();}});
    next?.addEventListener('click',()=>{if(current<questions.length-1){current++;draw();}});
    const deadline=new Date(attempt.started_at).getTime()+Number(attempt.duration_seconds)*1000;
    function tick(){const left=Math.max(0,Math.floor((deadline-Date.now())/1000));timer.textContent=[Math.floor(left/3600),Math.floor(left%3600/60),left%60].map(n=>String(n).padStart(2,'0')).join(' : ');if(left===0)submitExam();}
    const interval=setInterval(tick,1000);tick();draw();
    async function submitExam(){
      if(submit.disabled)return;submit.disabled=true;clearInterval(interval);
      const payload=questions.filter(q=>answers[q.id]!==undefined).map(q=>({question_id:q.id,selected_option_index:answers[q.id]}));
      const {data,error}=await db.rpc('grade_external_exam_attempt',{p_attempt_id:attemptId,p_answers:payload});
      if(error){submit.disabled=false;toast(error.message,true);return;}
      location.replace('results.html?attempt='+encodeURIComponent(attemptId));
    }
    submit?.addEventListener('click',()=>{if(confirm('Submit your examination now?'))submitExam();});
  }
  async function initResults(){
    await boot('test');
    const id=new URLSearchParams(location.search).get('attempt');if(!id)return;
    const {data,error}=await db.from('external_exam_attempts').select('*').eq('id',id).maybeSingle();
    if(error||!data){toast('Result not found.',true);return;}
    $('resultScore').textContent=data.score??0;$('resultTotal').textContent=data.total_questions??0;
    $('resultPercent').textContent=(data.total_questions?Math.round((Number(data.score||0)/data.total_questions)*100):0)+'%';
    $('resultExam').textContent=data.exam_code+' examination';
  }
  async function initChat(){
    await boot('chat');
    const tabs=[...document.querySelectorAll('[data-chat-tab]')],feed=$('chatFeed'),form=$('chatForm'),input=$('chatInput'),panel=$('chatPanel');
    let active=new URLSearchParams(location.search).get('tab')||'general';
    async function showTab(tab){
      active=tab;tabs.forEach(b=>b.classList.toggle('active',b.dataset.chatTab===tab));
      if(tab==='mimi'){panel.innerHTML='<div class="empty-state"><strong>Mimi AI</strong>Mimi AI will be connected to the External Exams syllabus, approved learning resources and question explanations in a dedicated integration. It is not connected to the University assistant.</div>';feed.classList.add('hidden');form.classList.add('hidden');return;}
      form.classList.remove('hidden');feed.classList.toggle('hidden',tab==='groups');panel.innerHTML='';
      if(tab==='groups'){const {data}=await db.from('external_exam_groups').select('id,name,description,created_at').order('created_at',{ascending:false}).limit(30);panel.innerHTML='<form id="groupCreateForm" class="panel"><div class="field"><label for="groupName">Create a study group</label><input id="groupName" maxlength="70" minlength="3" placeholder="e.g. JAMB Biology revision" required></div><div class="field"><label for="groupDescription">Description (optional)</label><input id="groupDescription" maxlength="180" placeholder="What will your group study?"></div><button class="btn-primary" type="submit">Create group</button></form>'+((data||[]).length?(data||[]).map(g=>'<div class="list-card"><span class="feature-icon">'+icon('group')+'</span><span><h3>'+esc(g.name)+'</h3><p>'+esc(g.description||'Student study group')+'</p></span><button class="btn-secondary" data-join="'+g.id+'">Join</button></div>').join(''):'<div class="empty-state"><strong>No groups yet</strong>Create the first study group for external exam candidates.</div>');return;}
      const {data,error}=await db.from('external_exam_chat_messages').select('id,channel,content,created_at').eq('channel',tab==='question'?'question':'general').order('created_at',{ascending:false}).limit(40);
      feed.innerHTML=error?'<div class="empty-state"><strong>Chat is unavailable</strong>Please try again later.</div>':(data||[]).length?(data||[]).reverse().map(m=>'<article class="message-card"><div class="message-meta"><span>PRIME-CBT student</span><span>'+new Date(m.created_at).toLocaleString()+'</span></div><p>'+esc(m.content)+'</p></article>').join(''):'<div class="empty-state"><strong>'+ (tab==='question'?'No questions posted yet':'No messages yet')+'</strong>Start a helpful conversation with other external exam students.</div>';
    }
    tabs.forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.chatTab)));
    panel?.addEventListener('click',async e=>{const b=e.target.closest('[data-join]');if(!b)return;const {data:user}=await db.auth.getUser();const {error}=await db.from('external_exam_group_members').insert({group_id:b.dataset.join,user_id:user.user.id});toast(error?(error.code==='23505'?'You already joined this group.':error.message):'You joined the group.');});
    panel?.addEventListener('submit',async e=>{if(e.target.id!=='groupCreateForm')return;e.preventDefault();const {data:user}=await db.auth.getUser();const {data:group,error}=await db.from('external_exam_groups').insert({created_by:user.user.id,name:$('groupName').value.trim(),description:$('groupDescription').value.trim()}).select('id').single();if(error){toast(error.message,true);return;}const {error:joinError}=await db.from('external_exam_group_members').insert({group_id:group.id,user_id:user.user.id});if(joinError){toast('Group created, but membership could not be saved: '+joinError.message,true);return;}toast('Your study group has been created.');showTab('groups');});
    form?.addEventListener('submit',async e=>{e.preventDefault();const content=input.value.trim();if(!content)return;const {data:user}=await db.auth.getUser();const {error}=await db.from('external_exam_chat_messages').insert({user_id:user.user.id,channel:active==='question'?'question':'general',content});if(error){toast(error.message,true);return;}input.value='';showTab(active);});
    await showTab(active);
  }
  async function initMore(){
    const profile=await boot('more');if(!profile)return;
    const name=$('moreName');if(name)name.textContent=profile.user.user_metadata?.full_name||profile.user.email||'External Exams student';
    const email=$('moreEmail');if(email)email.textContent=profile.user.email||'';
    const {data:preferences}=await db.from('external_exam_profiles').select('exam_interests').eq('user_id',profile.user.id).maybeSingle();
    (preferences?.exam_interests||[]).forEach(value=>{const input=document.querySelector('[data-interest][value="'+value+'"]');if(input)input.checked=true;});
    const activationInfo=$('activationInfo');activationInfo?.addEventListener('click',()=>toast('Device activation will be enabled after the payment flow is connected.'));
    const settings=$('savePreferences');settings?.addEventListener('click',async()=>{const checks=[...document.querySelectorAll('[data-interest]:checked')].map(x=>x.value);const {error}=await db.from('external_exam_profiles').update({exam_interests:checks,updated_at:new Date().toISOString()}).eq('user_id',profile.user.id);toast(error?error.message:'Preferences saved.',!!error);});
  }
  hydrateIcons();
  const page=document.body.dataset.page;
  const routes={home:initHome,study:initStudy,test:initTest,exam:initExam,results:initResults,chat:initChat,more:initMore};
  if(routes[page])routes[page]().catch(err=>{console.error(err);toast('Something went wrong loading this page.',true);});
  window.PrimeExternal={db,toast,icon};
})();
