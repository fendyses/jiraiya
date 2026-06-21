// ════════════════════════════════════════════════════════
// SYSTEM MONITORS — live CPU / RAM / storage / network
// ════════════════════════════════════════════════════════
const MON_LEN=48;
const monHist={cpu:[],down:[],up:[]};
const MON_ICONS={
  cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none" opacity=".3"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
  ram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="2" y="7" width="20" height="10" rx="1.5"/><path d="M6 7V5M10 7V5M14 7V5M18 7V5"/><rect x="5" y="10" width="3" height="4" rx=".5" fill="currentColor" stroke="none" opacity=".35"/><rect x="10.5" y="10" width="3" height="4" rx=".5" fill="currentColor" stroke="none" opacity=".35"/><rect x="16" y="10" width="3" height="4" rx=".5" fill="currentColor" stroke="none" opacity=".35"/></svg>',
  disk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" opacity=".35"/><path d="M12 3a9 9 0 0 1 9 9" opacity=".5"/></svg>',
  net:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v11M7 15l-3.2-3.2M7 15l3.2-3.2M17 20V9M17 9l-3.2 3.2M17 9l3.2 3.2"/></svg>'
};
function fmtBytes(b){
  if(b>=1099511627776) return (b/1099511627776).toFixed(b>=10995116277760?0:1)+' TB';
  if(b>=1073741824)    return (b/1073741824).toFixed(b>=107374182400?0:1)+' GB';
  if(b>=1048576)       return (b/1048576).toFixed(0)+' MB';
  return (b/1024).toFixed(0)+' KB';
}
function fmtRate(bps){
  if(bps>=1048576) return (bps/1048576).toFixed(1)+' MB/s';
  if(bps>=1024)    return (bps/1024).toFixed(1)+' KB/s';
  return Math.round(bps)+' B/s';
}
function monPush(arr,v){ arr.push(v); if(arr.length>MON_LEN) arr.shift(); }
function buildMonitors(){
  const cg=document.getElementById('cardGrid');
  cg.innerHTML=`
    <div class="mon" style="--mc:#ff5a4d">
      <div class="mon-head"><div class="mon-ico">${MON_ICONS.cpu}</div><div class="mon-title">CPU LOADS</div></div>
      <canvas class="mon-spark" id="cpuSpark"></canvas>
      <div class="mon-big" id="cpuBig" style="margin-top:9px">—% LOAD</div>
      <div class="mon-sub" id="cpuSub">Core Avg: —</div>
    </div>
    <div class="mon" style="--mc:#3a9bff;--mc2:#1e5fd0">
      <div class="mon-head"><div class="mon-ico">${MON_ICONS.ram}</div><div class="mon-title">RAM USED</div></div>
      <div class="mon-bar" style="margin-bottom:11px"><div class="mon-bar-fill" id="ramFill"></div><div class="mon-bar-pct" id="ramPct">—%</div></div>
      <div class="mon-big" id="ramBig">— / —</div>
      <div class="mon-sub" id="ramSub">—% USED</div>
    </div>
    <div class="mon" style="--mc:#4dd980;--mc2:#23a557">
      <div class="mon-head"><div class="mon-ico">${MON_ICONS.disk}</div><div class="mon-title">STORAGE</div></div>
      <div class="mon-bar" style="margin-bottom:11px"><div class="mon-bar-fill" id="diskFill"></div><div class="mon-bar-pct" id="diskPct">—%</div></div>
      <div class="mon-big" id="diskBig">— / —</div>
      <div class="mon-sub" id="diskSub">—% USED</div>
    </div>
    <div class="mon" style="--mc:#8a8fa3">
      <div class="mon-head"><div class="mon-ico">${MON_ICONS.net}</div><div class="mon-title">NETWORK</div></div>
      <div class="mon-net-row">
        <div class="mon-net-info">
          <div class="mon-net-rate"><span class="mon-arrow" style="color:#4dd980">↓</span><span id="downRate">—</span></div>
          <div class="mon-net-lbl" style="color:#4dd980">Current Down</div>
        </div>
        <canvas class="mon-spark" id="downSpark" style="flex:1;height:42px"></canvas>
      </div>
      <div class="mon-net-row">
        <div class="mon-net-info">
          <div class="mon-net-rate"><span class="mon-arrow" style="color:#3a9bff">↑</span><span id="upRate">—</span></div>
          <div class="mon-net-lbl" style="color:#3a9bff">Current Up</div>
        </div>
        <canvas class="mon-spark" id="upSpark" style="flex:1;height:42px"></canvas>
      </div>
    </div>`;
  pollSystemStats();
  setInterval(pollSystemStats,1500);
}
function drawSpark(canvas,data,color,maxOverride){
  if(!canvas) return;
  const dpr=window.devicePixelRatio||1, w=canvas.clientWidth, h=canvas.clientHeight;
  if(!w||!h) return;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  const ctx=canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  if(data.length<2) return;
  const max=Math.max(maxOverride||0,...data,1e-6), n=data.length, stepX=w/(MON_LEN-1), x0=w-(n-1)*stepX;
  const y=v=>h-3-(v/max)*(h-7);
  ctx.beginPath(); ctx.moveTo(x0,h);
  data.forEach((v,i)=>ctx.lineTo(x0+i*stepX,y(v)));
  ctx.lineTo(x0+(n-1)*stepX,h); ctx.closePath();
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,color+'66'); g.addColorStop(1,color+'05');
  ctx.fillStyle=g; ctx.fill();
  ctx.beginPath();
  data.forEach((v,i)=>{const px=x0+i*stepX,py=y(v); i?ctx.lineTo(px,py):ctx.moveTo(px,py);});
  ctx.lineWidth=1.6; ctx.strokeStyle=color; ctx.shadowColor=color; ctx.shadowBlur=6; ctx.stroke(); ctx.shadowBlur=0;
}
async function pollSystemStats(){
  let s;
  try{ const r=await fetch('system-stats.php',{cache:'no-store'}); if(!r.ok) throw 0; s=await r.json(); }
  catch(e){ const sub=document.getElementById('cpuSub'); if(sub) sub.textContent='stats endpoint offline'; return; }
  // CPU
  monPush(monHist.cpu,s.cpu.pct);
  document.getElementById('cpuBig').textContent=Math.round(s.cpu.pct)+'% LOAD';
  document.getElementById('cpuSub').textContent='Core Avg: '+Math.round(s.cpu.pct)+'%';
  drawSpark(document.getElementById('cpuSpark'),monHist.cpu,'#ff5a4d',100);
  // RAM
  const rp=Math.round(s.ram.pct);
  document.getElementById('ramFill').style.width=s.ram.pct+'%';
  document.getElementById('ramPct').textContent=rp+'%';
  document.getElementById('ramBig').textContent=fmtBytes(s.ram.usedBytes)+' / '+fmtBytes(s.ram.totalBytes);
  document.getElementById('ramSub').textContent=rp+'% USED';
  // Storage
  const dp=Math.round(s.disk.pct);
  document.getElementById('diskFill').style.width=s.disk.pct+'%';
  document.getElementById('diskPct').textContent=dp+'%';
  document.getElementById('diskBig').textContent=fmtBytes(s.disk.usedBytes)+' / '+fmtBytes(s.disk.totalBytes);
  document.getElementById('diskSub').textContent=dp+'% USED';
  // Network
  monPush(monHist.down,s.net.downBps); monPush(monHist.up,s.net.upBps);
  document.getElementById('downRate').textContent=fmtRate(s.net.downBps);
  document.getElementById('upRate').textContent=fmtRate(s.net.upBps);
  drawSpark(document.getElementById('downSpark'),monHist.down,'#4dd980');
  drawSpark(document.getElementById('upSpark'),monHist.up,'#3a9bff');
}
