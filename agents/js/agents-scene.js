'use strict';
// ════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════
const CFG = {
  BATTLE_DIST:64, BATTLE_SECS:20,
  COOLDOWN_MS:9000, POST_BATTLE_MS:3000,
  IDLE_MIN:1400, IDLE_MAX:3600,
  SEP_SPEED:1.6, INIT_COOLDOWN:4500,
};

const ADEF = {
  Jiraiya:{ color:'#D4A017', glow:'#FFD700', speed:48, model:'claude-sonnet-4-6', role:'Orchestrator' },
  Naruto: { color:'#FF6B1A', glow:'#FF9500', speed:72, model:'claude-sonnet-4-6', role:'Code Agent'   },
  Sasuke: { color:'#7B2FFF', glow:'#00BFFF', speed:68, model:'claude-opus-4-8',   role:'Reviewer'     },
  Sakura: { color:'#FF69B4', glow:'#FFB6C1', speed:60, model:'claude-sonnet-4-6', role:'Architect'    },
  Hinata: { color:'#B8A9E3', glow:'#E6E6FA', speed:54, model:'claude-haiku-4-5',  role:'Documentor'   },
};

// atlas key + display scale
const CHAR = {
  Jiraiya:{ atlas:'mPerson', sc:0.72 },
  Naruto: { atlas:'mAdv',    sc:0.66 },
  Sasuke: { atlas:'zombie',  sc:0.66 },
  Sakura: { atlas:'fAdv',    sc:0.66 },
  Hinata: { atlas:'fPerson', sc:0.66 },
};

const MSGS = {
  Jiraiya:{ walking:['> [JIRAIYA] Orchestrating sub-agents...','> Sage Mode: Sensing repo changes...','> Loading memory from main-memory.md...','> Delegating to sub-agents...','> All 4 sub-agents operational.','> Session context synced.'],idle:['> Memory consolidation...','> Awaiting task delegation.','> [IDLE] Monitoring active.'] },
  Naruto: { walking:['> Shadow Clone: Spawning threads...','> Scanning codebase...','> Wind Release: Build boosted!','> [BUILD] 1247 files, dattebayo!','> Running unit tests...'],fighting:['> !! RASENGAN !!','> Optimization INITIATED!','> [FIGHT] MAX FORCE!','> BELIEVE IT — bug eliminated!','> This is my Ninja Way!'] },
  Sasuke: { walking:['> Sharingan: Memorizing arch...','> [REVIEW] 43 issues flagged.','> Mapping dependency graph...','> OWASP scan: 0 critical.','> Analyzing merge conflicts...'],fighting:['> !! CHIDORI !!','> Amaterasu: burning dead code.','> [FIGHT] Piercing monolith!','> Flawless execution.','> Precision over force.'] },
  Sakura: { walking:['> System health diagnostics...','> [ARCH] Planning service layer...','> Blueprint v2 drafted.','> [DESIGN] Schema finalized.','> Scaling strategy updated.'],idle:['> Monitoring vitals...','> [IDLE] All nominal.','> Awaiting arch task.'],fighting:['> !! STRENGTH OF A HUNDRED !!','> Shanaro — medical punch!','> [FIGHT] Precise strike!','> Cherry Blossom Impact!','> Kai! Heal then destroy!'] },
  Hinata: { walking:['> Byakugan: 360° scan...','> Gentle Fist: docs applied.','> Changelog v2.4.1...','> [DOC] Diary generated.','> PR docs updated.'],idle:['> [DOC] Report prepared.','> Docs updated.','> Logging activity...'],fighting:['> !! GENTLE FIST !!','> Byakugan activated!','> [FIGHT] Eight Trigrams!','> 64 Palms — chakra sealed!','> Rotation!'] },
};

const BATTLE_PAIRS=[['Naruto','Sasuke'],['Sakura','Hinata']];

const PETS_DEF=[
  {key:'pet-fox',     file:'assets/kenney_cube-pets_1.0/Previews/animal-fox.png',     scale:0.76, name:'Fox'    },
  {key:'pet-penguin', file:'assets/kenney_cube-pets_1.0/Previews/animal-penguin.png', scale:0.72, name:'Penguin'},
  {key:'pet-cat',     file:'assets/kenney_cube-pets_1.0/Previews/animal-cat.png',     scale:0.76, name:'Cat'    },
];

// ════════════════════════════════════════════════════════
// ASSET PATHS
// ════════════════════════════════════════════════════════
const CP = 'assets/kenney_toon-characters';
const ATLASES = {
  mAdv:    { png:`${CP}/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png`,    xml:`${CP}/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml`    },
  fAdv:    { png:`${CP}/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.png`, xml:`${CP}/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.xml` },
  mPerson: { png:`${CP}/Male person/Tilesheet/character_malePerson_jiraiya.png`,           xml:`${CP}/Male person/Tilesheet/character_malePerson_sheet.xml`             },
  fPerson: { png:`${CP}/Female person/Tilesheet/character_femalePerson_light.png`,         xml:`${CP}/Female person/Tilesheet/character_femalePerson_sheet.xml`         },
  zombie:  { png:`${CP}/Zombie/Tilesheet/character_zombie_sheet.png`,                       xml:`${CP}/Zombie/Tilesheet/character_zombie_sheet.xml`                       },
};
const TOWN_PNG = 'assets/kenney_tiny-town/Tilemap/tilemap_packed.png';

// Tiny-Town tile indices (verified full single tiles against tilemap_packed.png)
const T = {
  grass:0, grassA:1, grassFlower:2, grassPatch:43,
  // full single-tile trees only (no multi-tile halves)
  treeGreen:[4,16,28], treeAutumn:[15,27], bush:[3,5], seedling:17, mush:29,
  // red-roof farmhouse
  roofL:52, roofM:53, roofR:54,
  wallL:64, wallM:65, wallR:66,
  doorWood:[85,86], windowWood:84,
  // blue/stone house
  bRoofL:48, bRoofM:49, bRoofR:50,
  bWallL:60, bWallM:61, bWallR:62,
  bDoor:[89,90,91], stoneWindow:76,
  // fence — clean horizontal rail: left 80, mid 81, right 82
  fenceL:80, fenceM:81, fenceR:82, fencePost:47,
  // dirt path
  pathTop:13, pathMid:25, pathBot:37,
  // decor
  barrel:92, jar:93, pot:94, bucket:107, trough:131, sign:83,
};

// ════════════════════════════════════════════════════════
// SPEECH BUBBLE
// ════════════════════════════════════════════════════════
function spawnBubble(scene, x, y, text){
  const str = text.replace(/^> /,'').substring(0,28);
  const tw  = Math.min(str.length*6+18, 158);
  const g = scene.add.graphics();
  g.fillStyle(0x000000,0.35); g.fillRoundedRect(-tw/2+2,-28,tw,22,5);
  g.fillStyle(0xFFFFFF,0.96); g.fillRoundedRect(-tw/2,-30,tw,22,5);
  g.fillStyle(0xFFFFFF,0.96); g.fillTriangle(-5,-9,5,-9,0,-1);
  const t = scene.add.text(0,-19,str,{fontSize:'8px',fontFamily:'"Share Tech Mono",monospace',color:'#1a1a2e'}).setOrigin(0.5,0.5);
  const c = scene.add.container(x,y,[g,t]).setDepth(9000);
  scene.tweens.add({targets:c,alpha:0,delay:2800,duration:400,onComplete:()=>{if(c.active)c.destroy();}});
  return c;
}

