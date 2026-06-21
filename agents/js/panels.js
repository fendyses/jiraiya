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

// LANG and REPO_SYS loaded from ../main/repos.js
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
    el.innerHTML=`
      <div class="flex items-center gap-1.5">
        <span class="font-bold text-xs tracking-wide truncate" style="color:${r.active?'#D4A017':'#fff'}">${r.name}</span>
        ${r.active?'<span class="mono text-[8px] text-yellow-500/70 ml-1">● ACTIVE</span>':''}
        <div class="flex gap-1 ml-auto flex-shrink-0">
          <button class="repo-btn vs" title="Open in VS Code">${VSCODE_SVG}</button>
          <button class="repo-btn cli" title="Open CLI here">${CLI_SVG}</button>
        </div>
      </div>
      <div class="flex flex-wrap gap-1">${badges}</div>`;
    const vsBtn=el.querySelector('.repo-btn.vs');
    const cliBtn=el.querySelector('.repo-btn.cli');
    vsBtn.addEventListener('click',e=>{ e.stopPropagation(); openInVSCode(r); });
    cliBtn.addEventListener('click',e=>{ e.stopPropagation(); openCLI(r,cliBtn); });
    list.appendChild(el);
  });
}
const VSCODE_SVG='<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M17 2 7 11l-4-3-2 1 4 4-4 4 2 1 4-3 10 9 5-2V4l-5-2Zm1 5v10l-7-5 7-5Z" fill="#3aa0ff" opacity=".75"/></svg>';
const CLI_SVG='<img src="assets/pics/claude-logo.svg" width="11" height="11" style="opacity:.8">';

