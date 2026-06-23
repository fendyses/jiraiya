'use strict';
// ════════════════════════════════════════════════════════
// HTML PANELS
// ════════════════════════════════════════════════════════
// Agent terminals were removed; their text logic is now a harmless no-op
// (NPC.pushLine guards on a missing term element).
function buildUI(){}
function refreshCard(agent){
  const card=document.getElementById('card-'+agent.name); if(!card)return;
  const dot=card.querySelector('.sdot'),st=card.querySelector('.st-text'),bar=card.querySelector('.power-bar-inner');
  dot.className='sdot '+agent.state;
  st.textContent=agent.state.charAt(0).toUpperCase()+agent.state.slice(1);
  card.classList.toggle('fighting',agent.state==='fighting');
  if(agent.state==='fighting'){st.style.color='#ff5555';bar.style.width='100%';bar.style.background=`linear-gradient(90deg,${agent.color},#ff0000)`;}
  else{st.style.color=agent.color;bar.style.width=(55+Math.random()*38)+'%';bar.style.background=`linear-gradient(90deg,${agent.color},${ADEF[agent.name].glow})`;}
  const mood=(agent.tiredness||0)>0.65?'😴':(agent.tiredness||0)>0.35?'😐':'✨';
  const moodEl=card.querySelector('.mood-badge');
  if(moodEl) moodEl.textContent=mood;
}