// ════════════════════════════════════════════════════════
// BATTLE FX
// ════════════════════════════════════════════════════════
function fxRasengan(G,x,y,t){
  for(let i=0;i<3;i++){const a=t*4.5+i*2.094,r=14+Math.sin(t*7)*3;
    G.fillStyle(0x88CCFF,0.5);G.fillCircle(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4,r);
    G.fillStyle(0xFFFFFF,0.7);G.fillCircle(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4,r*.35);}
  G.fillStyle(0xFFFFFF,0.9);G.fillCircle(x,y,10);G.fillStyle(0x55AAFF,0.5);G.fillCircle(x,y,18);
}
function fxChidori(G,x,y,t){
  G.fillStyle(0xAA44FF,0.55);G.fillCircle(x,y,18);G.fillStyle(0xFFFFFF,0.85);G.fillCircle(x,y,9);
  G.lineStyle(2,0x00BFFF,0.9);
  for(let i=0;i<6;i++){const a=t*3.5+i*1.047,len=12+Math.random()*10;let lx=x,ly=y;
    G.beginPath();G.moveTo(lx,ly);
    for(let s=0;s<3;s++){lx+=Math.cos(a+(Math.random()-.5)*1.2)*(len/3);ly+=Math.sin(a+(Math.random()-.5)*1.2)*(len/3);G.lineTo(lx,ly);}
    G.strokePath();}
}
function fxClash(G,x,y,t){
  const p=0.5+Math.sin(t*9)*.5;
  G.fillStyle(0xFFFFFF,p*.85);G.fillCircle(x,y,20*p);G.fillStyle(0xCC88FF,p*.45);G.fillCircle(x,y,32*p);
  for(let i=0;i<3;i++){G.lineStyle(2,0xFFFFFF,0.3-i*.08);G.strokeCircle(x,y,8+i*10+Math.sin(t*6+i)*4);}
}
function fxMedicalPunch(G,x,y,t){
  G.fillStyle(0x66FF88,0.28);G.fillCircle(x,y,22+Math.sin(t*7)*4);
  G.fillStyle(0xFF69B4,0.7);G.fillCircle(x,y,10+Math.sin(t*9)*3);
  G.fillStyle(0xFFFFFF,0.6);G.fillCircle(x,y,5);
  G.lineStyle(1.5,0xFFB6C1,0.65);
  for(let i=0;i<5;i++){const a=t*2.2+i*1.257;G.strokeCircle(x+Math.cos(a)*14,y+Math.sin(a)*9,2.5);}
}
function fxByakugan(G,x,y,t){
  for(let i=0;i<3;i++){
    const r=7+i*9+Math.sin(t*5+i)*2.5;
    G.lineStyle(2,0xE6E6FA,0.55-i*0.14);G.strokeEllipse(x,y,r*2,r*0.75);
  }
  G.fillStyle(0xFFFFFF,0.88);G.fillCircle(x,y,5.5);
  G.fillStyle(0xC8B6F0,0.4);G.fillCircle(x,y,10+Math.sin(t*8)*2);
}
function fxSHClash(G,x,y,t){
  const p=0.5+Math.sin(t*8)*.5;
  G.fillStyle(0xFFB6C1,p*.65);G.fillCircle(x,y,18*p);G.fillStyle(0xE6E6FA,p*.5);G.fillCircle(x,y,28*p);
  for(let i=0;i<4;i++){G.lineStyle(1.5,0xFF69B4,0.35-i*.07);G.strokeCircle(x,y,6+i*8+Math.sin(t*5+i)*3);}
}
// Speed lines — anime radial streaks bursting from the clash point
function fxSpeedLines(G,cx,cy,W,H,t,col,intensity){
  const n=24, maxR=Math.max(W,H);
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2 + t*0.35;
    const inner=maxR*(0.20+0.05*Math.sin(t*3+i)), outer=maxR*0.64;
    G.lineStyle(2+(i%3), col, 0.11*intensity);
    G.beginPath();
    G.moveTo(cx+Math.cos(a)*inner, cy+Math.sin(a)*inner);
    G.lineTo(cx+Math.cos(a)*outer, cy+Math.sin(a)*outer);
    G.strokePath();
  }
}

// ════════════════════════════════════════════════════════
// AGENT NPC
// ════════════════════════════════════════════════════════
class AgentNPC {
  constructor(scene,name,x,y){
    this.scene=scene; this.name=name;
    this.color=ADEF[name].color; this.intColor=parseInt(ADEF[name].color.replace('#',''),16);
    this.intGlow=parseInt(ADEF[name].glow.replace('#',''),16);
    this.atlasKey=CHAR[name].atlas; this.sc=CHAR[name].sc;
    this.state='idle'; this.cooldown=CFG.INIT_COOLDOWN;
    this.vx=0; this.vy=0; this.waitT=0;
    this.golden = (name==='Jiraiya'); this.trailT=0;  // golden afterimage for Jiraiya
    this.fxT=0;  // per-character walking aura timer
    this.stats={ battles:0, wins:0, dist:0, quotes:[] };
    this.tiredness=0;
    this.summoned=false;
    this.chatWith=null; this.chatTimer=0;

    this.shadow=scene.add.graphics();
    this.sprite=scene.add.sprite(x,y,this.atlasKey,'idle').setOrigin(0.5,1).setScale(this.sc).setAlpha(0);
    this.dragging=false;
    this.sprite.setInteractive();
    scene.input.setDraggable(this.sprite);
    this.sprite.on('pointerover',()=>scene.game.canvas.style.cursor='grab');
    this.sprite.on('pointerout',()=>{ if(!this.dragging) scene.game.canvas.style.cursor='default'; });
    this.wasDragged=false;
    this.sprite.on('pointerdown',()=>{ this.wasDragged=false; });
    this.nametag=scene.add.text(x,y,name,{fontSize:'9px',fontFamily:'"Share Tech Mono",monospace',color:'#FFFFFF',backgroundColor:'#000000CC',padding:{x:3,y:1}}).setOrigin(0.5,1);
    this.hpGfx=scene.add.graphics();

    this.termLines=[]; this.termT=0;
    this.termEl=document.getElementById('term-'+name);
    this.bubble=null; this.bubbleT=2500+Math.random()*4000;

    this.pickTarget();
    for(let i=0;i<4;i++) this.pushLine();
  }
  get x(){return this.sprite.x;} get y(){return this.sprite.y;}

