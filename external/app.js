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
    const names={BELL:'bell',USER:'user',ARROW:'arrow',MONITOR:'monitor',BOOK:'book',STORE:'store',PLAY:'play',FILE:'file',SPARK:'spark',SEARCH:'search',GROUP:'group',SETTINGS:'settings',HOME:'home',CHAT:'chat'};
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const value=node.nodeValue||'';
      if(!/\{\{[A-Z_]+\}\}/.test(value))return;
      const fragment=document.createDocumentFragment();
      let cursor=0;
      value.replace(/\{\{([A-Z_]+)\}\}/g,(match,key,offset)=>{
        if(offset>cursor)fragment.appendChild(document.createTextNode(value.slice(cursor,offset)));
        if(names[key]){
          const template=document.createElement('template');
          template.innerHTML=icon(names[key]);
          const svg=template.content.firstElementChild;
          if(svg){svg.setAttribute('aria-hidden','true');svg.classList.add('inline-icon');fragment.appendChild(svg);}
          else fragment.appendChild(document.createTextNode(match));
        }else fragment.appendChild(document.createTextNode(match));
        cursor=offset+match.length;
        return match;
      });
      if(cursor<value.length)fragment.appendChild(document.createTextNode(value.slice(cursor)));
      node.replaceWith(fragment);
    });
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
      user_id:user.id,full_name:name,email:user.email||null
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
    sheet.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(!a)return;const action=a.dataset.action;const target={buy:'more.html#school-store',exam:'test.html',ask:'chat.html?tab=question',post:'chat.html?tab=question',mimi:'chat.html?tab=mimi'}[action];if(target)location.href=target;});
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
    await db.functions.invoke('external-exam-feed').catch(err=>console.warn('[external] feed refresh skipped',err));
    const userId=profile.user.id;
    const browse=$('examBrowseList'),recommended=$('recommendedSubjects');
    const {data:catalog,error:catalogError}=await db.from('external_exam_subjects').select('id,name,exam_code').eq('is_active',true).order('sort_order').limit(40);
    const subjects=catalog||[];
    if(browse)browse.innerHTML=catalogError?'<div class="empty-state"><strong>Subjects are temporarily unavailable</strong>Please refresh in a moment.</div>':subjects.length?subjects.slice(0,18).map(s=>'<a class="chip" href="study.html?exam='+encodeURIComponent(s.exam_code)+'&subject='+encodeURIComponent(s.id)+'">'+esc(s.exam_code)+' · '+esc(s.name)+'</a>').join(''):'<div class="empty-state"><strong>Subject catalogue is being prepared</strong>Verified subject lists will appear here as they are added.</div>';
    const {data:profilePrefs}=await db.from('external_exam_profiles').select('exam_interests').eq('user_id',userId).maybeSingle();
    const interests=profilePrefs?.exam_interests||[];
    const picks=subjects.filter(s=>interests.includes(s.exam_code)).slice(0,6);
    const recommendations=(picks.length?picks:subjects).slice(0,6);
    if(recommended)recommended.innerHTML=recommendations.length?recommendations.map(s=>'<a class="chip" href="study.html?exam='+encodeURIComponent(s.exam_code)+'&subject='+encodeURIComponent(s.id)+'">'+esc(s.name)+'</a>').join(''):'<a class="chip" href="study.html">Browse study subjects</a>';
    const lastSubject=localStorage.getItem('primeExternalLastStudy');
    const last=subjects.find(s=>s.id===lastSubject);
    const continueLink=$('continueLearning'),continueDescription=$('continueDescription');
    if(last&&continueLink){continueLink.href='study.html?exam='+encodeURIComponent(last.exam_code)+'&subject='+encodeURIComponent(last.id);if(continueDescription)continueDescription.textContent='Continue revising '+last.name+' · '+last.exam_code;}
    const {data:attempts,error:attemptError}=await db.from('external_exam_attempts').select('id,exam_code,status,total_questions,score,started_at,submitted_at').eq('user_id',userId).order('started_at',{ascending:false}).limit(30);
    const allAttempts=attempts||[],completed=allAttempts.filter(a=>a.status==='submitted');
    const avg=completed.length?Math.round(completed.reduce((sum,a)=>sum+(Number(a.total_questions)>0?(Number(a.score||0)/Number(a.total_questions))*100:0),0)/completed.length):null;
    if($('completedCount'))$('completedCount').textContent=attemptError?'—':String(completed.length);
    if($('averageScore'))$('averageScore').textContent=attemptError||avg===null?'—':avg+'%';
    const practiceDates=[...new Set(allAttempts.map(a=>new Date(a.started_at).toLocaleDateString('en-CA')))].sort().reverse();
    let streak=0;
    if(practiceDates.length){const today=new Date();today.setHours(0,0,0,0);const first=new Date(practiceDates[0]+'T00:00:00');const gap=Math.round((today-first)/86400000);if(gap<=1){let expected=new Date(first);for(const date of practiceDates){const day=new Date(date+'T00:00:00');if(Math.round((expected-day)/86400000)===0){streak++;expected.setDate(expected.getDate()-1);}else break;}}}
    if($('studyStreak'))$('studyStreak').textContent=attemptError?'—':streak+' day'+(streak===1?'':'s');
    const recent=$('recentResults');
    if(recent)recent.innerHTML=attemptError?'<div class="empty-state"><strong>Results are temporarily unavailable</strong>Please try again later.</div>':completed.length?completed.slice(0,3).map(a=>{const pct=Number(a.total_questions)>0?Math.round(Number(a.score||0)/Number(a.total_questions)*100):0;return '<a class="result-row" href="results.html?attempt='+encodeURIComponent(a.id)+'"><span class="result-mark">'+esc(a.exam_code)+'</span><span class="result-copy"><strong>'+esc(a.exam_code)+' CBT result</strong><small>'+new Date(a.submitted_at||a.started_at).toLocaleDateString()+' · '+Number(a.score||0)+'/'+Number(a.total_questions||0)+' correct</small></span><span class="result-score">'+pct+'%</span></a>';}).join(''):'<div class="empty-state"><strong>No completed exams yet</strong>Your submitted CBT results will show here after your first attempt.</div>';
    const [eventResult,newsResult]=await Promise.all([
      db.from('external_exam_updates').select('id,title,summary,starts_at,published_at,target_url,source_name').eq('is_published',true).eq('update_type','event').order('starts_at',{ascending:true}).limit(8),
      db.from('external_exam_updates').select('id,title,summary,published_at,target_url,source_name').eq('is_published',true).eq('update_type','news').order('published_at',{ascending:false}).limit(8)
    ]);
    const events=eventResult.data||[],news=newsResult.data||[];
    const ev=$('eventsList'),nw=$('newsList');
    if(ev)ev.innerHTML=eventResult.error?'<div class="empty-state" style="min-width:100%">Events are temporarily unavailable.</div>':events.length?events.map(x=>'<article class="event-card"><div class="event-date">'+esc(x.starts_at?new Date(x.starts_at).toLocaleDateString():'DATE TO BE ANNOUNCED')+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.source_name||'Verified examination source')+'</p>'+(x.target_url?'<a class="section-link" href="'+esc(x.target_url)+'" target="_blank" rel="noopener">Read notice '+icon('arrow')+'</a>':'')+'</article>').join(''):'<div class="empty-state" style="min-width:100%"><strong>No upcoming events yet</strong>New mock examinations and revision events will appear here.</div>';
    if(nw)nw.innerHTML=newsResult.error?'<div class="empty-state" style="min-width:100%">News is temporarily unavailable.</div>':news.length?news.slice(0,6).map(x=>'<a class="news-card" href="'+esc(x.target_url||'news.html')+'" target="_blank" rel="noopener"><div class="news-thumb">'+icon('file')+'</div><div><h3>'+esc(x.title)+'</h3><p>'+esc(x.source_name||'Verified education source')+'</p></div></a>').join(''):'<div class="empty-state" style="min-width:100%"><strong>No news published yet</strong>Verified education and examination updates will appear here.</div>';
    const nextEvent=events.filter(x=>x.starts_at&&/(JAMB|WAEC|NECO|GCE|POST.?UTME|UTME)/i.test(x.title)&&new Date(x.starts_at).getTime()>=Date.now()).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at))[0];
    if($('examCountdown'))$('examCountdown').textContent=nextEvent?Math.max(0,Math.ceil((new Date(nextEvent.starts_at)-Date.now())/86400000))+' days':'To be announced';
    if($('examCountdownDetail'))$('examCountdownDetail').textContent=nextEvent?nextEvent.title+' · '+new Date(nextEvent.starts_at).toLocaleDateString():'We will show a countdown when a verified examination date is published.';
  }
  async function initNews() {
    const profile=await boot('more');if(!profile)return;
    await db.functions.invoke('external-exam-feed').catch(err=>console.warn('[external] feed refresh skipped',err));
    const list=$('newsPageList'),title=$('newsPageTitle');
    const isEvents=new URLSearchParams(location.search).get('tab')==='events';
    if(title)title.textContent=isEvents?'Upcoming Events':'Education & Exam News';
    const {data,error}=await db.from('external_exam_updates').select('id,update_type,title,summary,image_url,target_url,starts_at,published_at,source_name').eq('is_published',true).eq('update_type',isEvents?'event':'news').order(isEvents?'starts_at':'published_at',{ascending:isEvents}).limit(50);
    if(!list)return;
    list.innerHTML=error?'<div class="empty-state"><strong>Updates could not be loaded</strong>Please try again later.</div>':(data||[]).length?(data||[]).map(item=>'<article class="news-page-card"><div class="news-thumb">'+icon('file')+'</div><div><h3>'+esc(item.title)+'</h3><p>'+esc(item.summary||'PRIME-CBT education and examination update')+'</p><time>'+new Date(item.starts_at||item.published_at).toLocaleString()+'</time>'+(item.target_url?'<p><a class="section-link" href="'+esc(item.target_url)+'" target="_blank" rel="noopener">Read source '+icon('arrow')+'</a></p>':'')+'</div></article>').join(''):'<div class="empty-state"><strong>No '+(isEvents?'upcoming events':'news')+' published yet</strong>New verified updates will appear here when they are added.</div>';
  }
  async function initStudy() {
    const profile=await boot('study');if(!profile)return;
    const subjectsEl=$('subjectsList'),topicsEl=$('topicsList'),resourcesEl=$('resourcesList'),countEl=$('subjectCount'),search=$('resourceSearch'),exam=$('studyExam'),kind=$('resourceKind');
    const reader=$('studyReader'),readerTitle=$('studyReaderTitle'),readerMeta=$('studyReaderMeta'),readerBody=$('studyReaderBody'),readerClose=$('studyReaderClose');
    if(!subjectsEl||!resourcesEl)return;
    let subjects=[],resourceRows=[],selectedSubjectId=new URLSearchParams(location.search).get('subject')||null;
    function renderLesson(markdown){
      const lines=String(markdown||'').split(/\r?\n/);let html='',list=[];
      const flush=()=>{if(list.length){html+='<ul>'+list.map(x=>'<li>'+inline(x)+'</li>').join('')+'</ul>';list=[];}};
      const inline=value=>esc(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
      for(const raw of lines){const line=raw.trim();if(!line){flush();continue;}if(line.startsWith('- ')){list.push(line.slice(2));continue;}flush();if(line.startsWith('### '))html+='<h3>'+inline(line.slice(4))+'</h3>';else if(line.startsWith('## '))html+='<h2>'+inline(line.slice(3))+'</h2>';else if(line.startsWith('# '))html+='<h2>'+inline(line.slice(2))+'</h2>';else html+='<p>'+inline(line)+'</p>';}
      flush();return html;
    }
    function openResource(row){
      if(!reader||!readerTitle||!readerBody)return;
      readerTitle.textContent=row.title||'Study resource';
      readerMeta.textContent=[row.exam_code,row.resource_type?.replaceAll('_',' '),row.estimated_minutes?row.estimated_minutes+' min':'',row.is_premium?'PRIME PRO':'Free lesson',row.review_status==='editorial_reviewed'?'Editorially reviewed':'Under review'].filter(Boolean).join(' · ');
      const points=(row.key_points||[]).length?'<section class="lesson-key-points"><h3>Key points to remember</h3><ul>'+row.key_points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul></section>':'';
      readerBody.innerHTML=row.content_markdown?renderLesson(row.content_markdown)+points:'<div class="empty-state"><strong>This material is not available in the on-site library yet.</strong>We publish only resources that have been reviewed and prepared for reading inside PRIME-CBT.</div>';
      if(typeof reader.showModal==='function')reader.showModal();else reader.setAttribute('open','');
    }
    readerClose?.addEventListener('click',()=>reader.close());
    reader?.addEventListener('click',e=>{if(e.target===reader)reader.close();});
    async function load(){
      subjectsEl.innerHTML='<div class="empty-state">Loading subjects…</div>';
      const requestedType=new URLSearchParams(location.search).get('type');
      if(requestedType&&kind.value==='ALL'&&[...kind.options].some(o=>o.value===requestedType))kind.value=requestedType;
      const requestedExam=new URLSearchParams(location.search).get('exam');
      if(requestedExam&&[...exam.options].some(o=>o.value===requestedExam))exam.value=requestedExam;
    if(year){
      year.innerHTML=Array.from({length:37},(_,i)=>2026-i).map(y=>'<option value="'+y+'">'+y+'</option>').join('');
      const requestedYear=Number(params.get('year'));
      year.value=requestedYear>=1990&&requestedYear<=2026?String(requestedYear):'2026';
    }
    if(year){year.innerHTML=Array.from({length:37},(_,i)=>2026-i).map(y=>'<option value="'+y+'">'+y+'</option>').join('');year.value=params.get('year')&&Number(params.get('year'))>=1990&&Number(params.get('year'))<=2026?params.get('year'):'2026';}
      const [s,r]=await Promise.all([
        db.from('external_exam_subjects').select('id,name,exam_code,syllabus_version').eq('is_active',true).order('sort_order'),
        (()=>{let q=db.from('external_exam_resources').select('id,title,description,exam_code,resource_type,source_year,source_label,subject_id,topic_id,is_premium,content_markdown,key_points,learning_objectives,estimated_minutes,review_status').eq('is_published',true).order('created_at',{ascending:false}).limit(100);if(exam.value!=='ALL')q=q.eq('exam_code',exam.value);if(kind.value!=='ALL')q=q.eq('resource_type',kind.value);if(selectedSubjectId)q=q.eq('subject_id',selectedSubjectId);return q;})()
      ]);
      resourceRows=r.data||[];
      if(s.error){subjectsEl.innerHTML='<div class="empty-state"><strong>Could not load the subject catalogue</strong>'+esc(s.error.message)+'</div>';if(countEl)countEl.textContent='Unavailable';}
      else{
        subjects=s.data||[];
        const visible=subjects.filter(x=>exam.value==='ALL'||x.exam_code===exam.value);
        if(countEl)countEl.textContent=visible.length+' subjects';
        if(selectedSubjectId&&!visible.some(x=>x.id===selectedSubjectId))selectedSubjectId=null;
        subjectsEl.classList.add('study-subject-grid');
        subjectsEl.innerHTML=visible.length?visible.map(x=>'<button type="button" class="study-subject-card '+(selectedSubjectId===x.id?'active':'')+'" data-subject="'+x.id+'"><span class="study-subject-icon">'+icon('book')+'</span><span class="study-subject-copy"><strong>'+esc(x.name)+'</strong><small>'+esc(x.exam_code)+'</small></span><span class="study-subject-chevron">'+icon('arrow')+'</span></button>').join(''):'<div class="empty-state"><strong>No subjects are listed for this examination yet</strong>Choose another examination or check back as the verified catalogue is expanded.</div>';
      }
      if(topicsEl){
        if(selectedSubjectId){
          const chosen=subjects.find(x=>x.id===selectedSubjectId);
          const {data:topics,error:topicError}=await db.from('external_exam_topics').select('id,title,description,learning_objectives').eq('subject_id',selectedSubjectId).eq('is_published',true).order('sort_order');
          topicsEl.innerHTML=topicError?'<div class="empty-state"><strong>Topics could not be loaded</strong>'+esc(topicError.message)+'</div>':(topics||[]).length?'<div class="topic-heading"><strong>'+esc(chosen?.name||'Subject')+' topics</strong><span class="small muted">'+topics.length+' topics</span></div>'+(topics||[]).map(t=>{const lesson=resourceRows.find(x=>x.topic_id===t.id);return '<article class="topic-item"><strong>'+esc(t.title)+'</strong>'+(t.description?'<p>'+esc(t.description)+'</p>':'')+(lesson?'<button type="button" class="topic-open" data-resource="'+lesson.id+'">Read lesson '+icon('arrow')+'</button>':'<span class="small muted">Lesson coming soon</span>')+'</article>';}).join(''):'<div class="empty-state"><strong>'+esc(chosen?.name||'This subject')+' is in the catalogue</strong>More topic outlines are being verified before publication.</div>';
        }else topicsEl.innerHTML='<div class="empty-state">Select a subject to see its topics and lessons.</div>';
      }
      if(r.error){resourcesEl.innerHTML='<div class="empty-state"><strong>Study resources could not be loaded</strong>'+esc(r.error.message)+'</div>';return;}
      const term=search.value.trim().toLowerCase();
      const rows=resourceRows.filter(x=>!term||(x.title+' '+(x.description||'')+' '+(x.source_label||'')).toLowerCase().includes(term));
      resourcesEl.innerHTML=rows.length?rows.map(x=>'<button type="button" class="list-card resource-open" data-resource="'+x.id+'"><span class="feature-icon">'+icon(x.resource_type==='video_lesson'||x.resource_type==='topic_video'?'play':x.resource_type==='workbook'?'book':'file')+'</span><span class="resource-card-copy"><h3>'+esc(x.title)+'</h3><p>'+esc(x.exam_code)+' · '+esc(x.resource_type.replaceAll('_',' '))+(x.estimated_minutes?' · '+x.estimated_minutes+' min':'')+(x.is_premium?' · PRIME PRO':'')+'</p></span><span class="arrow">'+icon('arrow')+'</span></button>').join(''):'<div class="empty-state"><strong>No matching lessons yet</strong>Choose another subject or exam. New reviewed lessons will appear here as the library grows.</div>';
    }
    subjectsEl.addEventListener('click',e=>{const b=e.target.closest('[data-subject]');if(!b)return;selectedSubjectId=selectedSubjectId===b.dataset.subject?null:b.dataset.subject;if(selectedSubjectId)localStorage.setItem('primeExternalLastStudy',selectedSubjectId);load();});
    resourcesEl.addEventListener('click',e=>{const b=e.target.closest('[data-resource]');if(b){const row=resourceRows.find(x=>x.id===b.dataset.resource);if(row)openResource(row);}});
    topicsEl?.addEventListener('click',e=>{const b=e.target.closest('[data-resource]');if(b){const row=resourceRows.find(x=>x.id===b.dataset.resource);if(row)openResource(row);}});
    [search,exam,kind].forEach(el=>el.addEventListener(el===search?'input':'change',()=>{selectedSubjectId=null;load();}));
    await load();
  }
  async function initTest() {
    await boot('test');
    const exam=$('examCode'),subjectBox=$('examSubjects'),start=$('startExam'),mode=$('examMode'),count=$('questionCount'),duration=$('examDuration'),year=$('examYear');
    if(!exam||!subjectBox)return;
    const params=new URLSearchParams(location.search);
    const requestedExam=params.get('exam')||document.body.dataset.defaultExam;
    if(requestedExam&&[...exam.options].some(o=>o.value===requestedExam))exam.value=requestedExam;
    const requestedMode=params.get('mode');
    if(requestedMode&&[...mode.options].some(o=>o.value===requestedMode))mode.value=requestedMode;
    document.querySelectorAll('[data-exam-preset]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.examPreset&&[...exam.options].some(o=>o.value===b.dataset.examPreset))exam.value=b.dataset.examPreset;loadSubjects();$('examCode').scrollIntoView({behavior:'smooth',block:'center'});}));
    document.querySelectorAll('[data-mode-preset]').forEach(b=>b.addEventListener('click',()=>{mode.value=b.dataset.modePreset;$('examMode').scrollIntoView({behavior:'smooth',block:'center'});}));
    async function loadSubjects(){
      const {data,error}=await db.from('external_exam_subjects').select('id,name').eq('exam_code',exam.value).eq('is_active',true).order('sort_order');
      if(error){toast('Could not load subjects. Please retry.',true);return;}
      subjectBox.classList.add('subject-selection-grid');
      subjectBox.innerHTML=(data||[]).length?(data||[]).map(s=>'<label class="option subject-option"><input type="checkbox" value="'+s.id+'"><span>'+esc(s.name)+'</span></label>').join(''):'<div class="empty-state"><strong>No subjects are available yet</strong>Subject lists will appear when the official syllabus data is loaded.</div>';
    }
    exam.addEventListener('change',loadSubjects);await loadSubjects();
    start?.addEventListener('click',async()=>{
      const ids=[...subjectBox.querySelectorAll('input:checked')].map(x=>x.value);
      if(!ids.length){toast('Select at least one subject.',true);return;}
      if(!year?.value){toast('Choose an examination year.',true);return;}
      start.disabled=true;start.textContent='Preparing exam…';
      const {data,error}=await db.rpc('start_external_exam_attempt',{
        p_exam_code:exam.value,p_subject_ids:ids,p_question_count:Number(count.value),
        p_duration_seconds:Number(duration.value),p_mode:mode.value,p_exam_year:Number(year?.value||2026)
      });
      start.disabled=false;start.textContent='Start examination';
      if(error){toast(error.message.includes('No published questions')?'No published questions are available for this subject and year yet. Choose another year or check back when verified questions are added.':error.message,true);return;}
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
    const profile=await boot('test');if(!profile)return;
    const id=new URLSearchParams(location.search).get('attempt');
    const detail=$('resultPanel'),history=$('resultHistory');
    if(!id){
      if(detail)detail.classList.add('hidden');
      if(history){
        const {data,error}=await db.from('external_exam_attempts').select('id,exam_code,total_questions,score,started_at,submitted_at').eq('user_id',profile.user.id).eq('status','submitted').order('submitted_at',{ascending:false}).limit(50);
        history.innerHTML=error?'<div class="empty-state"><strong>Results are temporarily unavailable</strong>Please try again later.</div>':(data||[]).length?(data||[]).map(a=>{const pct=Number(a.total_questions)>0?Math.round(Number(a.score||0)/Number(a.total_questions)*100):0;return '<a class="result-row" href="results.html?attempt='+encodeURIComponent(a.id)+'"><span class="result-mark">'+esc(a.exam_code)+'</span><span class="result-copy"><strong>'+esc(a.exam_code)+' examination</strong><small>'+new Date(a.submitted_at||a.started_at).toLocaleDateString()+' · '+Number(a.score||0)+'/'+Number(a.total_questions||0)+' correct</small></span><span class="result-score">'+pct+'%</span></a>';}).join(''):'<div class="empty-state"><strong>No completed exams yet</strong>Finish and submit a CBT session to see your results here.</div>';
      }
      return;
    }
    if(history)history.classList.add('hidden');
    const {data,error}=await db.from('external_exam_attempts').select('*').eq('id',id).eq('user_id',profile.user.id).maybeSingle();
    if(error||!data||data.status!=='submitted'){toast('Completed result not found.',true);if(detail)detail.classList.add('hidden');return;}
    $('resultScore').textContent=data.score??0;$('resultTotal').textContent=data.total_questions??0;
    $('resultPercent').textContent=(data.total_questions?Math.round((Number(data.score||0)/data.total_questions)*100):0)+'%';
    $('resultExam').textContent=data.exam_code+' examination';
  }
  async function initChat(){
    const profile=await boot('chat');if(!profile)return;
    const tabs=[...document.querySelectorAll('[data-chat-tab]')],feed=$('chatFeed'),form=$('chatForm'),input=$('chatInput'),panel=$('chatPanel');
    let active=new URLSearchParams(location.search).get('tab')||'general';
    if(active==='groups')active='general';
    let aiHistory=[];
    function addAiMessage(role,content){
      const item=document.createElement('article');item.className='message-card ai-message '+(role==='model'?'ai-response':'ai-user-message');
      const meta=document.createElement('div');meta.className='message-meta';meta.textContent=role==='model'?'PRIME AI':'You';
      const body=document.createElement('p');body.textContent=content;
      item.append(meta,body);feed.appendChild(item);feed.scrollTop=feed.scrollHeight;
    }
    async function showTab(tab){
      active=tab==='mimi'?'mimi':'general';
      tabs.forEach(b=>b.classList.toggle('active',b.dataset.chatTab===active));
      feed.classList.remove('hidden');form.classList.remove('hidden');
      if(active==='mimi'){
        panel.innerHTML='<section class="prime-ai-welcome"><span class="prime-ai-orb">'+icon('spark')+'</span><div><span class="mini-label">YOUR EXAM STUDY TUTOR</span><h2>PRIME AI</h2><p>Ask questions, understand difficult topics, work through calculations and prepare for JAMB, WAEC and NECO.</p></div></section>';
        if(!feed.dataset.aiStarted){feed.innerHTML='<div class="empty-state ai-empty"><strong>What are you studying today?</strong>Ask PRIME AI to explain a topic, solve a problem step by step or create practice questions.</div>';feed.dataset.aiStarted='true';}
        input.placeholder='Ask PRIME AI a study question…';
        return;
      }
      panel.innerHTML='<section class="group-chat-heading"><span class="feature-icon">'+icon('group')+'</span><div><strong>General Chat</strong><p>One shared conversation for External Exams students. Everyone can see the messages posted here.</p></div></section>';
      input.placeholder='Message the student community…';
      const {data,error}=await db.from('external_exam_chat_messages').select('id,channel,content,created_at,user_id').eq('channel','general').order('created_at',{ascending:false}).limit(80);
      feed.innerHTML=error?'<div class="empty-state"><strong>General Chat is unavailable</strong>Please try again later.</div>':(data||[]).length?(data||[]).reverse().map(m=>'<article class="message-card"><div class="message-meta"><span>'+(m.user_id===profile.user.id?'You':'PRIME-CBT student')+'</span><span>'+new Date(m.created_at).toLocaleString()+'</span></div><p>'+esc(m.content)+'</p></article>').join(''):'<div class="empty-state"><strong>Welcome to General Chat</strong>Start the first conversation with other External Exams students.</div>';
    }
    tabs.forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.chatTab)));
    form?.addEventListener('submit',async e=>{
      e.preventDefault();const content=input.value.trim();if(!content)return;
      const send=form.querySelector('button[type="submit"]');if(send)send.disabled=true;
      if(active==='mimi'){
        const empty=feed.querySelector('.ai-empty');if(empty)empty.remove();
        addAiMessage('user',content);input.value='';
        const thinking=document.createElement('article');thinking.className='message-card ai-thinking';thinking.textContent='PRIME AI is thinking…';feed.appendChild(thinking);
        const {data,error}=await db.functions.invoke('external-exam-ai',{body:{message:content,history:aiHistory,exam:'JAMB, WAEC and NECO',subject:'General study'}});
        thinking.remove();
        if(error||data?.error){addAiMessage('model',data?.error||'PRIME AI is temporarily unavailable. Please try again.');}
        else {aiHistory.push({role:'user',text:content},{role:'model',text:data.answer});aiHistory=aiHistory.slice(-8);addAiMessage('model',data.answer||'I could not prepare an answer. Please try again.');}
      }else{
        const {error}=await db.from('external_exam_chat_messages').insert({user_id:profile.user.id,channel:'general',content});
        if(error)toast(error.message,true);else{input.value='';await showTab('general');}
      }
      if(send)send.disabled=false;
    });
    await showTab(active);
  }
  async function initMore(){
    const profile=await boot('more');if(!profile)return;
    const name=$('moreName');if(name)name.textContent=profile.user.user_metadata?.full_name||profile.user.email||'External Exams student';
    const email=$('moreEmail');if(email)email.textContent=profile.user.email||'';
    const {data:preferences}=await db.from('external_exam_profiles').select('exam_interests,premium_activated_at').eq('user_id',profile.user.id).maybeSingle();
    (preferences?.exam_interests||[]).forEach(value=>{const input=document.querySelector('[data-interest][value="'+value+'"]');if(input)input.checked=true;});
    let premiumActive=!!preferences?.premium_activated_at;
    const premiumStatus=$('premiumStatus');if(premiumStatus)premiumStatus.textContent=premiumActive?'PRIME PRO is active on this account.':'Free account · PRIME PRO unlock is not active yet.';
    const activationInfo=$('activationInfo');activationInfo?.addEventListener('click',()=>toast(premiumActive?'Your PRIME PRO access is active.':'A one-time ₦3,000 Paystack payment unlocks premium study resources and learning features.'));
    const activateButton=$('activatePrimePro');
    const activationRef=new URLSearchParams(location.search).get('activation_ref');
    if(activationRef){
      if(activateButton){activateButton.disabled=true;activateButton.textContent='Verifying payment…';}
      const {data:verification,error:verificationError}=await db.functions.invoke('external-exam-activation-verify',{body:{reference:activationRef}});
      if(!verificationError&&verification?.activated){
        premiumActive=true;
        if(premiumStatus)premiumStatus.textContent='PRIME PRO is active on this account.';
        toast('Payment verified. PRIME PRO is now active.');
      }else if(verificationError){
        toast('We could not verify this payment yet. You can retry from this page.',true);
      }else{
        toast(verification?.status==='pending'?'Payment is still processing. Check again shortly.':'Payment was not completed. You can try again.',verification?.status!=='pending');
      }
      if(activateButton){activateButton.disabled=false;activateButton.textContent=premiumActive?'PRIME PRO active':'Activate PRIME PRO · ₦3,000';}
      if(!verificationError&&(verification?.activated||verification?.status==='failed'||verification?.status==='abandoned'))history.replaceState(null,'','more.html');
    }
    activateButton?.addEventListener('click',async()=>{
      if(premiumActive){toast('PRIME PRO is already active on this account.');return;}
      activateButton.disabled=true;activateButton.textContent='Preparing secure checkout…';
      const {data,error}=await db.functions.invoke('external-exam-activation-init');
      if(error||data?.error){
        toast(data?.error==='payments_not_configured'?'Secure payments are not configured yet. Please contact support.':'Could not start activation. Please try again.',true);
        activateButton.disabled=false;activateButton.textContent='Activate PRIME PRO · ₦3,000';return;
      }
      if(data?.already_active){
        premiumActive=true;if(premiumStatus)premiumStatus.textContent='PRIME PRO is active on this account.';
        activateButton.textContent='PRIME PRO active';activateButton.disabled=false;return;
      }
      if(data?.authorization_url){location.assign(data.authorization_url);return;}
      toast('Secure checkout did not return a payment link.',true);
      activateButton.disabled=false;activateButton.textContent='Activate PRIME PRO · ₦3,000';
    });
    const settings=$('savePreferences');settings?.addEventListener('click',async()=>{const checks=[...document.querySelectorAll('[data-interest]:checked')].map(x=>x.value);const {error}=await db.from('external_exam_profiles').update({exam_interests:checks,updated_at:new Date().toISOString()}).eq('user_id',profile.user.id);toast(error?error.message:'Preferences saved.',!!error);});
  }
  hydrateIcons();
  const page=document.body.dataset.page;
  const routes={home:initHome,study:initStudy,test:initTest,exam:initExam,results:initResults,chat:initChat,more:initMore,news:initNews};
  if(routes[page])routes[page]().catch(err=>{console.error(err);toast('Something went wrong loading this page.',true);});
  window.PrimeExternal={db,toast,icon};
})();