// ════════════════════════════════════════════════════════
// CLOCK
// ════════════════════════════════════════════════════════
function tick(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  document.getElementById('clock').textContent=`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  const DAY=['SUN','MON','TUE','WED','THU','FRI','SAT'],MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  document.getElementById('dateDisp').textContent=`${DAY[d.getDay()]} · ${p(d.getDate())} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

// LANG and REPO_SYS are generated server-side from /.env (see dashboard.php head)
function openInVSCode(repo){
  // VSCode registers the vscode:// URL protocol — opens the folder in a window
  showConfirm(repo, ()=>{ window.location.href='vscode://file'+repo.path; });
}
function showConfirm(repo, onYes){
  const ov=document.getElementById('confirmOverlay');
  document.getElementById('cfRepo').textContent=repo.name;
  document.getElementById('cfPath').textContent=repo.path;
  ov.style.display='flex';
  const yes=document.getElementById('cfYes'), no=document.getElementById('cfNo');
  const close=()=>{ ov.style.display='none'; yes.onclick=null; no.onclick=null; document.onkeydown=null; };
  yes.onclick=()=>{ close(); onYes(); };
  no.onclick=close;
  ov.onclick=e=>{ if(e.target===ov) close(); };
  document.onkeydown=e=>{ if(e.key==='Escape')close(); if(e.key==='Enter'){close();onYes();} };
}
// ════════════════════════════════════════════════════════
// DIARY — old book modal (DIARY_DATA from ../daily-diary/diary-data.js)
// ════════════════════════════════════════════════════════
function showDiaryBubble(npc){
  const bubble=document.getElementById('diaryBubble');
  const canvas=document.querySelector('#game-wrap canvas');
  if(!canvas) return;
  npc.summoned=true; npc.vx=0; npc.vy=0; npc.setState('idle');
  const scale=canvas.clientWidth/GW;
  const sx=npc.sprite.x*scale;
  const sy=(npc.sprite.y-npc.sprite.displayHeight)*scale-14;
  bubble.style.left=sx+'px';
  bubble.style.top=sy+'px';
  bubble.style.display='block';
  const yes=document.getElementById('bubbleYes'), no=document.getElementById('bubbleNo');
  const close=()=>{
    bubble.style.display='none'; yes.onclick=null; no.onclick=null; document.onkeydown=null;
    npc.summoned=false; npc.pickTarget();
  };
  yes.onclick=()=>{ close(); openDiaryBook(); };
  no.onclick=close;
  document.onkeydown=e=>{ if(e.key==='Escape')close(); if(e.key==='Enter'){close();openDiaryBook();} };
}
function mdToHtml(md){
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines=md.split('\n');
  let html='',inList=false;
  const closeList=()=>{ if(inList){html+='</ul>';inList=false;} };
  lines.forEach(line=>{
    let l=esc(line);
    l=l.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`(.+?)`/g,'<code>$1</code>');
    if(/^---+$/.test(line.trim())){ closeList(); html+='<hr>'; return; }
    if(/^### /.test(line)){ closeList(); html+='<h3>'+l.replace(/^### /,'')+'</h3>'; return; }
    if(/^## /.test(line)){ closeList(); html+='<h2>'+l.replace(/^## /,'')+'</h2>'; return; }
    if(/^# /.test(line)){ closeList(); html+='<h1>'+l.replace(/^# /,'')+'</h1>'; return; }
    if(/^[-*] /.test(line)){ if(!inList){html+='<ul>';inList=true;} html+='<li>'+l.replace(/^[-*] /,'')+'</li>'; return; }
    closeList();
    if(line.trim()==='') return;
    html+='<p>'+l+'</p>';
  });
  closeList();
  return html;
}
function todayStr(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function fmtDate(s){
  // convert internal YYYY-MM-DD → display DD-MM-YYYY
  const [y,m,dd]=s.split('-');
  return `${dd}-${m}-${y}`;
}
async function openDiaryBook(){
  const ov=document.getElementById('diaryBookOverlay');
  ov.style.display='flex';
  const list=document.getElementById('bookDateList');
  list.innerHTML='<div style="color:#888;font-size:10px;padding:8px">Loading…</div>';
  document.getElementById('bookContent').innerHTML='';
  const close=()=>{ ov.style.display='none'; document.removeEventListener('keydown',escClose); };
  const escClose=e=>{ if(e.key==='Escape') close(); };
  document.getElementById('bookCloseBtn').onclick=close;
  ov.onclick=e=>{ if(e.target===ov) close(); };
  document.addEventListener('keydown',escClose);

  // Try live fetch from diary-index.json + individual .md files
  let data=[];
  try{
    const idxRes=await fetch('../daily-diary/diary-index.json',{cache:'no-store'});
    if(idxRes.ok){
      const index=await idxRes.json();
      const results=await Promise.all(index.map(async item=>{
        try{
          const r=await fetch('../daily-diary/'+item.path,{cache:'no-store'});
          if(!r.ok) return null;
          return {date:item.date, content:await r.text()};
        }catch{return null;}
      }));
      data=results.filter(Boolean);
    }
  }catch{}

  // Fallback to pre-generated DIARY_DATA if fetch fails
  if(!data.length && typeof DIARY_DATA!=='undefined') data=DIARY_DATA;

  list.innerHTML='';
  const today=todayStr();
  let selected=data.find(e=>e.date===today)||data[0];
  data.forEach(entry=>{
    const item=document.createElement('div');
    item.className='book-date-item'+(entry===selected?' active':'');
    item.innerHTML=fmtDate(entry.date)+(entry.date===today?'<span class="today-tag">TODAY</span>':'');
    item.onclick=()=>{
      list.querySelectorAll('.book-date-item').forEach(el=>el.classList.remove('active'));
      item.classList.add('active');
      renderBookContent(entry);
    };
    list.appendChild(item);
  });
  if(selected) renderBookContent(selected);
  else document.getElementById('bookContent').innerHTML='<p>No diary entries found.</p>';
}
function renderBookContent(entry){
  var html=mdToHtml(entry.content).replace(/(\d{4})-(\d{2})-(\d{2})/g,'$3-$2-$1');
  document.getElementById('bookContent').innerHTML=html;
  document.getElementById('bookContent').scrollTop=0;
}
function openCLI(repo, btn){
  btn.classList.add('copied');
  setTimeout(()=>btn.classList.remove('copied'), 900);
  window.location.href='jiraiya-terminal://'+repo.path;
}
function buildRepoPanel(){
  const list=document.getElementById('repoList');
  document.getElementById('repoCount').textContent=REPO_SYS.length+' repos';
  REPO_SYS.forEach(r=>{
    const el=document.createElement('div');
    el.className='repo-item flex flex-col gap-1.5'+(r.active?' active':'');
    const badges=r.langs.map(k=>{
      const L=LANG[k]||{label:k,color:'#888'};
      return `<span class="lang-badge flex items-center gap-1" style="background:${L.color}22;color:${L.color};border:1px solid ${L.color}55">
                <span class="lang-dot" style="background:${L.color}"></span>${L.label}</span>`;
    }).join('');
    const catBadge = r.category
      ? `<span class="repo-cat-badge repo-cat-${r.category.toLowerCase().replace(/\s+/g,'-')}">${r.category}</span>`
      : '';
    el.innerHTML=`
      <div class="flex items-center gap-1.5">
        <span class="font-bold text-xs tracking-wide truncate" style="color:${r.active?'#D4A017':'#fff'}">${r.name}</span>
        ${r.active?'<span class="mono text-[8px] text-yellow-500/70 ml-1">● ACTIVE</span>':''}
        <div class="flex gap-1 ml-auto flex-shrink-0">
          <button class="repo-btn vs" title="Open in VS Code">${VSCODE_SVG}</button>
          <button class="repo-btn cli" title="Open CLI here">${CLI_SVG}</button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-1">${badges}${catBadge ? `<span class="ml-auto">${catBadge}</span>` : ''}</div>`;
    const vsBtn=el.querySelector('.repo-btn.vs');
    const cliBtn=el.querySelector('.repo-btn.cli');
    vsBtn.addEventListener('click',e=>{ e.stopPropagation(); openInVSCode(r); });
    cliBtn.addEventListener('click',e=>{ e.stopPropagation(); openCLI(r,cliBtn); });
    list.appendChild(el);
  });
}
// ════════════════════════════════════════════════════════
// CR — change request log modal (cr.php → /CR/*.md)
// ════════════════════════════════════════════════════════
function showCRBubble(wx, wy, wz) {
  const bubble = document.getElementById('crBubble');
  const canvas = document.getElementById('bg3d');
  if (!bubble || !canvas) return;
  // Project world position (normalized 0..1) onto the displayed canvas size
  if (window._bg3dProject) {
    const n = window._bg3dProject(wx, wy, wz);
    bubble.style.left = (n.x * canvas.clientWidth)  + 'px';
    bubble.style.top  = (n.y * canvas.clientHeight) + 'px';
  } else {
    bubble.style.left = '18%';
    bubble.style.top  = '30%';
  }
  bubble.style.display = 'block';
  const yes = document.getElementById('crBubbleYes');
  const no  = document.getElementById('crBubbleNo');
  const close = () => {
    bubble.style.display = 'none';
    yes.onclick = null; no.onclick = null; document.onkeydown = null;
  };
  yes.onclick = () => { close(); openCRBook(); };
  no.onclick  = close;
  document.onkeydown = e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') { close(); openCRBook(); }
  };
}
function _crEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderCRContent(md) {
  const el = document.getElementById('crBookContent');
  const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let html = '', lines = md.split('\n'), i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^## /.test(line)) {
      html += `<div class="cr-date-header">${_crEsc(line.replace(/^## /,''))}</div>`;
      i++;
    } else if (/^Permohonan CR:/.test(line)) {
      const url = line.replace('Permohonan CR:','').trim();
      let fields = ''; i++;
      while (i < lines.length && !/^---/.test(lines[i]) && !/^## /.test(lines[i]) && !/^Permohonan CR:/.test(lines[i])) {
        const fl = lines[i].trim(); i++;
        if (!fl) continue;
        const m = fl.match(/^(\d+\.\s*[^:]+):\s*(.*)$/);
        fields += m
          ? `<div class="cr-entry-field"><span class="cr-label">${_crEsc(m[1])}:</span>${_crEsc(m[2])}</div>`
          : `<div class="cr-entry-field">${_crEsc(fl)}</div>`;
      }
      html += `<div class="cr-entry"><div class="cr-entry-link">Permohonan CR: ${_crEsc(url)}</div>${fields}</div>`;
    } else if (/^---/.test(line)) {
      html += '<hr class="cr-divider">'; i++;
    } else { i++; }
  }
  el.innerHTML = html || '<p style="color:#4ade80;opacity:.4">No entries.</p>';
  el.scrollTop = 0;
}
async function openCRBook() {
  const ov = document.getElementById('crBookOverlay');
  ov.style.display = 'flex';
  const fileList = document.getElementById('crFileList');
  const content  = document.getElementById('crBookContent');
  fileList.innerHTML = '<div style="color:#4ade80;opacity:.4;font-size:10px;padding:8px">Loading…</div>';
  content.innerHTML  = '';
  const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const close = () => { ov.style.display='none'; document.removeEventListener('keydown', escClose); };
  const escClose = e => { if (e.key==='Escape') close(); };
  document.getElementById('crBookCloseBtn').onclick = close;
  ov.onclick = e => { if (e.target===ov) close(); };
  document.addEventListener('keydown', escClose);
  let data = [];
  try {
    const res = await fetch('cr.php', { cache: 'no-store' });
    if (res.ok) data = await res.json();
  } catch(e) {}
  fileList.innerHTML = '';
  if (!data.length) {
    fileList.innerHTML = '<div style="color:#4ade80;opacity:.4;font-size:10px;padding:8px">No CR records found.</div>';
    return;
  }
  let selected = data[0];
  data.forEach(item => {
    const parts = item.file.split('-');
    const label = (MONTHS[+parts[0]] || parts[0]) + ' ' + (parts[1] || '');
    const el = document.createElement('div');
    el.className = 'cr-file-item' + (item === selected ? ' active' : '');
    el.textContent = label;
    el.onclick = () => {
      fileList.querySelectorAll('.cr-file-item').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      renderCRContent(item.content);
    };
    fileList.appendChild(el);
  });
  if (selected) renderCRContent(selected.content);
}

const VSCODE_SVG='<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M17 2 7 11l-4-3-2 1 4 4-4 4 2 1 4-3 10 9 5-2V4l-5-2Zm1 5v10l-7-5 7-5Z" fill="#3aa0ff" opacity=".75"/></svg>';
const CLI_SVG='<img src="assets/pics/claude-logo.svg" width="11" height="11" style="opacity:.8">';

// ════════════════════════════════════════════════════════
// TODO — date-grouped task list (todo.php)
// ════════════════════════════════════════════════════════
let _todoData={ongoing:[],completed:[]};
let _todoView='ongoing';
async function todoApi(params){
  let url='todo.php',opt={cache:'no-store'};
  if(params.action==='list'){ url+='?action=list'; }
  else { opt.method='POST'; opt.body=new URLSearchParams(params); }
  const r=await fetch(url,opt);
  if(!r.ok) throw new Error('todo '+r.status);
  return r.json();
}
function _ymd(dt){ return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0'); }
function todoDateLabel(d){
  const t=_ymd(new Date()), y=_ymd(new Date(Date.now()-86400000));
  if(d===t) return 'Today';
  if(d===y) return 'Yesterday';
  const dt=new Date(d+'T00:00:00');
  return isNaN(dt)?d:dt.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
}
function todoBadge(){
  const n=(_todoData.ongoing||[]).length;
  const b=document.getElementById('todoDockCount');
  if(b){ if(n){b.textContent=n;b.style.display='';}else{b.style.display='none';} }
  const hc=document.getElementById('todoHeadCount');
  if(hc) hc.textContent=n?('· '+n+' ongoing'):'· all clear';
}
function todoTab(which){
  _todoView=which;
  document.getElementById('todoTabOngoing').classList.toggle('active',which==='ongoing');
  document.getElementById('todoTabDone').classList.toggle('active',which==='done');
  const add=document.querySelector('.todo-add'); if(add) add.style.display=which==='ongoing'?'flex':'none';
  todoRender();
}
function todoGroup(items,key){
  const groups=[],map={};
  items.forEach((it,idx)=>{ const d=it[key]; if(!map[d]){map[d]=[];groups.push([d,map[d]]);} map[d].push({it,idx}); });
  return groups;
}
function todoRender(){
  const list=document.getElementById('todoList'); if(!list) return;
  todoBadge(); list.innerHTML='';
  if(_todoView==='ongoing'){
    const items=_todoData.ongoing||[];
    if(!items.length){ list.innerHTML='<div class="todo-empty">✓ Nothing ongoing — add a task below</div>'; return; }
    todoGroup(items,'date').forEach(([d,arr])=>{
      const h=document.createElement('div'); h.className='todo-date'; h.textContent=todoDateLabel(d); list.appendChild(h);
      arr.forEach(({it,idx})=>list.appendChild(todoRow(it.text,idx,false)));
    });
  } else {
    const items=_todoData.completed||[];
    if(!items.length){ list.innerHTML='<div class="todo-empty">No completed tasks yet</div>'; return; }
    todoGroup(items,'done').forEach(([d,arr])=>{
      const h=document.createElement('div'); h.className='todo-date'; h.textContent=todoDateLabel(d); list.appendChild(h);
      arr.forEach(({it,idx})=>list.appendChild(todoRow(it.text,idx,true)));
    });
  }
}
function todoRow(text,i,done){
  const row=document.createElement('div'); row.className='todo-item'+(done?' is-done':'');
  const t=document.createElement('div'); t.className='todo-txt'; t.textContent=text;
  if(!done){ t.title='Click to edit'; t.onclick=()=>todoEdit(row,i,text); }
  row.appendChild(t);
  const mk=(cls,sym,title,fn)=>{ const e=document.createElement('div'); e.className='todo-ico '+cls; e.textContent=sym; e.title=title; e.onclick=fn; return e; };
  if(!done){
    row.appendChild(mk('done','✓','Mark done',()=>todoDo({action:'complete',i})));
    row.appendChild(mk('del','🗑','Delete',()=>{ if(confirm('Delete this task?')) todoDo({action:'delete',i}); }));
  } else {
    row.appendChild(mk('restore','↺','Move back to ongoing',()=>todoDo({action:'restore',i})));
    row.appendChild(mk('del','🗑','Remove',()=>{ if(confirm('Remove this completed task?')) todoDo({action:'deldone',i}); }));
  }
  return row;
}
function todoEdit(row,i,text){
  const inp=document.createElement('input'); inp.className='todo-edit'; inp.value=text; inp.maxLength=300;
  row.replaceChild(inp,row.querySelector('.todo-txt')); inp.focus(); inp.setSelectionRange(text.length,text.length);
  let saved=false;
  const save=()=>{ if(saved)return; saved=true; const v=inp.value.trim(); if(v&&v!==text) todoDo({action:'update',i,text:v}); else todoRender(); };
  inp.onkeydown=e=>{ if(e.key==='Enter'){e.preventDefault();save();} else if(e.key==='Escape'){saved=true;todoRender();} };
  inp.onblur=save;
}
async function todoDo(params){ try{ _todoData=await todoApi(params); todoRender(); }catch(e){ console.error(e); } }
function todoEsc(e){ if(e.key==='Escape') closeTodo(); }
async function openTodo(){
  const ov=document.getElementById('todoOverlay'); ov.classList.add('open');
  ov.onclick=e=>{ if(e.target===ov) closeTodo(); };
  document.addEventListener('keydown',todoEsc);
  try{ _todoData=await todoApi({action:'list'}); }catch(e){ _todoData={ongoing:[],completed:[]}; }
  todoTab('ongoing');
  const inp=document.getElementById('todoInput'); if(inp) inp.focus();
}
function closeTodo(){
  document.getElementById('todoOverlay').classList.remove('open');
  document.removeEventListener('keydown',todoEsc);
}
async function addTodo(){
  const inp=document.getElementById('todoInput'); const v=inp.value.trim(); if(!v) return;
  inp.value=''; if(_todoView!=='ongoing') _todoView='ongoing';
  await todoDo({action:'add',text:v});
  todoTab('ongoing'); inp.focus();
}
(function(){ const inp=document.getElementById('todoInput');
  if(inp) inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();addTodo();} }); })();