  pickTarget(){
    const W=this.scene.W,H=this.scene.H;
    let tx,ty,tries=0;
    do{
      tx=80+Math.random()*(W-160);
      ty=this.scene.walkMinY+Math.random()*(H-this.scene.walkMinY-24);
    }while(this.scene.isBlocked&&this.scene.isBlocked(tx,ty)&&++tries<14);
    const dx=tx-this.sprite.x,dy=ty-this.sprite.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    const spd=ADEF[this.name].speed*(1-this.tiredness*0.28)/1000;
    this.vx=(dx/d)*spd; this.vy=(dy/d)*spd; this.waitT=0;
    this.setState('walking');
  }
  setState(s){
    if(this.state===s) return;
    this.state=s;
    switch(s){
      case 'walking': this.sprite.play(this.atlasKey+'_walk'); break;
      case 'idle': this.sprite.stop(); this.sprite.setFrame('idle'); break;
      case 'fighting': this.sprite.play(this.atlasKey+'_attack'); break;
      case 'post-battle': this.sprite.play(this.atlasKey+'_cheer'); break;
    }
  }
  emitTrail(){
    if (window._spawnGoldTrail) window._spawnGoldTrail();
  }
  // ── per-character walking aura ──────────────────────────
  fxInterval(){
    switch(this.name){
      case 'Naruto': return 70;
      case 'Sasuke': return 95;
      case 'Sakura': return 150;
      case 'Hinata': return 130;
      default:       return 110;
    }
  }
  emitWalkFx(){
    const s=this.sprite;
    const behind = s.x - (this.vx>=0?1:-1)*9;          // trail behind movement
    const midY   = s.y - s.displayHeight*0.46;
    const depth  = Math.floor(s.y)-1;
    switch(this.name){
      case 'Naruto': this.fxChakra(behind,midY,depth); break;
      case 'Sasuke': this.fxSpark (behind,midY,depth); break;
      case 'Sakura': this.fxPetal (behind,s.y - s.displayHeight*0.62,depth); break;
      case 'Hinata': this.fxAura  (s.x,s.y-4,depth); break;
    }
  }
  fxChakra(x,y,depth){                                  // Naruto — rising orange chakra orbs
    const sc=this.scene;
    for(let i=0;i<2;i++){
      const g=sc.add.graphics().setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      g.fillStyle(0xFF7A1A,0.45); g.fillCircle(0,0,6);
      g.fillStyle(0xFFD27A,0.9);  g.fillCircle(0,0,2.6);
      g.setPosition(x+(Math.random()-0.5)*16, y+(Math.random()-0.5)*20);
      sc.tweens.add({targets:g, y:g.y-20-Math.random()*12, alpha:0, scaleX:0.2, scaleY:0.2,
        duration:520+Math.random()*160, ease:'Quad.easeOut', onComplete:()=>g.destroy()});
    }
  }
  fxSpark(x,y,depth){                                   // Sasuke — purple/cyan electric crackle
    const sc=this.scene;
    const g=sc.add.graphics().setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    g.setPosition(x+(Math.random()-0.5)*14, y+(Math.random()-0.5)*22);
    g.lineStyle(1.5,0x00BFFF,0.9); g.beginPath(); g.moveTo(0,0);
    let lx=0,ly=0;
    for(let s=0;s<3;s++){ lx+=(Math.random()-0.5)*11; ly+=(Math.random()-0.5)*11; g.lineTo(lx,ly); }
    g.strokePath();
    g.fillStyle(0xAA66FF,0.85); g.fillCircle(0,0,2.4);
    sc.tweens.add({targets:g, alpha:0, duration:240+Math.random()*120, ease:'Quad.easeOut', onComplete:()=>g.destroy()});
  }
  fxPetal(x,y,depth){                                   // Sakura — drifting cherry-blossom petals
    const sc=this.scene;
    const tone=Math.random()>0.5?0xFF8FC8:0xFFC1DE;
    const g=sc.add.graphics().setDepth(depth);
    g.fillStyle(tone,0.92); g.fillEllipse(0,0,7,3.6);
    g.fillStyle(0xFFFFFF,0.25); g.fillEllipse(-1,-0.6,3,1.6);
    g.setPosition(x+(Math.random()-0.5)*18, y);
    g.rotation=Math.random()*Math.PI;
    const drift=(this.vx>=0?-1:1)*(10+Math.random()*18);
    sc.tweens.add({targets:g, x:g.x+drift, y:g.y+24+Math.random()*18,
      rotation:g.rotation+(Math.random()>0.5?1:-1)*2.6, alpha:0,
      duration:1000+Math.random()*350, ease:'Sine.easeIn', onComplete:()=>g.destroy()});
  }
  fxAura(x,y,depth){                                    // Hinata — soft expanding lavender chakra
    const sc=this.scene;
    const ring=sc.add.graphics().setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    ring.setPosition(x,y); ring.lineStyle(2,0xC8B6F0,0.55); ring.strokeEllipse(0,0,14,6);
    sc.tweens.add({targets:ring, scaleX:2.3, scaleY:2.3, alpha:0, duration:640, ease:'Quad.easeOut', onComplete:()=>ring.destroy()});
    const w=sc.add.graphics().setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    w.fillStyle(0xE6E0FF,0.5); w.fillCircle(0,0,3.5);
    w.setPosition(x+(Math.random()-0.5)*14, y-2);
    sc.tweens.add({targets:w, y:w.y-16-Math.random()*8, alpha:0, duration:520, ease:'Quad.easeOut', onComplete:()=>w.destroy()});
  }
  update(delta){
    // tiredness grows over 2-hour session, caps at 0.85
    const elapsed=(Date.now()-(window._sessionStart||Date.now()))/3600000;
    this.tiredness=Math.min(0.85, elapsed/2);
    if(this.dragging){this.syncUI();return;}
    this.cooldown-=delta;
    if(this.state==='walking'){
      const nx=Phaser.Math.Clamp(this.sprite.x+this.vx*delta,55,this.scene.W-55);
      const ny=Phaser.Math.Clamp(this.sprite.y+this.vy*delta,this.scene.walkMinY,this.scene.H-22);
      // block walking INTO an obstacle (but allow escaping one if already overlapping)
      if(this.scene.isBlocked(nx,ny)&&!this.scene.isBlocked(this.sprite.x,this.sprite.y)){
        this.vx=0;this.vy=0;this.waitT=0;
        if(!this.summoned) this.pickTarget();
      } else {
        this.sprite.x=nx; this.sprite.y=ny; this.sprite.setFlipX(this.vx<0);
        if(this.stats) this.stats.dist+=Math.sqrt(this.vx*this.vx+this.vy*this.vy)*delta/1000;
      }
      if(!this.summoned){
        this.waitT+=delta;
        if(this.waitT>1200+Math.random()*2600){this.vx=0;this.vy=0;this.waitT=0;this.setState('idle');}
      }
    } else if(this.state==='idle'){
      this.waitT+=delta;
      if(this.waitT>CFG.IDLE_MIN+Math.random()*(CFG.IDLE_MAX-CFG.IDLE_MIN)&&!this.summoned){this.waitT=0;this.pickTarget();}
    } else if(this.state==='post-battle'){
      this.sprite.x=Phaser.Math.Clamp(this.sprite.x+this.vx*delta,55,this.scene.W-55);
      this.sprite.y=Phaser.Math.Clamp(this.sprite.y+this.vy*delta,this.scene.walkMinY,this.scene.H-22);
    }
    // golden afterimage trail (Jiraiya, while moving)
    if(this.golden && (this.state==='walking'||this.state==='post-battle')){
      this.trailT-=delta;
      if(this.trailT<=0){ this.emitTrail(); this.trailT=85; }
    }
    // per-character walking aura (Naruto/Sasuke/Sakura/Hinata, while moving)
    if(!this.golden && (this.state==='walking'||this.state==='post-battle')){
      this.fxT-=delta;
      if(this.fxT<=0){ this.emitWalkFx(); this.fxT=this.fxInterval(); }
    }
    this.syncUI();
    this.bubbleT-=delta;
    if(this.bubbleT<=0&&!this.scene.battleActive){this.showBubble();this.bubbleT=4000+Math.random()*5000;}
    this.termT-=delta;
    if(this.termT<=0){this.pushLine();this.termT=this.state==='fighting'?700+Math.random()*500:1800+Math.random()*1400;}
  }
  syncUI(){
    let sx=this.sprite.x,sy=this.sprite.y;
    // While this character is hopped up on the cart, the 3D model has left its
    // logic-sprite — pin the nametag/HP bar to the model's projected position.
    const cv=window._CART_VISIT;
    if(cv&&cv.name===this.name){ sx=cv.x; sy=cv.y; }
    const sh=this.sprite.displayHeight,d=Math.floor(sy);
    this.sprite.setDepth(d);
    // nametag floats above the 3D model (approximate: sprite.y - 40px)
    this.nametag.setPosition(sx,sy-40).setDepth(d+2);
    const hg=this.hpGfx; hg.clear().setDepth(d+3);
    hg.fillStyle(0x000000,0.55); hg.fillRect(sx-22,sy-52,44,5);
    const tc=this.tiredness;
    const barCol=tc<0.4?this.intColor:tc<0.7?0xCCAA00:0xFF7700;
    hg.fillStyle(barCol,0.95); hg.fillRect(sx-21,sy-51,42,3);
    if(this.state==='fighting'){hg.fillStyle(0xFF0000,0.95);hg.fillRect(sx-21+28,sy-51,14,3);}
    // bubble follows the character
    if(this.bubble&&this.bubble.active){this.bubble.setPosition(sx,sy-52).setDepth(d+9000);}
  }
  showBubble(){
    if(this.bubble&&this.bubble.active)this.bubble.destroy();
    // Jiraiya: 30% chance to quote a real diary line
    if(this.name==='Jiraiya'&&Math.random()<0.30&&typeof DIARY_DATA!=='undefined'&&DIARY_DATA.length){
      const entry=DIARY_DATA[Math.floor(Math.random()*Math.min(DIARY_DATA.length,8))];
      const lines=(entry.content||'').split('\n').map(l=>l.replace(/^[#>*-\s]+/,'').trim()).filter(l=>l.length>20&&l.length<80&&!l.startsWith('`')&&!l.startsWith('|'));
      if(lines.length){
        const quote=lines[Math.floor(Math.random()*lines.length)].slice(0,72);
        this.bubble=spawnBubble(this.scene,this.sprite.x,this.sprite.y-54,'📖 '+quote);
        if(this.stats&&this.stats.quotes.length<20) this.stats.quotes.push(quote);
        return;
      }
    }
    const pool=(MSGS[this.name]||{}).walking||(MSGS[this.name]||{}).idle||[];
    if(!pool.length)return;
    const msg=pool[Math.floor(Math.random()*pool.length)];
    this.bubble=spawnBubble(this.scene,this.sprite.x,this.sprite.y-54,msg);
    if(this.stats&&this.stats.quotes.length<20) this.stats.quotes.push(msg);
  }
  pushLine(){
    const st=this.state==='fighting'?'fighting':this.state==='idle'?'idle':'walking';
    const pool=(MSGS[this.name]||{})[st]||(MSGS[this.name]||{}).walking||[];
    if(!pool.length)return;
    this.termLines.push(pool[Math.floor(Math.random()*pool.length)]);
    if(this.termLines.length>7)this.termLines.shift();
    if(this.termEl){
      const body=this.termEl.querySelector('.term-body'); body.innerHTML='';
      this.termLines.forEach((txt,i)=>{
        const p=document.createElement('p');p.className='term-line';
        p.style.color=this.state==='fighting'?'#ff9999':this.color+'cc';p.textContent=txt;
        if(i===this.termLines.length-1){const c=document.createElement('span');c.className='cursor';c.style.background=this.color;p.appendChild(c);}
        body.appendChild(p);
      });
    }
  }
  lockForBattle(tx,ty,faceRight){
    this.vx=0;this.vy=0;this.sprite.setPosition(tx,ty).setFlipX(!faceRight);
    this.setState('fighting');this.pushLine();
  }
  releaseFromBattle(dir){
    const spd=ADEF[this.name].speed*(1-this.tiredness*0.28)/1000;
    this.vx=dir*spd*CFG.SEP_SPEED; this.vy=(Math.random()-.5)*spd*0.4;
    this.cooldown=CFG.COOLDOWN_MS; this.waitT=0;
    this.setState('post-battle'); this.sprite.setFlipX(dir<0);
    setTimeout(()=>{if(this.state==='post-battle')this.pickTarget();},CFG.POST_BATTLE_MS);
  }
}

// ════════════════════════════════════════════════════════
// PET NPC
// ════════════════════════════════════════════════════════
class PetNPC {
  constructor(scene,def,x,y){
    this.scene=scene; this.def=def;
    this.baseX=x; this.baseY=y;
    this.vx=0; this.vy=0;
    this.isWalking=false; this.waitT=0;
    this.walked=0; this.walkDist=0;
    this.bobT=Math.random()*Math.PI*2;

    this.shadow=scene.add.graphics();
    this.sprite=scene.add.image(x,y,def.key).setOrigin(0.5,1).setScale(def.scale);
    this.dragging=false;
    this.sprite.setInteractive();
    scene.input.setDraggable(this.sprite);
    this.sprite.on('pointerover',()=>scene.game.canvas.style.cursor='grab');
    this.sprite.on('pointerout',()=>{ if(!this.dragging) scene.game.canvas.style.cursor='default'; });
    this.pickTarget();
  }
  pickTarget(){
    const W=this.scene.W,H=this.scene.H,minY=this.scene.walkMinY;
    let tx,ty,tries=0;
    do{
      tx=80+Math.random()*(W-160);
      ty=minY+20+Math.random()*(H-minY-50);
    }while(this.scene.isBlocked&&this.scene.isBlocked(tx,ty)&&++tries<14);
    const dx=tx-this.baseX,dy=ty-this.baseY,d=Math.sqrt(dx*dx+dy*dy)||1;
    const spd=0.028+Math.random()*0.022;
    this.vx=(dx/d)*spd; this.vy=(dy/d)*spd;
    this.walkDist=d; this.walked=0; this.isWalking=true;
  }
  update(delta){
    if(this.dragging) return;
    this.bobT+=delta*0.006;
    if(this.isWalking){
      const nx=Phaser.Math.Clamp(this.baseX+this.vx*delta,60,this.scene.W-60);
      const ny=Phaser.Math.Clamp(this.baseY+this.vy*delta,this.scene.walkMinY+10,this.scene.H-24);
      if(this.scene.isBlocked&&this.scene.isBlocked(nx,ny)&&!this.scene.isBlocked(this.baseX,this.baseY)){
        this.isWalking=false; this.waitT=400; this.pickTarget();
      } else {
        this.baseX=nx; this.baseY=ny;
      }
      this.sprite.setFlipX(this.vx<0);
      this.walked+=Math.hypot(this.vx,this.vy)*delta;
      if(this.walked>=this.walkDist*0.97){this.isWalking=false;this.waitT=1200+Math.random()*3500;}
    } else {
      this.waitT-=delta;
      if(this.waitT<=0) this.pickTarget();
    }
    const bob=this.isWalking?Math.sin(this.bobT*3)*1.8:0;
    const d=Math.floor(this.baseY);
    this.sprite.setPosition(this.baseX,this.baseY+bob).setDepth(d);
    const sw=this.sprite.displayWidth;
    this.shadow.clear().setDepth(d-1);
    this.shadow.fillStyle(0x000000,0.20);
    this.shadow.fillEllipse(this.baseX,this.baseY-2,sw*0.75,sw*0.16);
  }
}

// ════════════════════════════════════════════════════════
// PHASER SCENE
// ════════════════════════════════════════════════════════
const TILE=16, SCALE=3, DISP=TILE*SCALE; // 48px on screen

class GameScene extends Phaser.Scene {
  constructor(){ super({key:'GameScene'}); }

  preload(){
    Object.entries(ATLASES).forEach(([k,{png,xml}])=>this.load.atlasXML(k,png,xml));
    this.load.spritesheet('town', TOWN_PNG, { frameWidth:16, frameHeight:16 });
    PETS_DEF.forEach(p=>this.load.image(p.key,p.file));

    const W=this.scale.width,H=this.scale.height;
    const bar=this.add.graphics();
    this.load.on('progress',p=>{bar.clear();bar.fillStyle(0x1a1a2e,1);bar.fillRect(W/4,H/2-9,W/2,18);bar.fillStyle(0xD4A017,1);bar.fillRect(W/4+2,H/2-7,(W/2-4)*p,14);});
    this.load.on('complete',()=>bar.destroy());
  }

  create(){
    this.W=this.scale.width; this.H=this.scale.height;
    this.cols=Math.ceil(this.W/DISP); this.rows=Math.ceil(this.H/DISP);
    this.walkMinY=Math.floor(this.rows*0.42)*DISP;

    // ── Collision zones (ellipses, normalized to W/H) — characters can't walk onto
    //    the 3D houses, windmill, mill, or the prominent foreground trees.
    this.obstacles=[
      [0.19,0.55,0.065,0.080],  // windmill
      [0.43,0.50,0.110,0.090],  // green-roof sign house (moved back to z=-14, same row as red-roof)
      [0.63,0.44,0.055,0.065],  // red-roof house (further back z=-14)
      [0.85,0.57,0.085,0.085],  // mill house (widened)
      [0.35,0.64,0.032,0.045],  // foreground tree (centre-left)
      [0.66,0.66,0.032,0.045],  // foreground tree (centre-right)
    ].map(o=>({x:o[0]*this.W,y:o[1]*this.H,rx:o[2]*this.W,ry:o[3]*this.H}));
    this.isBlocked=(x,y)=>{
      for(let i=0;i<this.obstacles.length;i++){
        const o=this.obstacles[i],dx=(x-o.x)/o.rx,dy=(y-o.y)/o.ry;
        if(dx*dx+dy*dy<1) return true;
      }
      // the wheelbarrow — footprint published by the 3D layer once its GLB loads
      const c=window.CART_BLOCK;
      if(c){ const dx=(x-c.x)/c.rx, dy=(y-c.y)/c.ry; if(dx*dx+dy*dy<1) return true; }
      return false;
    };

    // smooth filter on character atlases (they are vector-style, not pixel art)
    ['mAdv','fAdv','mPerson','fPerson','zombie'].forEach(k=>{
      const tex=this.textures.get(k); if(tex) tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    });

    this.buildAnims();
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)'); // transparent — show 3D bg behind

    const wy=this.walkMinY,W=this.W,H=this.H;
    const starts=[
      {name:'Jiraiya',x:W*.13,y:wy+90},
      {name:'Naruto', x:W*.30,y:wy+105},
      {name:'Sasuke', x:W*.72,y:wy+105},
      {name:'Sakura', x:W*.50,y:H-60},
      {name:'Hinata', x:W*.78,y:wy+100},
    ];
    this.npcs=starts.map(p=>new AgentNPC(this,p.name,p.x,p.y));

    // ── Drag-to-place ──
    this.input.on('dragstart',(pointer,go)=>{
      const npc=this.npcs.find(a=>a.sprite===go);
      const pet=!npc&&this.pets&&this.pets.find(p=>p.sprite===go);
      const t=npc||pet; if(!t) return;
      t.dragging=true;
      if(npc){ npc.wasDragged=true; npc.summoned=true; npc.vx=0; npc.vy=0; npc.setState('idle'); }
      else { pet.isWalking=false; pet.vx=0; pet.vy=0; }
      t.sprite.setDepth(9999);
      this.game.canvas.style.cursor='grabbing';
    });
    this.input.on('drag',(pointer,go,dragX,dragY)=>{
      const npc=this.npcs.find(a=>a.sprite===go);
      const pet=!npc&&this.pets&&this.pets.find(p=>p.sprite===go);
      if(npc){
        npc.sprite.setPosition(
          Phaser.Math.Clamp(dragX,55,this.W-55),
          Phaser.Math.Clamp(dragY,this.walkMinY,this.H-22)
        );
      } else if(pet){
        pet.baseX=Phaser.Math.Clamp(dragX,60,this.W-60);
        pet.baseY=Phaser.Math.Clamp(dragY,this.walkMinY+10,this.H-24);
        pet.sprite.setPosition(pet.baseX,pet.baseY);
      }
    });
    this.input.on('dragend',(pointer,go)=>{
      const npc=this.npcs.find(a=>a.sprite===go);
      const pet=!npc&&this.pets&&this.pets.find(p=>p.sprite===go);
      const t=npc||pet; if(!t) return;
      t.dragging=false;
      t.sprite.setDepth(Math.floor(t.sprite.y));
      this.game.canvas.style.cursor='default';
      if(npc){ npc.summoned=false; npc.pickTarget(); }
      else { pet.pickTarget(); }
    });

    // ── Click Jiraiya → speech-bubble ask to read diary ──
    this.input.on('gameobjectup',(pointer,go)=>{
      const npc=this.npcs.find(a=>a.sprite===go);
      if(npc&&npc.name==='Jiraiya'&&!npc.wasDragged) showDiaryBubble(npc);
    });

    this.battleActive=false; this.battleSecs=0; this.fightA=null; this.fightB=null;
    this.postPhase=false; this.postTimer=0;
    this.fxGfx=this.add.graphics().setDepth(8000);
    this.cardTimer=0;
    // summon event
    this.summonActive=false; this.summonPhase='idle'; this.summonT=0; this.summonGatherT=0;
    this.summonTimer=55000+Math.random()*35000;
    // clouds
    this.clouds=[]; // clouds handled by Three.js 3D background
    // pets
    this.spawnPets();
    // shared state for Three.js character models
    window._NPC_STATE = {};
    window._NPC_META  = { W: this.W, H: this.H, walkMinY: this.walkMinY };
    // expose all NPCs so the Three.js interaction layer can drive sprite positions
    window._jiraiyaNPC = this.npcs.find(a => a.name === 'Jiraiya');
    window._npcs = {};
    this.npcs.forEach(a => { window._npcs[a.name] = a; });
    window._sessionStart = Date.now();
  }

  buildAnims(){
    ['mAdv','fAdv','mPerson','fPerson','zombie'].forEach(key=>{
      if(this.anims.exists(key+'_walk')) return;
      this.anims.create({key:key+'_walk',  frames:Array.from({length:8},(_,i)=>({key,frame:`walk${i}`})),frameRate:9,repeat:-1});
      this.anims.create({key:key+'_idle',  frames:[{key,frame:'idle'}],frameRate:1,repeat:0});
      this.anims.create({key:key+'_attack',frames:Array.from({length:3},(_,i)=>({key,frame:`attack${i}`})),frameRate:7,repeat:-1});
      this.anims.create({key:key+'_cheer', frames:[{key,frame:'cheer0'},{key,frame:'cheer1'}],frameRate:4,repeat:-1});
    });
  }

  // Bake the whole tile world into one RenderTexture (no seams), then scale it up.
  buildWorld(){
    const cols=this.cols, rows=this.rows;
    const rt=this.add.renderTexture(0,0,cols*TILE,rows*TILE).setOrigin(0,0).setDepth(-100);
    const rand=(s)=>{const x=Math.sin(s*127.1)*43758.5453;return x-Math.floor(x);};
    const place=(f,c,r)=>{ if(c>=0&&c<cols&&r>=0&&r<rows&&f!=null) rt.drawFrame('town',f,c*TILE,r*TILE); };
    const pick=(arr,s)=>arr[Math.floor(rand(s)*arr.length)];

    // Track occupied cells so decorations never overwrite structures
    const used=new Set();
    const key=(c,r)=>c+','+r;
    const occupy=(c,r)=>used.add(key(c,r));
    const free=(c,r)=>c>=0&&c<cols&&r>=0&&r<rows&&!used.has(key(c,r));
    const put=(f,c,r)=>{ if(free(c,r)){ place(f,c,r); occupy(c,r); } };

    // ── 1. Grass base ──
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const h=rand(c*7.3+r*13.7);
      let g=T.grass;
      if(h>0.93) g=T.grassFlower; else if(h>0.78) g=T.grassA;
      place(g,c,r);
    }

    // ── 2. Dirt path: vertical from farmhouse door down to bottom ──
    const pathCol=3;
    for(let r=3;r<rows;r++){
      place(r===rows-1?T.pathBot:T.pathMid, pathCol, r);
      occupy(pathCol,r);
    }

    // ── 3. Farmhouse (red roof + gray stone walls) 6 wide × 4 tall ──
    const A={x:0,y:0};
    // row 0 — upper roof
    place(T.roofL,A.x,0);place(T.roofM,A.x+1,0);place(T.roofM,A.x+2,0);place(T.roofM,A.x+3,0);place(T.roofM,A.x+4,0);place(T.roofR,A.x+5,0);
    // row 1 — lower roof (double eave gives house more height)
    place(T.roofL,A.x,1);place(T.roofM,A.x+1,1);place(T.roofM,A.x+2,1);place(T.roofM,A.x+3,1);place(T.roofM,A.x+4,1);place(T.roofR,A.x+5,1);
    // row 2 — upper wall with two windows
    place(T.bWallL,A.x,2);place(T.windowWood,A.x+1,2);place(T.bWallM,A.x+2,2);place(T.bWallM,A.x+3,2);place(T.windowWood,A.x+4,2);place(T.bWallR,A.x+5,2);
    // row 3 — ground floor with centred door
    place(T.bWallL,A.x,3);place(T.bWallM,A.x+1,3);place(T.bWallM,A.x+2,3);place(T.doorWood[0],A.x+3,3);place(T.bWallM,A.x+4,3);place(T.bWallR,A.x+5,3);
    for(let r=0;r<4;r++) for(let c=A.x;c<A.x+6;c++) occupy(c,r);

    // ── 4. Stone/blue house (blue roof + gray stone walls) 5 wide × 4 tall ──
    const B={x:cols-6,y:0};
    // row 0 — upper roof
    place(T.bRoofL,B.x,0);place(T.bRoofM,B.x+1,0);place(T.bRoofM,B.x+2,0);place(T.bRoofM,B.x+3,0);place(T.bRoofR,B.x+4,0);
    // row 1 — lower roof
    place(T.bRoofL,B.x,1);place(T.bRoofM,B.x+1,1);place(T.bRoofM,B.x+2,1);place(T.bRoofM,B.x+3,1);place(T.bRoofR,B.x+4,1);
    // row 2 — upper wall with two windows
    place(T.bWallL,B.x,2);place(T.windowWood,B.x+1,2);place(T.bWallM,B.x+2,2);place(T.windowWood,B.x+3,2);place(T.bWallR,B.x+4,2);
    // row 3 — ground floor with centred door
    place(T.bWallL,B.x,3);place(T.bWallM,B.x+1,3);place(T.bDoor[1],B.x+2,3);place(T.bWallM,B.x+3,3);place(T.bWallR,B.x+4,3);
    for(let r=0;r<4;r++) for(let c=B.x;c<B.x+5;c++) occupy(c,r);

    // ── 5. Ground-level fence (row 3) between houses, gap at path ──
    const fRow=3, fStart=A.x+6, fEnd=B.x-1;
    const fcells=[];
    for(let c=fStart;c<fEnd;c++){ if(c!==pathCol&&free(c,fRow)) fcells.push(c); }
    fcells.forEach((c,i)=>{
      const f = i===0?T.fenceL : (i===fcells.length-1?T.fenceR : T.fenceM);
      put(f,c,fRow);
    });

    // ── 6. Trees in top band (rows 0–1 only, above the fence) ──
    const treeSpots=[
      [6,0],[7,1],[9,0],[10,1],
      [Math.floor(cols/2)-1,0],[Math.floor(cols/2),1],[Math.floor(cols/2)+2,0],
      [cols-6,1],[cols-7,0],[cols-9,1],
    ];
    treeSpots.forEach(([c,r],i)=>{
      const roll=rand(c*3.1+r*5.7+i);
      put(roll>0.72 ? pick(T.treeAutumn,i+2) : pick(T.treeGreen,i), c, r);
    });

    // ── 7. Bushes in top band ──
    [[8,1],[Math.floor(cols/2)+1,1],[cols-5,0],[5,1]].forEach(([c,r],i)=>put(pick(T.bush,i+9),c,r));

    // ── 8. Decorations (ground props, bottom rows) ──
    // flanking the houses at ground+1 level
    put(T.bush[0], A.x+1, 4);
    put(T.pot,     A.x+5, 4);
    put(T.bush[1], B.x-1, 4);
    put(T.pot,     B.x+4, 4);

    put(T.barrel, 1, rows-1);
    put(T.pot, 1, rows-2);
    put(T.trough, cols-2, rows-1);
    put(T.jar, cols-3, rows-2);
    put(T.bucket, cols-2, rows-3);
    put(T.sign, pathCol+1, rows-2);
    put(T.mush, 6, rows-1);
    put(T.grassPatch, Math.floor(cols/2), rows-1);
    put(T.grassPatch, Math.floor(cols/2)-3, rows-2);
    put(T.seedling, Math.floor(cols/2)+3, rows-2);

    // ── Scale the baked world up crisply ──
    rt.setScale(SCALE);

    // Soft depth shadow near bottom for grounding (drawn over the RT)
    const sh=this.add.graphics().setDepth(-90);
    sh.fillStyle(0x000000,0.10); sh.fillRect(0,this.H-40,this.W,40);
    // subtle boundary between yard and field
    sh.fillStyle(0x3a2a10,0.18); sh.fillRect(0,this.walkMinY-2,this.W,2);
  }

  update(time,delta){
    // drift clouds rightward with gentle vertical bob
    this.clouds.forEach(c=>{
      c.x+=c.spd*delta;
      c.y=c.baseY+Math.sin(time*0.00035+c.bobOff)*5;
      if(c.x>this.W+160) c.x=-160;
    });
    // pet critters
    this.pets.forEach(p=>p.update(delta));

    this.npcs.forEach(a=>{
      if(a.state!=='fighting') a.update(delta);
      else {a.termT-=delta;if(a.termT<=0){a.pushLine();a.termT=700+Math.random()*500;}a.syncUI();}
    });

    // summon countdown
    if(!this.battleActive&&!this.postPhase&&!this.summonActive){
      this.summonTimer-=delta;
      if(this.summonTimer<=0) this.triggerSummon();
    }
    if(this.summonActive) this.updateSummon(delta,time);

    // ── agent conversations — nearby non-fighting pairs briefly chat ──
    if(!this.battleActive&&!this.postPhase&&!this.summonActive){
      for(let ci=0;ci<this.npcs.length;ci++){
        const a=this.npcs[ci];
        if(a.chatTimer>0){a.chatTimer-=delta;if(a.chatTimer<=0){a.chatWith=null;a.summoned=false;a.pickTarget();}continue;}
        if(a.state==='fighting'||a.summoned||a.chatWith) continue;
        for(let cj=ci+1;cj<this.npcs.length;cj++){
          const b=this.npcs[cj];
          if(b.state==='fighting'||b.summoned||b.chatWith||b.chatTimer>0) continue;
          const dx=a.sprite.x-b.sprite.x,dy=a.sprite.y-b.sprite.y;
          if(Math.sqrt(dx*dx+dy*dy)<72&&a.state==='walking'&&b.state==='walking'&&Math.random()<0.003){
            const dur=3000+Math.random()*3000;
            a.chatWith=b.name; a.chatTimer=dur; a.vx=0;a.vy=0;a.summoned=true;a.setState('idle');
            b.chatWith=a.name; b.chatTimer=dur; b.vx=0;b.vy=0;b.summoned=true;b.setState('idle');
            a.sprite.setFlipX(a.sprite.x>b.sprite.x);
            b.sprite.setFlipX(b.sprite.x>a.sprite.x);
            const chatMsgs=['> Syncing context...','> Reviewing approach...','> Coordinating tasks.','> Status check.','> All good here.'];
            spawnBubble(this,a.sprite.x,a.sprite.y-54,chatMsgs[Math.floor(Math.random()*chatMsgs.length)]);
            spawnBubble(this,b.sprite.x,b.sprite.y-54,chatMsgs[Math.floor(Math.random()*chatMsgs.length)]);
            break;
          }
        }
      }
    }
    // battle check — all pairs
    if(!this.battleActive&&!this.postPhase&&!this.summonActive){
      for(const [na,nb] of BATTLE_PAIRS){
        const a=this.npcs.find(x=>x.name===na),b=this.npcs.find(x=>x.name===nb);
        if(!a||!b) continue;
        const dx=a.x-b.x,dy=a.y-b.y;
        if(Math.sqrt(dx*dx+dy*dy)<CFG.BATTLE_DIST&&a.cooldown<=0&&b.cooldown<=0
           &&a.state!=='fighting'&&b.state!=='fighting'
           &&a.state!=='post-battle'&&b.state!=='post-battle'
           &&!a.summoned&&!b.summoned){
          this.startBattle(a,b); break;
        }
      }
    }
    if(this.battleActive){
      this.battleSecs-=delta/1000;
      const frac=Math.max(0,this.battleSecs/CFG.BATTLE_SECS);
      document.getElementById('battleTimerBar').style.width=(frac*100)+'%';
      const bEl=document.getElementById('bCount'); if(bEl) bEl.textContent=Math.max(0,Math.ceil(this.battleSecs));
      this.drawBattleFX(this.fightA,this.fightB,time);
      // rhythmic impact beats — gentle micro-shake only (no full-screen flash; that hurt the eyes)
      this._impactBeat-=delta;
      if(this._impactBeat<=0){
        this._impactBeat=820+Math.random()*240;
        this.cameras.main.shake(80,0.005);
      }
      if(this.battleSecs<=0) this.endBattle(this.fightA,this.fightB);
    }
    if(this.postPhase){this.postTimer-=delta;if(this.postTimer<=0){this.postPhase=false;this.fxGfx.clear();}}
    this.cardTimer+=delta;
    if(this.cardTimer>500){this.npcs.forEach(a=>refreshCard(a));this.cardTimer=0;}
    // sync 2D positions → Three.js character renderer
    if(window._NPC_STATE){
      this.npcs.forEach(a=>{
        window._NPC_STATE[a.name]={x:a.sprite.x,y:a.sprite.y,vx:a.vx,vy:a.vy,state:a.state};
      });
    }
  }

  startBattle(a,b){
    this.fightA=a; this.fightB=b;
    this.battleActive=true; this.battleSecs=CFG.BATTLE_SECS;
    if(a.stats) a.stats.battles++;
    if(b.stats) b.stats.battles++;
    const mx=(a.x+b.x)/2,my=Math.max(a.y,b.y);
    a.lockForBattle(mx-58,my,true); b.lockForBattle(mx+58,my,false);
    document.getElementById('battleBanner').innerHTML=`⚔ ${a.name.toUpperCase()} vs ${b.name.toUpperCase()} &nbsp;—&nbsp; <span id="bCount">20</span>s`;
    document.getElementById('battleBanner').style.display='block';
    document.getElementById('battleTimerWrapper').style.display='block';
    this.cameras.main.shake(150,0.005);
    this._impactBeat=820;   // rhythmic impact-frame timer (ms)
    refreshCard(a); refreshCard(b);
  }
  endBattle(a,b){
    this.battleActive=false; this.postPhase=true; this.postTimer=CFG.POST_BATTLE_MS;
    this.fxGfx.clear(); this.cameras.main.shake(400,0.015); this.cameras.main.flash(300,255,255,255,false);
    document.getElementById('battleBanner').style.display='none';
    document.getElementById('battleTimerWrapper').style.display='none';
    if(a.stats) a.stats.wins++;
    a.releaseFromBattle(-1); b.releaseFromBattle(1);
    refreshCard(a); refreshCard(b);
  }
  drawBattleFX(a,b,time){
    const G=this.fxGfx; G.clear(); const t=time*0.003;
    const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2-35;
    // speed lines burst on clash peaks
    const clashPulse=Math.max(0,Math.sin(t*9));
    if(clashPulse>0.25) fxSpeedLines(G,cx,cy+35,this.W,this.H,t,a.intGlow,clashPulse);
    const isNS=(a.name==='Naruto'||a.name==='Sasuke');
    if(isNS){
      const nr=a.name==='Naruto'?a:b, sk=a.name==='Sasuke'?a:b;
      fxRasengan(G,nr.x+26,nr.y-32,t); fxChidori(G,sk.x-26,sk.y-32,t); fxClash(G,cx,cy,t);
    } else {
      const sa=a.name==='Sakura'?a:b, hi=a.name==='Hinata'?a:b;
      fxMedicalPunch(G,sa.x+22,sa.y-32,t); fxByakugan(G,hi.x-22,hi.y-32,t); fxSHClash(G,cx,cy,t);
    }
  }

  buildClouds(){
    this.clouds=[];
    const skyH=this.walkMinY*0.65;
    const blobs=[[0,0,54,26],[34,-12,38,20],[-36,-10,30,17],[56,5,24,14],[-14,-18,20,13]];
    for(let i=0;i<9;i++){
      const g=this.add.graphics().setDepth(-60);
      const alpha=0.42+Math.random()*0.28;
      blobs.forEach(([bx,by,bw,bh])=>{ g.fillStyle(0xFFFFFF,alpha); g.fillEllipse(bx,by,bw*2,bh*2); });
      g.fillStyle(0xFFFFFF,alpha*0.65); g.fillEllipse(0,-7,42,22);
      const sc=0.5+Math.random()*0.9; g.setScale(sc);
      g.x=Math.random()*this.W;
      g.baseY=14+Math.random()*skyH;
      g.y=g.baseY;
      g.spd=0.019+Math.random()*0.021;
      g.bobOff=Math.random()*Math.PI*2;
      this.clouds.push(g);
    }
  }

  spawnPets(){
    this.pets=[];
    const W=this.W,H=this.H,minY=this.walkMinY;
    PETS_DEF.forEach((def,i)=>{
      const x=W*0.25+i*(W*0.25);
      const y=minY+40+Math.random()*(H-minY-70);
      this.pets.push(new PetNPC(this,def,x,y));
    });
  }

  triggerSummon(){
    if(this.battleActive||this.summonActive) return;
    this.summonActive=true; this.summonPhase='gathering';
    this.summonT=0; this.summonGatherT=0;
    const cx=this.W/2, cy=this.walkMinY+(this.H-this.walkMinY)*0.42;
    this.summonCenter={x:cx,y:cy};
    this.npcs.forEach(a=>{
      a.summoned=true;
      const dx=cx-a.x,dy=cy-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
      const spd=ADEF[a.name].speed/1000*1.3;
      a.vx=(dx/d)*spd; a.vy=(dy/d)*spd; a.waitT=0;
      if(a.state!=='fighting') a.setState('walking');
    });
    document.getElementById('battleBanner').innerHTML='✦ JIRAIYA GATHERS THE TEAM ✦';
    document.getElementById('battleBanner').style.display='block';
  }
  updateSummon(delta,time){
    this.summonT+=delta; this.summonGatherT+=delta;
    const {x:cx,y:cy}=this.summonCenter;
    if(this.summonPhase==='gathering'){
      this.npcs.forEach(a=>{
        if(!a.summoned) return;
        const dx=cx-a.x,dy=cy-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        if(d>30){ const spd=ADEF[a.name].speed/1000*1.3; a.vx=(dx/d)*spd; a.vy=(dy/d)*spd; }
      });
      const allNear=this.npcs.every(a=>Math.hypot(a.x-cx,a.y-cy)<50);
      if(allNear||this.summonGatherT>6500){
        this.summonPhase='burst'; this.summonT=0;
        this.npcs.forEach(a=>{a.vx=0;a.vy=0;a.setState('post-battle');});
        // ── impact sequence ──────────────────────────────
        this.cameras.main.shake(700,0.032);
        this.cameras.main.flash(500,255,215,0,false);          // gold flash
        this.time.delayedCall(720,()=>this.cameras.main.shake(350,0.018));
        this.time.delayedCall(1100,()=>this.cameras.main.flash(250,255,255,255,false)); // white afterburn
        this.time.delayedCall(1800,()=>this.cameras.main.shake(200,0.010));
        document.getElementById('battleBanner').innerHTML='✦ SAGE ART — TEAM ASSEMBLED ✦';
      }
    } else if(this.summonPhase==='burst'){
      const G=this.fxGfx; G.clear();
      const BURST=3400;
      const p=Math.min(1,this.summonT/BURST);   // 0→1 over 3.4 s

      // ── Stage 1 (p 0→0.25): Blinding core explosion ────
      if(p<0.28){
        const ep=p/0.28;
        const coreR=(1-ep)*75;
        G.fillStyle(0xFFFFFF,Math.max(0,(1-ep)*0.95)); G.fillCircle(cx,cy,coreR);
        G.fillStyle(0xFFE55C,Math.max(0,(1-ep)*0.75)); G.fillCircle(cx,cy,coreR*1.55);
        G.fillStyle(0xFFD700,Math.max(0,(1-ep)*0.45)); G.fillCircle(cx,cy,coreR*2.2);
        // screen-wide gold tint during impact
        G.fillStyle(0xFFD700,(0.28-p)/0.28*0.10); G.fillRect(0,0,this.W,this.H);
      }

      // ── Stage 2 (p 0.02→0.55): 4 fast shockwave rings ─
      for(let i=0;i<4;i++){
        const sp=Math.max(0,(p-i*0.045)/0.5);
        if(sp>0&&sp<1){
          const r=sp*(this.W*0.72);
          const al=(1-sp)*(0.72-i*0.12);
          if(al>0.01){
            G.lineStyle(4-i*0.5,0xFFD700,al);         G.strokeEllipse(cx,cy,r*2,r*0.62);
            G.lineStyle(2,0xFFFFFF,al*0.45);            G.strokeEllipse(cx,cy,r*2*0.97,r*0.62*0.97);
          }
        }
      }

      // ── Stage 3 (p 0.08→1.0): 14 radial gold beams ────
      const beamFade=p<0.12?(p-0.08)/0.04:Math.max(0,1-(p-0.12)/0.76);
      if(beamFade>0.01){
        const maxR=Math.min(1,p*2.2)*160;
        for(let i=0;i<14;i++){
          const a=i/14*Math.PI*2;
          const thick=i%2===0?3.5:1.5;
          const al=beamFade*(i%2===0?0.75:0.4);
          G.lineStyle(thick,i%2===0?0xFFD700:0xFFF5B0,al);
          G.beginPath(); G.moveTo(cx,cy);
          G.lineTo(cx+Math.cos(a)*maxR, cy+Math.sin(a)*maxR*0.52);
          G.strokePath();
        }
      }

      // ── Stage 4 (p 0.18→1.0): 8 cascading concentric rings
      for(let i=0;i<8;i++){
        const rp=Math.max(0,(p-0.18-i*0.035)/0.65);
        if(rp>0){
          const r=(8+i*15)+rp*100;
          const al=Math.max(0,(1-rp)*0.58-i*0.055);
          if(al>0.01){
            G.lineStyle(i<3?3:2,i%2===0?0xFFD700:0xFFF5CC,al);
            G.strokeEllipse(cx,cy,r*2,r*0.68);
          }
        }
      }

      // ── Stage 5 (p 0.12→0.88): per-character colour auras
      if(p>0.12&&p<0.88){
        const ap=p<0.28?(p-0.12)/0.16:Math.max(0,1-(p-0.55)/0.33);
        this.npcs.forEach(a=>{
          const hy=a.y-a.sprite.displayHeight*0.5;
          G.fillStyle(a.intColor,ap*0.20);  G.fillCircle(a.x,hy,34);
          G.lineStyle(2.5,a.intColor,ap*0.75); G.strokeCircle(a.x,hy,26);
          G.lineStyle(1.2,a.intColor,ap*0.35); G.strokeCircle(a.x,hy,40);
        });
      }

      // ── Stage 6 (p 0.5→1.0): lingering gold pulse on centre
      if(p>0.5){
        const lp=(p-0.5)/0.5;
        const pulse=0.5+Math.sin(this.summonT*0.018)*0.5;
        G.lineStyle(2,0xFFD700,Math.max(0,(1-lp)*0.45*pulse));
        G.strokeCircle(cx,cy,18+pulse*12);
      }

      if(this.summonT>=BURST){
        this.summonActive=false; this.fxGfx.clear();
        document.getElementById('battleBanner').style.display='none';
        this.npcs.forEach(a=>{ a.summoned=false; a.cooldown=0; a.pickTarget(); });
        this.summonTimer=55000+Math.random()*35000;
      }
    }
  }
}

