(function () {
  var sz = window.BG3D_SIZE;
  if (!sz || typeof THREE === 'undefined') { console.error('[3DBG] THREE not ready'); return; }

  var W = sz.w, H = sz.h;
  var canvas = document.getElementById('bg3d');
  canvas.width  = W;
  canvas.height = H;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, logarithmicDepthBuffer: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;  // compress highlights — no more white blowout
  renderer.toneMappingExposure = 0.92;

  // ── POST-PROCESSING STACK ──────────────────────────────────────────────
  var composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(null, null));   // scene/camera filled in after they're created

  // Bloom — only the very brightest surfaces (cloud tops, sky zenith) get a halo
  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(W, H), 0.18, 0.45, 0.92);
  composer.addPass(bloomPass);

  // FXAA — smooth edges beyond hardware anti-aliasing
  var fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.set(1 / W, 1 / H);
  composer.addPass(fxaaPass);

  // Vignette — subtle corner darkening for cinematic framing
  var vignettePass = new THREE.ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: [
      'varying vec2 vUv;',
      'void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D tDiffuse;varying vec2 vUv;',
      'void main(){',
      '  vec4 col=texture2D(tDiffuse,vUv);',
      '  vec2 uv=(vUv-0.5)*2.0;',
      '  float v=1.0-dot(uv,uv)*0.20;',
      '  col.rgb*=clamp(v,0.0,1.0);',
      '  gl_FragColor=col;',
      '}'
    ].join('\n')
  });
  composer.addPass(vignettePass);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x8ECFF5, 38, 100);   // fog matches sky horizon colour

  // Sky gradient dome — zenith (deep blue) → horizon (pale blue)
  var _skyMesh = new THREE.Mesh(
    new THREE.SphereGeometry(180, 16, 8),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: {
        topColor:    { value: new THREE.Color(0x1565C0) },
        bottomColor: { value: new THREE.Color(0x8ECFF5) }
      },
      vertexShader: [
        'varying vec3 vPos;',
        'void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 topColor;uniform vec3 bottomColor;varying vec3 vPos;',
        'void main(){',
        '  float t=clamp((normalize(vPos).y+0.15)/1.15,0.0,1.0);',
        '  gl_FragColor=vec4(mix(bottomColor,topColor,pow(t,0.55)),1.0);',
        '}'
      ].join('\n')
    })
  );
  _skyMesh.renderOrder = -1;
  scene.add(_skyMesh);

  // Zoomed-in, low, near-isometric vista — makes the buildings render BIG vs the 2D characters
  var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 200);
  camera.position.set(0, 9, 13);
  camera.lookAt(0, 2.2, -7);

  // ── LIGHTING ── (bright sunny, but tone-mapped so highlights don't clip to white)
  var _amb  = new THREE.AmbientLight(0xFFFFFF, 0.5);             scene.add(_amb);
  var _hemi = new THREE.HemisphereLight(0xAFD4F0, 0x6E9A40, 0.35); scene.add(_hemi); // softer blue bounce

  var sun = new THREE.DirectionalLight(0xFFF3D2, 1.5);
  sun.position.set(10, 22, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.width  = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.left   = -20;
  sun.shadow.camera.right  =  20;
  sun.shadow.camera.top    =  20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.camera.far    = 70;
  sun.shadow.bias = -0.001;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun);

  // ── DAY / NIGHT CYCLE ──────────────────────────────────────────────────
  // Sky, sun, fog and ambient light follow the real local clock. Warm "window"
  // lights near the houses fade in after dusk. Keyframes are interpolated by hour.
  var _skyU = _skyMesh.material.uniforms;
  var _warmLights = [
    [-8.5, 2.2, -8.0], [-2.5, 2.2, -12.5], [4.0, 2.2, -12.5], [9.5, 2.2, -8.0]
  ].map(function (p) {
    var L = new THREE.PointLight(0xFFB060, 0, 9, 2);   // intensity 0 by day
    L.position.set(p[0], p[1], p[2]);
    scene.add(L);
    return L;
  });
  // [hour, skyTop, skyBottom, fog, sunColor, sunIntensity, ambient, hemi, sunElevDeg, nightAmount]
  var _dnKeys = [
    { h: 0.0,  top: 0x060814, bot: 0x0c1430, fog: 0x0c1430, sun: 0x2a3a66, si: 0.06, amb: 0.20, hemi: 0.12, elev: -20, night: 1.00 },
    { h: 5.0,  top: 0x10183a, bot: 0x243a66, fog: 0x2a3e60, sun: 0x4a5a88, si: 0.16, amb: 0.26, hemi: 0.16, elev: -4,  night: 0.90 },
    { h: 6.5,  top: 0x2d4a86, bot: 0xE8915A, fog: 0xE0A070, sun: 0xFFA050, si: 1.05, amb: 0.42, hemi: 0.30, elev: 8,   night: 0.25 },
    { h: 9.0,  top: 0x1565C0, bot: 0x8ECFF5, fog: 0x8ECFF5, sun: 0xFFF3D2, si: 1.55, amb: 0.50, hemi: 0.35, elev: 42,  night: 0.00 },
    { h: 13.0, top: 0x1366c8, bot: 0x9ED8F8, fog: 0x9ED8F8, sun: 0xFFFFFA, si: 1.65, amb: 0.55, hemi: 0.38, elev: 66,  night: 0.00 },
    { h: 16.5, top: 0x1565C0, bot: 0x8ECFF5, fog: 0x8ECFF5, sun: 0xFFEFC8, si: 1.40, amb: 0.50, hemi: 0.34, elev: 28,  night: 0.00 },
    { h: 18.2, top: 0x3a3f80, bot: 0xF0884A, fog: 0xE88a55, sun: 0xFF7330, si: 0.95, amb: 0.40, hemi: 0.28, elev: 5,   night: 0.30 },
    { h: 19.6, top: 0x141033, bot: 0x2a2450, fog: 0x2a2450, sun: 0x4a3a70, si: 0.18, amb: 0.26, hemi: 0.16, elev: -5,  night: 0.85 },
    { h: 24.0, top: 0x060814, bot: 0x0c1430, fog: 0x0c1430, sun: 0x2a3a66, si: 0.06, amb: 0.20, hemi: 0.12, elev: -20, night: 1.00 }
  ];
  var _dnA = new THREE.Color(), _dnB = new THREE.Color();
  function _dnLerp(out, a, b, t) { _dnA.setHex(a); _dnB.setHex(b); out.copy(_dnA).lerp(_dnB, t); }
  function updateDayNight() {
    var now = new Date();
    var h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    var i = 0; for (; i < _dnKeys.length - 1; i++) if (h >= _dnKeys[i].h && h < _dnKeys[i + 1].h) break;
    var a = _dnKeys[i], b = _dnKeys[i + 1] || a;
    var t = (h - a.h) / ((b.h - a.h) || 1); t = t < 0 ? 0 : t > 1 ? 1 : t;
    var L = function (x, y) { return x + (y - x) * t; };
    _dnLerp(_skyU.topColor.value,    a.top, b.top, t);
    _dnLerp(_skyU.bottomColor.value, a.bot, b.bot, t);
    _dnLerp(scene.fog.color,         a.fog, b.fog, t);
    _dnLerp(sun.color,               a.sun, b.sun, t);
    sun.intensity = L(a.si, b.si);
    var elev = L(a.elev, b.elev) * Math.PI / 180;
    sun.position.set(10, Math.max(3, Math.sin(elev) * 26), 12);
    _amb.intensity  = L(a.amb, b.amb);
    _hemi.intensity = L(a.hemi, b.hemi);
    var night = L(a.night, b.night);
    for (var w = 0; w < _warmLights.length; w++) _warmLights[w].intensity = night * 1.6;
  }
  updateDayNight();   // set the correct mood immediately on load

  // ── GROUND ── (PBR + procedural grass texture)
  var _gc = document.createElement('canvas'); _gc.width = 256; _gc.height = 256;
  var _gg = _gc.getContext('2d');
  _gg.fillStyle = '#6BBF38'; _gg.fillRect(0, 0, 256, 256);
  for (var _gi = 0; _gi < 90; _gi++) {
    var _gx = Math.random()*256, _gy = Math.random()*256, _gr = 3 + Math.random()*10;
    _gg.fillStyle = 'rgba(48,98,18,' + (0.12 + Math.random()*0.22) + ')';
    _gg.beginPath(); _gg.ellipse(_gx, _gy, _gr, _gr*0.5, Math.random()*Math.PI, 0, Math.PI*2); _gg.fill();
  }
  for (var _gj = 0; _gj < 45; _gj++) {
    var _gx2 = Math.random()*256, _gy2 = Math.random()*256;
    _gg.fillStyle = 'rgba(118,192,48,' + (0.07 + Math.random()*0.11) + ')';
    _gg.beginPath(); _gg.ellipse(_gx2, _gy2, 2, 1.2, Math.random()*Math.PI, 0, Math.PI*2); _gg.fill();
  }
  var _gt = new THREE.CanvasTexture(_gc);
  _gt.wrapS = _gt.wrapT = THREE.RepeatWrapping; _gt.repeat.set(20, 20);
  var grassMat = new THREE.MeshStandardMaterial({ map: _gt, roughness: 0.92, metalness: 0.0 });
  var groundM = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), grassMat);
  groundM.rotation.x = -Math.PI / 2;
  groundM.receiveShadow = true;
  scene.add(groundM);

  var darkMat = new THREE.MeshStandardMaterial({ color: 0x4E8E2C, roughness: 0.95, metalness: 0.0 });
  [[-9,3],[-13,-2],[7,5],[14,1],[-6,-12],[11,-3],[-3,6],[9,-10],[-18,4],[17,2]].forEach(function(p) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(4, 3, 1, 1), darkMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(p[0], 0.01, p[1]);
    scene.add(m);
  });

  // ── DIRT GROUND ── (warm sandy clearing where characters walk)
  var dirtMat = new THREE.MeshStandardMaterial({ color: 0xCFA058, roughness: 0.88, metalness: 0.0 });
  function mkDirt(w, d, x, z) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), dirtMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.02, z);
    m.receiveShadow = true;
    scene.add(m);
  }
  mkDirt(30, 18, 0, 3);     // big foreground clearing (character play area)
  mkDirt(7, 40, 0, -6);     // path up through the town centre
  mkDirt(46, 7, 2, 1);      // cross path
  mkDirt(10, 14, 17, -2);   // path to the right (well/stalls)

  // ── CLOUDS ── (fluffy puffs in the visible sky, drift left → right)
  // Camera top-of-screen is ~y=7.5 at these depths, so cloud centres at y=4-6 sit nicely in the sky.
  var cloudMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 1.0, metalness: 0.0, transparent: true, opacity: 0.92, fog: false });
  var clouds3d = [];
  // [startX, Y,  Z,   scale, speed(u/s)]
  [[-14, 5.5, -12, 0.80, 0.90],
   [  4, 6.2, -16, 0.65, 0.60],
   [ 20, 5.0, -13, 0.55, 1.10],
   [ -3, 6.0, -18, 0.75, 0.70],
   [-22, 5.8, -14, 0.50, 1.30],
   [-34, 6.3, -15, 0.60, 0.80],
   [ 28, 5.3, -17, 0.70, 0.55]].forEach(function(cd) {
    var g = new THREE.Group();
    // overlapping spheres that form a puffy cloud silhouette
    [[0,0,0,2.8],[2.4,0.4,0,2.1],[-2.0,0.3,0,1.8],[0.4,0,1.8,1.6],[0,0,-1.8,1.4],[-1.0,0.5,1.2,1.5]].forEach(function(b) {
      var sp = new THREE.Mesh(new THREE.SphereGeometry(b[3], 8, 6), cloudMat);
      sp.position.set(b[0], b[1], b[2]);
      g.add(sp);
    });
    g.position.set(cd[0], cd[1], cd[2]);
    g.scale.setScalar(cd[3]);
    scene.add(g);
    clouds3d.push({ g: g, spd: cd[4] });
  });

  // ── BIRD FLOCKS ── (simple M-wing birds cross the sky left→right)
  var birdMat = new THREE.LineBasicMaterial({ color: 0x1a1a2e });
  var birdFlocks = [];
  var nextFlockIn = 8;

  function makeBirdGeo() {
    // "W" shape at original coordinate scale — right-side-up from camera above
    var pts = [
      new THREE.Vector3(-0.22,  0.04, 0),
      new THREE.Vector3(-0.11,  0.10, 0),
      new THREE.Vector3( 0,     0.01, 0),
      new THREE.Vector3( 0.11,  0.10, 0),
      new THREE.Vector3( 0.22,  0.04, 0)
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }

  function spawnFlock() {
    var count = 4 + Math.floor(Math.random() * 5);
    var startX = -28 - Math.random() * 10;
    var baseY  = 5.2 + Math.random() * 1.4;
    var baseZ  = -11 - Math.random() * 7;
    var spd    = 1.8 + Math.random() * 1.4;
    var grp    = new THREE.Group();
    for (var bi = 0; bi < count; bi++) {
      var bird = new THREE.Line(makeBirdGeo(), birdMat);
      bird.scale.setScalar(0.55 + Math.random() * 0.3);
      var col  = Math.floor(bi / 2) + (bi % 2 === 0 ? 0 : 0.5);
      var side = (bi % 2 === 0 ? -1 : 1) * Math.ceil(bi / 2);
      bird.position.set(side * 1.0 - col * 0.6, col * 0.15, col * 0.4);
      bird._phase = Math.random() * Math.PI * 2;
      grp.add(bird);
    }
    grp.position.set(startX, baseY, baseZ);
    grp._spd   = spd;
    grp._baseY = baseY;
    grp._age   = 0;
    scene.add(grp);
    birdFlocks.push(grp);
  }

  // ── ROUNDED FOREST HILLS ── (pushed back + height halved so sky is visible)
  function hill(x, z, rx, ryy, rz, col) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18),
              new THREE.MeshStandardMaterial({ color: col, roughness: 0.9, metalness: 0.0 }));
    m.scale.set(rx, ryy, rz);
    m.position.set(x, -ryy * 0.34, z);
    m.receiveShadow = true;
    scene.add(m);
  }
  // far darker ridge — pushed back, heights halved so sky is visible above
  hill(-19, -63, 22, 3.5, 16, 0x35752A);
  hill(7,   -66, 26, 4.0, 18, 0x35752A);
  hill(28,  -61, 19, 3.0, 15, 0x35752A);
  // mid brighter mounds
  hill(-24, -54, 16, 3.0, 12, 0x46912F);
  hill(-4,  -55, 19, 3.5, 13, 0x46912F);
  hill(17,  -53, 17, 3.0, 12, 0x46912F);
  // near mounds (closest, lightest)
  hill(-13, -48, 13, 2.5, 10, 0x53A038);
  hill(11,  -49, 14, 2.5, 10, 0x53A038);

  // ── ANIMATED TARGETS ── (windmill blades, water wheel, flowing water)
  var spin = [];   // each: {o, sp}  → rotates about local X
  var flow = [];   // each: {map, sp} → scrolls a water texture
  var caustics = []; // each: {tex, mat, e0, eAmp, swayAmp} → shimmer + emissive pulse

  // ── WIND ── shared time uniform; patched materials sway per-vertex (taller = more)
  var windUniforms = { uTime: { value: 0 } };
  function patchWindMat(mat, opts) {
    if (!mat || mat.userData._wind) return;
    opts = opts || {};
    mat.userData._wind = true;
    var amp = opts.amp || 0.07, sway = opts.sway || 1.0;
    mat.onBeforeCompile = function(shader) {
      shader.uniforms.uTime    = windUniforms.uTime;
      shader.uniforms.uWindAmp = { value: amp };
      shader.uniforms.uWindSway= { value: sway };
      shader.vertexShader =
        'uniform float uTime;\nuniform float uWindAmp;\nuniform float uWindSway;\n' +
        shader.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\n' +
          'float wH = max(transformed.y, 0.0);\n' +
          'float wPhase = uTime * 1.5 * uWindSway + position.x * 0.5 + position.z * 0.5;\n' +
          'transformed.x += sin(wPhase) * uWindAmp * wH;\n' +
          'transformed.z += cos(wPhase * 0.8) * uWindAmp * 0.6 * wH;');
    };
    mat.needsUpdate = true;
  }
  function patchWind(root, opts) {
    root.traverse(function(c) {
      if (!c.isMesh || !c.material) return;
      var mats = Array.isArray(c.material) ? c.material : [c.material];
      mats.forEach(function(m) { patchWindMat(m, opts); });
    });
  }

  // ── CHIMNEY SMOKE ── soft puffs that rise, drift with the wind, expand & fade
  var smokeTex = (function() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    var rg = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    rg.addColorStop(0,   'rgba(255,255,255,0.92)');
    rg.addColorStop(0.5, 'rgba(228,228,234,0.45)');
    rg.addColorStop(1,   'rgba(220,220,226,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  var smokeEmitters = [], smokePuffs = [];
  // Camera-facing PLANE meshes (not THREE.Sprite — sprites render invisibly under the
  // renderer's logarithmicDepthBuffer in r128). Planes honour log depth correctly.
  var smokeGeo = new THREE.PlaneGeometry(1, 1);
  function registerSmoke(x, y, z) {
    smokeEmitters.push({ x: x, y: y, z: z, t: Math.random() * 0.4 });
  }
  function spawnPuff(e) {
    var mat = new THREE.MeshBasicMaterial({ map: smokeTex, transparent: true, opacity: 0,
      depthWrite: false, depthTest: false, side: THREE.DoubleSide });
    var s = new THREE.Mesh(smokeGeo, mat);
    s.position.set(e.x + (Math.random() - 0.5) * 0.18, e.y, e.z + (Math.random() - 0.5) * 0.18);
    var sc0 = 0.5 + Math.random() * 0.22; s.scale.set(sc0, sc0, sc0);
    s.quaternion.copy(camera.quaternion);   // billboard toward the camera
    s.renderOrder = 999;
    scene.add(s);
    smokePuffs.push({ s: s, life: 0, ttl: 3.8 + Math.random() * 1.4,
                      vx: 0.12 + Math.random() * 0.07, vy: 0.42 + Math.random() * 0.13, sc0: sc0 });
  }
  function updateSmoke(dt) {
    for (var i = 0; i < smokeEmitters.length; i++) {
      var e = smokeEmitters[i]; e.t -= dt;
      if (e.t <= 0) { e.t = 0.35 + Math.random() * 0.25; spawnPuff(e); }
    }
    for (var k = smokePuffs.length - 1; k >= 0; k--) {
      var p = smokePuffs[k]; p.life += dt; var f = p.life / p.ttl;
      if (f >= 1) { scene.remove(p.s); p.s.material.dispose(); smokePuffs.splice(k, 1); continue; }
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt;
      var sc = p.sc0 + f * 1.6; p.s.scale.set(sc, sc, sc);
      p.s.quaternion.copy(camera.quaternion);   // keep facing the camera each frame
      p.s.material.opacity = Math.sin(f * Math.PI) * 0.6;   // fade in then out over its life
    }
  }

  // ── START RENDER LOOP IMMEDIATELY (sky + ground always visible) ──
  // Wire scene + camera into the RenderPass now that both are created
  composer.passes[0].scene  = scene;
  composer.passes[0].camera = camera;
  var clock = new THREE.Clock();
  var tAcc = 0;
  renderer.setAnimationLoop(function() {
    var dt = clock.getDelta();
    tAcc += dt;
    windUniforms.uTime.value = tAcc;
    for (var i = 0; i < spin.length; i++) spin[i].o.rotation.x += spin[i].sp * dt;
    for (var j = 0; j < flow.length; j++) flow[j].map.offset.y -= flow[j].sp * dt;
    for (var ci = 0; ci < caustics.length; ci++) {
      var cc = caustics[ci];
      cc.tex.offset.x = Math.sin(tAcc * 0.6 + ci) * cc.swayAmp;
      if (cc.mat) cc.mat.emissiveIntensity = cc.e0 + Math.sin(tAcc * 1.3 + ci * 1.7) * cc.eAmp;
    }
    updateSmoke(dt);
    composer.render();
  });

  // ── GLB LOADER ──
  if (typeof THREE.GLTFLoader === 'undefined') { console.warn('[3DBG] GLTFLoader unavailable — models skipped'); return; }
  var loader = new THREE.GLTFLoader();
  var BASE = 'assets/kenney_fantasy-town-kit_2.0/Models/GLB%20format/';

  // place(name, x, z, {y, s, ry, ground, onload}, _target)
  //  - scale defaults to 1 (modular pieces share a 1-unit grid; DON'T random-scale them)
  //  - ground:true snaps the model's lowest point to y (fixes centered-origin models)
  //  - _target: optional THREE.Group to add to instead of scene (used by building())
  function place(name, x, z, o, _target) {
    o = o || {};
    var s  = (o.s  === undefined) ? 1 : o.s;
    var ry = (o.ry === undefined) ? 0 : o.ry;
    var y  = (o.y  === undefined) ? 0 : o.y;
    var ground = (o.ground === undefined) ? true : o.ground;
    var tgt = _target || scene;
    loader.load(BASE + name + '.glb', function(gltf) {
      var m = gltf.scene;
      m.scale.setScalar(s);
      m.rotation.y = ry;
      var panelCastShadow = !o.noShadow && !(tgt && tgt.userData && tgt.userData.noShadowCast);
      m.traverse(function(c) {
        if (c.isMesh) {
          c.castShadow    = panelCastShadow;
          c.receiveShadow = true;
          if (o.tint && c.material) { c.material = c.material.clone(); c.material.color.setHex(o.tint); }
        }
      });
      if (o.wind) patchWind(m, { amp: o.windAmp || 0.06, sway: o.windSway || 1.0 });
      m.updateWorldMatrix(true, true);
      var box = new THREE.Box3().setFromObject(m);
      m.position.set(x, ground ? (y - box.min.y) : y, z);
      tgt.add(m);
      if (o.onload) o.onload(m);
    }, undefined, function() { console.warn('[3DBG] skip:', name); });
  }

  // placeSpinner — load a rotor/wheel, wrap in a pivot turned to FACE the camera,
  // and spin it about its own axis. faceY rotates the whole disc toward the viewer.
  // noShadow = true disables shadow casting (e.g. watermill wheel casts a huge foreground shadow)
  function placeSpinner(name, x, y, z, faceY, speed, s, noShadow) {
    loader.load(BASE + name + '.glb', function(gltf) {
      var m = gltf.scene;
      m.scale.setScalar(s || 1);
      m.traverse(function(c) { if (c.isMesh) { c.castShadow = !noShadow; c.receiveShadow = true; } });
      var pivot = new THREE.Group();
      pivot.position.set(x, y, z);
      pivot.rotation.y = faceY;
      pivot.add(m);
      scene.add(pivot);
      spin.push({ o: m, sp: speed });   // m spins about its local X (its native axle)
    }, undefined, function() { console.warn('[3DBG] skip:', name); });
  }

  // Procedural water texture — deep blue gradient with flow lines and sparkle dots
  function makeWaterTex() {
    var c = document.createElement('canvas'); c.width = 128; c.height = 128;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0,   '#0A2D6E');
    grad.addColorStop(0.3, '#1251A8');
    grad.addColorStop(0.7, '#1565C0');
    grad.addColorStop(1,   '#0D3A85');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    // side-to-side shimmer band
    var sh = g.createLinearGradient(0, 0, 128, 0);
    sh.addColorStop(0,   'rgba(40,130,255,0)');
    sh.addColorStop(0.5, 'rgba(120,210,255,0.28)');
    sh.addColorStop(1,   'rgba(40,130,255,0)');
    g.fillStyle = sh; g.fillRect(0, 10, 128, 50);
    // flow lines at varying opacity
    for (var i = 0; i < 9; i++) {
      var y0 = i * 15 + 4;
      var alpha = 0.35 + (i % 3) * 0.2;
      g.strokeStyle = 'rgba(180,235,255,' + alpha + ')';
      g.lineWidth = 1.5 + (i % 2);
      g.beginPath(); g.moveTo(0, y0);
      g.bezierCurveTo(35, y0 - 9, 93, y0 + 9, 128, y0); g.stroke();
    }
    // bright highlight lines
    g.strokeStyle = 'rgba(255,255,255,0.80)'; g.lineWidth = 2;
    for (var j = 0; j < 4; j++) {
      var yh = j * 34 + 10;
      g.beginPath(); g.moveTo(15, yh);
      g.bezierCurveTo(48, yh - 7, 82, yh + 7, 115, yh); g.stroke();
    }
    // sparkle dots
    g.fillStyle = 'rgba(220,245,255,0.95)';
    for (var k = 0; k < 16; k++) {
      g.beginPath();
      g.arc(Math.random()*128, Math.random()*128, 1.5, 0, Math.PI*2); g.fill();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // Foam texture — transparent with white streaks and blobs
  function makeFoamTex() {
    var c = document.createElement('canvas'); c.width = 128; c.height = 128;
    var g = c.getContext('2d');
    g.clearRect(0, 0, 128, 128);
    // foam streaks
    for (var i = 0; i < 6; i++) {
      var y0 = i * 22 + 6;
      g.strokeStyle = 'rgba(255,255,255,' + (0.55 + i * 0.07) + ')';
      g.lineWidth = 4 + (i % 3);
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, y0);
      g.bezierCurveTo(38, y0 - 10, 90, y0 + 10, 128, y0); g.stroke();
    }
    // foam blobs
    for (var j = 0; j < 24; j++) {
      var a = 0.4 + Math.random() * 0.55;
      g.fillStyle = 'rgba(255,255,255,' + a + ')';
      g.beginPath();
      g.arc(Math.random()*128, Math.random()*128, 2 + Math.random()*4, 0, Math.PI*2); g.fill();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // ── BUILDING ASSEMBLER ──────────────────────────────────────────
  // Builds a box of footprint w×d tiles, `storeys` tall, from 1×1 wall
  // panels, capped with a roof. Everything snaps to the integer grid.
  // All buildings are wrapped in a THREE.Group scaled by BSCALE so they
  // appear 1.3× larger without changing the tile-grid placement logic.
  var WALL_H = 1.0;
  var BSCALE = 1.3;
  function building(cx, cz, w, d, storeys, opt) {
    opt = opt || {};
    var wt   = opt.wall  || 'wall';
    var roof = opt.roof  || 'roof-gable';
    // Group centred at (cx, 0, cz); scaling is applied uniformly so the
    // pieces inside use their normal integer-grid local positions.
    var bGroup = new THREE.Group();
    bGroup.position.set(cx, 0, cz);
    bGroup.scale.setScalar(BSCALE);
    if (opt.ry) bGroup.rotation.y = opt.ry;
    scene.add(bGroup);
    // Wall panels only receive shadows; one clean box casts the building's shadow
    bGroup.userData.noShadowCast = true;
    // Invisible box shadow-caster — skip if noShadow is set on the building
    var shadowH = storeys * WALL_H + 0.85;
    if (!opt.noShadow) {
      var shadowMat = new THREE.MeshBasicMaterial({ visible: false });
      var shadowBox = new THREE.Mesh(new THREE.BoxGeometry(w, shadowH, d), shadowMat);
      shadowBox.castShadow = true;
      shadowBox.receiveShadow = false;
      shadowBox.position.set(0, shadowH / 2, 0);
      bGroup.add(shadowBox);
    }
    for (var s = 0; s < storeys; s++) {
      var y = s * WALL_H;
      // left / right faces — skipped if noSideWalls (avoids pole artefacts at building edges)
      if (!opt.noSideWalls) {
        for (var i = 0; i < d; i++) {
          var zc = -d / 2 + 0.5 + i;
          var sideW = (s > 0 && opt.win) ? opt.win : wt;   // windows on upper storeys
          place(sideW, -w / 2, zc, { y: y }, bGroup);
          place(sideW,  w / 2, zc, { y: y }, bGroup);
        }
      }
      // front / back faces (run along X, normal ±Z) — rotated 90°
      for (var j = 0; j < w; j++) {
        var xc = -w / 2 + 0.5 + j;
        var backW = (s > 0 && opt.win) ? opt.win : wt;   // back windows on upper storeys
        place(backW, xc, -d / 2, { y: y, ry: Math.PI / 2 }, bGroup);        // back
        var front = wt;
        if (s === 0 && opt.door !== undefined && j === opt.door) front = opt.doorType || 'wall-doorway-square';
        else if (s > 0 && opt.win) front = opt.win;
        place(front, xc, d / 2, { y: y, ry: Math.PI / 2 }, bGroup);         // front
      }
    }
    // roof — tile across the whole footprint at the top
    var ry0 = storeys * WALL_H;
    if (w === 1 && d === 1 && roof === 'roof-point') {
      place('roof-point', 0, 0, { y: ry0 }, bGroup);
    } else {
      for (var a = 0; a < w; a++) for (var b = 0; b < d; b++) {
        place(roof, -w / 2 + 0.5 + a, -d / 2 + 0.5 + b, { y: ry0 }, bGroup);
      }
    }
    if (opt.chimney) {
      place('chimney', w / 2 - 0.4, -d / 2 + 0.4, { y: ry0 }, bGroup);
      // Register a smoke column SYNCHRONOUSLY (no async GLB-load dependency).
      // Compute the chimney's world position from the group transform.
      var _clx = w / 2 - 0.4, _clz = -d / 2 + 0.4, _cry = opt.ry || 0;
      var _swx = cx + BSCALE * (_clx * Math.cos(_cry) + _clz * Math.sin(_cry));
      var _swz = cz + BSCALE * (-_clx * Math.sin(_cry) + _clz * Math.cos(_cry));
      var _swy = (ry0 + 1.1) * BSCALE;   // just above the chimney mouth / roof peak
      registerSmoke(_swx, _swy, _swz);
    }
  }

  // ════════ TOWN LAYOUT — matches reference order, left → right ════════
  // (z negative = far/back; one storey = 1.0 unit tall)

  // 2) Windmill — tall stone tower + rotor facing the camera
  building(-8.5, -9, 1, 1, 3, { wall: 'wall', roof: 'roof-point', door: 0, win: 'wall-window-small', noSideWalls: true });
  placeSpinner('windmill', -8.5, 3.9, -9, Math.PI / 2, 0.5, 1.3, true);

  // 3) Green-roof house with the JIRAIYA sign — pushed back to align with red-roof house
  building(-2.5, -14, 3, 2, 2, { wall: 'wall-wood', roof: 'roof-gable', door: 1, win: 'wall-wood-window-glass', chimney: true, noSideWalls: true, noShadow: true });
  (function () {
    var cv = document.createElement('canvas'); cv.width = 512; cv.height = 120;
    var g2 = cv.getContext('2d');
    g2.fillStyle = '#EADBB4'; g2.fillRect(0, 0, 512, 120);
    g2.strokeStyle = '#6B4A22'; g2.lineWidth = 12; g2.strokeRect(6, 6, 500, 108);
    g2.fillStyle = '#3A2A14'; g2.font = 'bold 32px "Courier New", monospace';
    g2.textAlign = 'right'; g2.textBaseline = 'bottom';
    g2.fillText('by Fendy SES', 496, 104);
    var tex = new THREE.CanvasTexture(cv);
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(4.7, 1.1), new THREE.MeshBasicMaterial({ map: tex }));
    sign.position.set(-2.5, 3.5, -12.5);
    scene.add(sign);
  }());

  // 4) Red-roof house — squared up to face the camera; noSideWalls kills the edge-on
  //    side panels that showed as a pole (left) and a jutting angled panel (right)
  building(4, -14, 2, 2, 2, { wall: 'wall-wood', roof: 'roof-high-gable', door: 1, win: 'wall-wood-window-glass', chimney: true, noSideWalls: true });

  // 5) Green-roof mill house (right) + camera-facing water wheel + flowing stream
  building(9.5, -9, 2, 2, 2, { wall: 'wall-wood', roof: 'roof-gable', door: 0, win: 'wall-wood-window-glass', chimney: true });
  placeSpinner('watermill', 11.7, 2.0, -7.7, Math.PI / 2, -0.45, 1.7, true);

  // ── Enhanced river ────────────────────────────────────────────────
  // Main water channel
  var streamTex = makeWaterTex(); streamTex.repeat.set(1, 8);
  var streamMat = new THREE.MeshStandardMaterial({
    map: streamTex, transparent: true, opacity: 0.93,
    roughness: 0.05, metalness: 0.25,
    emissive: new THREE.Color(0x0A2D6E), emissiveIntensity: 0.18,
    depthWrite: false
  });
  var stream = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 22), streamMat);
  stream.rotation.x = -Math.PI / 2; stream.rotation.z = -0.28;
  stream.position.set(13.5, 0.05, -1);
  scene.add(stream);
  flow.push({ map: streamTex, sp: 0.4 });
  caustics.push({ tex: streamTex, mat: streamMat, e0: 0.18, eAmp: 0.11, swayAmp: 0.05 });

  // Foam overlay — scrolls faster, additive blend for bright glowing foam
  var foamTex = makeFoamTex(); foamTex.repeat.set(1, 5);
  var foamMat = new THREE.MeshBasicMaterial({
    map: foamTex, transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  var foam = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 22), foamMat);
  foam.rotation.x = -Math.PI / 2; foam.rotation.z = -0.28;
  foam.position.set(13.5, 0.07, -1);
  scene.add(foam);
  flow.push({ map: foamTex, sp: 0.7 });

  // Pond/pool at the base of the mill — wider, glowing
  var pondTex = makeWaterTex(); pondTex.repeat.set(2, 2);
  var pondMat = new THREE.MeshStandardMaterial({
    map: pondTex, transparent: true, opacity: 0.90,
    roughness: 0.04, metalness: 0.30,
    emissive: new THREE.Color(0x0D3A85), emissiveIntensity: 0.22,
    depthWrite: false
  });
  var pond = new THREE.Mesh(new THREE.CircleGeometry(3.0, 36), pondMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(11.5, 0.06, 0.5);
  scene.add(pond);
  flow.push({ map: pondTex, sp: 0.16 });
  caustics.push({ tex: pondTex, mat: pondMat, e0: 0.22, eAmp: 0.10, swayAmp: 0.035 });

  // Pond foam cap
  var pFoamTex = makeFoamTex(); pFoamTex.repeat.set(2, 2);
  var pFoamMat = new THREE.MeshBasicMaterial({
    map: pFoamTex, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  var pFoam = new THREE.Mesh(new THREE.CircleGeometry(3.0, 36), pFoamMat);
  pFoam.rotation.x = -Math.PI / 2;
  pFoam.position.set(11.5, 0.08, 0.5);
  scene.add(pFoam);
  flow.push({ map: pFoamTex, sp: 0.32 });

  // Ripple rings around the pond
  for (var ri = 0; ri < 3; ri++) {
    var rMat = new THREE.MeshBasicMaterial({
      color: 0x5BC8F5, transparent: true, opacity: 0.22 - ri * 0.05,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
    });
    var ring = new THREE.Mesh(new THREE.RingGeometry(2.8 + ri * 0.55, 3.05 + ri * 0.55, 36), rMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(11.5, 0.09, 0.5);
    scene.add(ring);
  }

  // Blue point light above the pond for water glow
  var waterLight = new THREE.PointLight(0x3DAEFF, 1.1, 10, 1.8);
  waterLight.position.set(11.5, 1.8, 0.5);
  scene.add(waterLight);

  // Sparkle particles along the stream banks
  var spkMat = new THREE.MeshBasicMaterial({
    color: 0xAAE8FF, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  for (var si = 0; si < 18; si++) {
    var spk = new THREE.Mesh(new THREE.CircleGeometry(0.12 + Math.random() * 0.14, 6), spkMat);
    spk.rotation.x = -Math.PI / 2;
    spk.position.set(11 + (Math.random() - 0.5) * 5, 0.09, -4 + si * 0.55 + (Math.random() - 0.5));
    scene.add(spk);
  }

  // ════════ SCENERY ════════
  // Dense pine forest backdrop (smaller + pushed back for sky visibility)
  for (var fx = -28; fx <= 28; fx += 2.6) {
    if (fx > -9 && fx < 9) continue;                 // leave the village centre open
    var fz = -21 - Math.abs(Math.sin(fx * 0.7)) * 4 - Math.random() * 2;
    place('tree-high', fx + (Math.random() - 0.5) * 1.2, fz, { s: 0.85 + Math.random() * 0.35, wind: true, windAmp: 0.04 });
  }
  // A second, sparser forest row
  for (var gx = -26; gx <= 26; gx += 4.5) {
    place('tree-high', gx + (Math.random() - 0.5), -30 - Math.random() * 4, { s: 0.9 + Math.random() * 0.45, wind: true, windAmp: 0.04 });
  }

  // Village trees — left-side trees cast shadows; right-side trees (x>10) are near
  // the stream and cast distracting foreground shadows, so noShadow on those.
  [
    ['tree-high',-13,-7,1.7],
      ['tree',-11,-3,1.6],['tree-crooked',-13,1,1.5],
    ['tree',-3.5,-6,1.4],['tree',4.5,-6.5,1.4],
  ].forEach(function(t) { place(t[0], t[1], t[2], { s: t[3], wind: true, windAmp: 0.07 }); });
  // Right-side trees: noShadow to eliminate the lower-right foreground shadow
  [
    ['tree-high',13,-8,1.7],
    ['tree',12,-2,1.6],
    ['tree-crooked',13,1,1.5],
  ].forEach(function(t) { place(t[0], t[1], t[2], { s: t[3], noShadow: true, wind: true, windAmp: 0.07 }); });

  // Rocks — no directional shadows (too small, create clutter near the stream)
  [
    ['rock-large',-13,2,1.8],['rock-wide',-13.5,0.5,1.5],
    ['rock-large',13,2.5,1.8],['rock-wide',13.5,1,1.5],['rock-small',12.5,3,1.1],
  ].forEach(function(r) { place(r[0], r[1], r[2], { s: r[3], tint: 0x9C968A, noShadow: true }); });

  // ── Waving grass tufts ── upright blade clusters that sway in the wind
  var grassTuftTex = (function() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'); g.clearRect(0, 0, 64, 64);
    function blade(x, h, w, col) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x, 64);
      g.quadraticCurveTo(x + w * 0.5, 64 - h * 0.6, x + w, 64 - h);
      g.lineTo(x + w + 2.5, 64 - h + 3);
      g.quadraticCurveTo(x + w * 0.6, 64 - h * 0.55, x + 2.5, 64); g.fill();
    }
    blade(20, 46, 4, '#5BA82E'); blade(30, 58, 5, '#6BBF38');
    blade(40, 40, 4, '#4E9626'); blade(26, 34, 3, '#7ACB45'); blade(46, 30, 3, '#5BA82E');
    return new THREE.CanvasTexture(c);
  })();
  var grassTuftMat = new THREE.MeshStandardMaterial({ map: grassTuftTex, transparent: true,
    alphaTest: 0.35, side: THREE.DoubleSide, roughness: 1, metalness: 0 });
  patchWindMat(grassTuftMat, { amp: 0.16, sway: 1.8 });
  var grassTuftGeo = new THREE.PlaneGeometry(0.75, 0.75);
  grassTuftGeo.translate(0, 0.375, 0);   // pivot at base so the whole blade sways from the ground
  for (var gt = 0; gt < 70; gt++) {
    var gAng = Math.random() * Math.PI * 2, gRad = 4 + Math.random() * 10;
    var gZ = 1 + Math.sin(gAng) * gRad * 0.55;
    if (gZ < -4) continue;               // keep tufts out of the far building row
    var tuft = new THREE.Mesh(grassTuftGeo, grassTuftMat);
    tuft.position.set(Math.cos(gAng) * gRad, 0, gZ);
    tuft.rotation.y = Math.random() * Math.PI;
    tuft.castShadow = false; tuft.receiveShadow = true;
    scene.add(tuft);
  }

  // ── Swaying flowers ── upright little blossoms on stems that nod in the breeze
  var flowerTex = (function() {
    var c = document.createElement('canvas'); c.width = c.height = 32;
    var g = c.getContext('2d'); g.clearRect(0, 0, 32, 32);
    g.strokeStyle = '#3E8E2C'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(16, 32); g.lineTo(16, 15); g.stroke();
    g.fillStyle = '#FFFFFF';
    for (var i = 0; i < 5; i++) { var a = i * 1.2566;
      g.beginPath(); g.ellipse(16 + Math.cos(a) * 5, 11 + Math.sin(a) * 5, 3, 4.2, a, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#FFC107'; g.beginPath(); g.arc(16, 11, 2.6, 0, Math.PI * 2); g.fill();
    return new THREE.CanvasTexture(c);
  })();
  var flowerMat = new THREE.MeshStandardMaterial({ map: flowerTex, transparent: true,
    alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1, metalness: 0 });
  patchWindMat(flowerMat, { amp: 0.12, sway: 1.4 });
  var flowerGeo = new THREE.PlaneGeometry(0.5, 0.5);
  flowerGeo.translate(0, 0.25, 0);
  for (var fi = 0; fi < 22; fi++) {
    var fAng = Math.random() * Math.PI * 2, fRad = 7 + Math.random() * 8;
    var fl = new THREE.Mesh(flowerGeo, flowerMat);
    fl.position.set(Math.cos(fAng) * fRad, 0, 1 + Math.sin(fAng) * fRad * 0.5);
    fl.rotation.y = Math.random() * Math.PI;
    scene.add(fl);
  }

  // One cart — characters occasionally stroll over and hop on top (cart-visit director).
  // Also publish its screen-space footprint so the Phaser collision layer treats it as
  // a solid obstacle (characters path around it instead of walking through it).
  place('cart', -3, -3, { ry: 0.5, s: 1.56, noShadow: true, onload: function (m) {
    var b = new THREE.Box3().setFromObject(m);
    CART = { x: m.position.x, z: m.position.z, top: b.max.y };
    var proj = function (wx, wy, wz) {
      var v = new THREE.Vector3(wx, wy, wz).project(camera);
      return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
    };
    var c  = proj(CART.x, 0, CART.z);                              // base centre on screen
    var ex = proj(CART.x + (b.max.x - b.min.x) * 0.5, 0, CART.z);  // footprint edge
    var rx = Math.max(20, Math.abs(ex.x - c.x) * 1.15);
    window.CART_BLOCK = { x: c.x, y: c.y, rx: rx, ry: rx * 0.7 };
  } });

  // (lanterns removed)


  // ════════════════════════════════════════════════════════
  // 3D MINI-CHARACTERS — synced from Phaser NPC positions
  // ════════════════════════════════════════════════════════
  var CHAR_BASE = 'assets/kenney_mini-characters/Models/GLB%20format/';
  var CHAR_MAP = {
    Jiraiya: { file: 'character-male-d',   scale: 1.6, baseRY: 0 },
    Naruto:  { file: 'character-male-e',   scale: 1.5, baseRY: 0 },
    Sasuke:  { file: 'character-male-f',   scale: 1.5, baseRY: 0 },
    Sakura:  { file: 'character-female-b', scale: 1.45, baseRY: 0 },
    Hinata:  { file: 'character-female-e', scale: 1.45, baseRY: 0 },
  };

  var char3d      = {};   // name → THREE.Group
  var charBob     = {};   // accumulated bob time per char (kept for fighting shake)
  var charYOff    = {};   // ground y-offset per char (from bounding box)
  var charMixer   = {};   // name → THREE.AnimationMixer
  var charClips   = {};   // name → { clipName: THREE.AnimationAction }
  var charCurAnim = {};   // name → currently playing clip name
  var goldTrails  = [];   // active golden afterimage clones for Jiraiya

  // ── Cart-visit director + idle fidgets ──────────────────────────────────
  // The Phaser sprites are invisible/logic-only, so these behaviours live here
  // in 3D. A character occasionally strolls to the wheelbarrow, hops on top,
  // does a happy little dance, then hops down — driven by overriding that one
  // character's position for the duration. Idle characters also play random
  // emote "fidgets" so they aren't frozen between walks.
  var CART         = null;   // {x, z, top}  filled when the cart GLB loads
  var cartShow     = null;   // {name, phase, t, danceT} while a visit runs
  var cartCooldown = 6;      // seconds until the next visit may start
  var charFidget   = {};     // name → {t, dur} one-shot idle emote in progress
  var fidgetTimer  = {};     // name → seconds until next idle fidget

  // Play a one-shot (non-looping) clip; returns its duration (0 if missing).
  function playCharOnce(name, clipName) {
    var clips = charClips[name];
    if (!clips || !clips[clipName]) return 0;
    var prev = charCurAnim[name];
    if (prev && prev !== clipName && clips[prev]) clips[prev].fadeOut(0.15);
    var a = clips[clipName];
    a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true;
    a.fadeIn(0.15).play();
    charCurAnim[name] = clipName;
    return a.getClip().duration;
  }

  // Move m toward (tx,tz) at spd units/sec, facing travel direction; returns
  // the distance that remained at the start of this step.
  function stepToward(m, tx, tz, spd, dt) {
    var dx = tx - m.position.x, dz = tz - m.position.z;
    var dist = Math.sqrt(dx * dx + dz * dz) || 0.0001;
    var step = Math.min(dist, spd * dt);
    m.position.x += (dx / dist) * step;
    m.position.z += (dz / dist) * step;
    if (Math.abs(dx) > 0.0001) {
      var tRY = dx > 0 ? Math.PI * 0.25 : -Math.PI * 0.25;
      m.rotation.y += (tRY - m.rotation.y) * 0.18;
    }
    return dist;
  }

  // Advance the active cart visit for one character (position + animation).
  function updateCartVisit(name, m, d, dt) {
    var cs = cartShow, base = charYOff[name];
    var groundY = base, topY = CART.top + base;
    cs.t += dt;
    if (cs.phase === 'approach') {
      m.position.y = groundY;
      setCharAnim(name, 'walk');
      if (stepToward(m, CART.x, CART.z, 2.4, dt) < 0.35) {
        cs.phase = 'hopon'; cs.t = 0; playCharOnce(name, 'jump');
      }
    } else if (cs.phase === 'hopon') {
      var k = Math.min(1, cs.t / 0.5);
      m.position.x = CART.x; m.position.z = CART.z;
      m.position.y = groundY + (topY - groundY) * k + Math.sin(k * Math.PI) * 0.4; // arc
      if (cs.t >= 0.5) { cs.phase = 'dance'; cs.t = 0; cs.danceT = 0; }
    } else if (cs.phase === 'dance') {
      m.position.x = CART.x; m.position.z = CART.z; m.position.y = topY;
      m.rotation.y += (Math.PI * 0.25 - m.rotation.y) * 0.1;   // turn to face camera
      cs.danceT -= dt;
      if (cs.danceT <= 0) {
        var moves = ['emote-yes', 'jump', 'emote-yes', 'emote-no'];
        playCharOnce(name, moves[Math.floor(Math.random() * moves.length)]);
        cs.danceT = 1.0;
      }
      if (cs.t >= 6.5) { cs.phase = 'hopoff'; cs.t = 0; playCharOnce(name, 'jump'); }
    } else if (cs.phase === 'hopoff') {
      var k2 = Math.min(1, cs.t / 0.45);
      m.position.x = CART.x; m.position.z = CART.z;
      m.position.y = topY + (groundY - topY) * k2;
      if (cs.t >= 0.45) { cs.phase = 'leave'; cs.t = 0; }
    } else {   // 'leave' — walk back toward the (invisible) sprite, then release
      m.position.y = groundY;
      setCharAnim(name, 'walk');
      var wp = phaserTo3D(d.x, d.y);
      var rem = wp ? stepToward(m, wp.x, wp.z, 2.2, dt) : 0;
      if (!wp || rem < 0.4 || cs.t > 6) { cartShow = null; cartCooldown = 14 + Math.random() * 14; }
    }
  }

  // Correct 2D→3D mapping: shoot a ray from the camera through the Phaser
  // screen position and intersect with the ground plane (y=0).
  // This handles the perspective camera correctly — no linear approximation needed.
  var _rGround = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  var _rCaster = new THREE.Raycaster();
  var _rNDC    = new THREE.Vector2();
  var _rPoint  = new THREE.Vector3();

  function phaserTo3D(px, py) {
    _rNDC.x =  (px / W) * 2 - 1;
    _rNDC.y = -(py / H) * 2 + 1;   // NDC: +1 = screen top, −1 = screen bottom
    _rCaster.setFromCamera(_rNDC, camera);
    return _rCaster.ray.intersectPlane(_rGround, _rPoint)
      ? { x: _rPoint.x, z: _rPoint.z }
      : null;
  }

  Object.keys(CHAR_MAP).forEach(function(name) {
    var cfg = CHAR_MAP[name];
    charBob[name]  = Math.random() * Math.PI * 2;
    charYOff[name] = 0;
    loader.load(CHAR_BASE + cfg.file + '.glb', function(gltf) {
      var m = gltf.scene;
      m.scale.setScalar(cfg.scale);
      m.rotation.y = cfg.baseRY;
      m.traverse(function(c) {
        if (!c.isMesh) return;
        c.castShadow = true;
        c.receiveShadow = true;

        // Skinned character meshes need material.skinning=true or the shadow pass
        // spams "SkinnedMesh with material.skinning set to false" every frame
        if (c.isSkinnedMesh && c.material) {
          (Array.isArray(c.material) ? c.material : [c.material]).forEach(function(mm) {
            mm.skinning = true; mm.needsUpdate = true;
          });
        }

        // Force nearest-filter on the flat-color atlas (prevents UV-boundary colour bleed)
        if (c.material && c.material.map) {
          c.material.map.minFilter = THREE.NearestFilter;
          c.material.map.magFilter = THREE.NearestFilter;
          c.material.map.needsUpdate = true;
        }

        // ── Head geometry fix: hair covers face in complex-hair characters ──
        // Root cause (verified in binary): spiky/long hair verts extend to Z=0.17-0.21
        // in the same Y band as the face (Z=0.160), blocking it from the camera.
        // Fix: (a) push face-feature verts (26-vert U=0.094 cluster) to Z=0.175
        //      (b) clamp any hair vert at face-level Y with Z>0.162 back to Z=0.145
        if (c.name === 'head-mesh' && c.geometry) {
          var geom = c.geometry;
          var uvAttr  = geom.attributes.uv;
          var posAttr = geom.attributes.position;
          if (uvAttr && posAttr) {
            // Count verts in the U≈0.094 group: ≤30 → face features, >30 → hair (Sasuke/Hinata)
            var n094 = 0;
            for (var vi = 0; vi < uvAttr.count; vi++) {
              if (Math.abs(uvAttr.getX(vi) - 0.094) < 0.015) n094++;
            }
            var u094isFace = (n094 <= 30);
            var dirty = false;
            for (var vi = 0; vi < uvAttr.count; vi++) {
              var pu = uvAttr.getX(vi);
              var py = posAttr.getY(vi);
              var pz = posAttr.getZ(vi);
              if (u094isFace && Math.abs(pu - 0.094) < 0.015) {
                // Face-feature verts: pull forward so hair can't block them
                if (pz < 0.175) { posAttr.setZ(vi, 0.175); dirty = true; }
              } else if (pz > 0.162 && py > 0.35 && py < 0.55) {
                // Any vert at face-level Y protruding in front of face: push back
                posAttr.setZ(vi, 0.145); dirty = true;
              }
            }
            if (dirty) {
              posAttr.needsUpdate = true;
              geom.computeBoundingBox();
              geom.computeBoundingSphere();
            }
          }
        }
      });
      // snap model bottom to y=0
      m.updateWorldMatrix(true, true);
      var box = new THREE.Box3().setFromObject(m);
      charYOff[name] = -box.min.y;
      m.position.set(0, -99, 0);
      scene.add(m);
      char3d[name] = m;

      // ── Animation mixer ──
      var mixer = new THREE.AnimationMixer(m);
      charMixer[name]   = mixer;
      charClips[name]   = {};
      charCurAnim[name] = '';
      gltf.animations.forEach(function(clip) {
        charClips[name][clip.name] = mixer.clipAction(clip);
      });
      // start in idle immediately
      if (charClips[name]['idle']) {
        charClips[name]['idle'].play();
        charCurAnim[name] = 'idle';
      }
      console.log('[3D char] loaded', name, '— clips:', Object.keys(charClips[name]).join(', '));
    }, undefined, function() { console.warn('[3D char] FAILED to load:', name); });
  });

  // Crossfade to a new animation clip (no-op if already playing that clip)
  function setCharAnim(name, clipName) {
    if (charCurAnim[name] === clipName) return;
    var clips = charClips[name];
    if (!clips || !clips[clipName]) return;
    var prev = charCurAnim[name];
    if (prev && clips[prev]) {
      clips[prev].fadeOut(0.20);
    }
    clips[clipName].reset().fadeIn(0.20).play();
    charCurAnim[name] = clipName;
  }

  // Spawn a golden 3D clone of Jiraiya at his current position (replaces the old 2D ghost)
  function spawnGoldTrail() {
    var src = char3d['Jiraiya'];
    if (!src || src.position.y < -90) return;   // not yet loaded / parked off-screen
    var ghost = src.clone(true);
    ghost.traverse(function(c) {
      if (c.isMesh) {
        c.material = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.55, depthWrite: false, skinning: c.isSkinnedMesh });
        c.castShadow = false;        // gold afterimages don't cast shadows → keeps skinned
        c.receiveShadow = false;     // clones out of the shadow pass (no skinning warning)
      }
    });
    ghost.position.copy(src.position);
    ghost.rotation.copy(src.rotation);
    ghost.scale.copy(src.scale);
    scene.add(ghost);
    goldTrails.push({ m: ghost, age: 0, life: 0.48 });
  }
  window._spawnGoldTrail = spawnGoldTrail;

  // Unified character interaction: drag any character, click Jiraiya for diary.
  // Driven by Three.js raycasting so the 3D model is the real hitbox.
  (function setupCharacterInteraction() {
    var wrap   = document.getElementById('game-wrap');
    var _rc    = new THREE.Raycaster();
    var _ndc   = new THREE.Vector2();
    var _active = null;   // name of NPC being interacted with
    var _downX = 0, _downY = 0, _isDrag = false;

    function pickCharacter(e) {
      var rect = wrap.getBoundingClientRect();
      _ndc.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      _ndc.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      _rc.setFromCamera(_ndc, camera);
      var names = Object.keys(char3d);
      for (var i = 0; i < names.length; i++) {
        if (_rc.intersectObject(char3d[names[i]], true).length > 0) return names[i];
      }
      return null;
    }

    wrap.addEventListener('pointerdown', function(e) {
      _downX = e.clientX; _downY = e.clientY; _isDrag = false;
      _active = pickCharacter(e);
      if (_active && window._npcs && window._npcs[_active]) {
        var npc = window._npcs[_active];
        npc.wasDragged = false;
        npc.vx = 0; npc.vy = 0; npc.summoned = true;
        npc.setState('idle');
      }
    });

    wrap.addEventListener('pointermove', function(e) {
      if (!_active || !e.buttons) return;
      var dx = e.clientX - _downX, dy = e.clientY - _downY;
      if (!_isDrag && dx * dx + dy * dy > 36) _isDrag = true;   // 6px threshold
      if (!_isDrag) return;

      var rect = wrap.getBoundingClientRect();
      var meta = window._NPC_META || { walkMinY: 144 };
      var pX = Math.max(55, Math.min(GW - 55,
        (e.clientX - rect.left) / rect.width  * GW));
      var pY = Math.max(meta.walkMinY, Math.min(GH - 22,
        (e.clientY - rect.top)  / rect.height * GH));

      if (window._npcs && window._npcs[_active]) {
        var npc = window._npcs[_active];
        npc.sprite.setPosition(pX, pY);
        npc.wasDragged = true;
        wrap.style.cursor = 'grabbing';
      }
    });

    wrap.addEventListener('pointerup', function(e) {
      var name = _active;
      _active  = null;
      wrap.style.cursor = '';

      if (_isDrag) {
        _isDrag = false;
        if (name && window._npcs && window._npcs[name]) {
          var npc = window._npcs[name];
          npc.summoned = false;
          npc.pickTarget();
        }
        return;
      }

      // Pure click (no drag) — open diary if Jiraiya
      if (name === 'Jiraiya') {
        var npc = window._jiraiyaNPC;
        if (npc && typeof showDiaryBubble === 'function') showDiaryBubble(npc);
      }
    });
  }());

  // Replace the initial render loop with one that also syncs character positions
  (function patchLoop() {
    renderer.setAnimationLoop(function() {
      var dt = clock.getDelta();

      updateDayNight();   // sky/sun/fog/lights follow the real local clock

      // windmill blades + water wheel + river scroll
      for (var i = 0; i < spin.length; i++) spin[i].o.rotation.x += spin[i].sp * dt;
      for (var j = 0; j < flow.length; j++) flow[j].map.offset.y -= flow[j].sp * dt;

      // ── effects driven from THIS (the live) loop: wind sway, water caustics, chimney smoke ──
      var tNow = clock.elapsedTime;
      windUniforms.uTime.value = tNow;                       // tree / grass / flower sway
      for (var cci = 0; cci < caustics.length; cci++) {      // water shimmer + emissive pulse
        var ccx = caustics[cci];
        ccx.tex.offset.x = Math.sin(tNow * 0.6 + cci) * ccx.swayAmp;
        if (ccx.mat) ccx.mat.emissiveIntensity = ccx.e0 + Math.sin(tNow * 1.3 + cci * 1.7) * ccx.eAmp;
      }
      updateSmoke(dt);                                       // chimney smoke puffs

      // clouds drift left → right; wrap at x=50 back to x=-50
      for (var ci = 0; ci < clouds3d.length; ci++) {
        clouds3d[ci].g.position.x += clouds3d[ci].spd * dt;
        if (clouds3d[ci].g.position.x > 50) clouds3d[ci].g.position.x = -50;
      }

      // bird flocks cross the sky
      nextFlockIn -= dt;
      if (nextFlockIn <= 0) { spawnFlock(); nextFlockIn = 30 + Math.random() * 45; }
      for (var fi = birdFlocks.length - 1; fi >= 0; fi--) {
        var fk = birdFlocks[fi];
        fk._age += dt;
        fk.position.x += fk._spd * dt;
        fk.position.y = fk._baseY + Math.sin(fk._age * 0.9) * 0.18;
        fk.children.forEach(function(b) {
          b.rotation.z = Math.sin(fk._age * 5.5 + b._phase) * 0.04;
        });
        if (fk.position.x > 36) { scene.remove(fk); birdFlocks.splice(fi, 1); }
      }

      // tick all animation mixers
      Object.keys(charMixer).forEach(function(name) { charMixer[name].update(dt); });

      // sync 3D characters from Phaser NPC state
      var npcData = window._NPC_STATE;
      var meta    = window._NPC_META;
      if (npcData && meta) {
        Object.keys(char3d).forEach(function(name) {
          var m = char3d[name];
          var d = npcData[name];
          if (!d) return;

          // ── Cart visit overrides this character's position + animation ──
          if (cartShow && cartShow.name === name && CART) {
            updateCartVisit(name, m, d, dt);
            m.scale.setScalar(CHAR_MAP[name].scale);
            return;
          }

          var wp = phaserTo3D(d.x, d.y);
          if (!wp) return;

          m.position.x = wp.x;
          m.position.z = wp.z;
          m.position.y = charYOff[name];   // animation drives vertical pose; we just ground it

          var isMoving = (d.state === 'walking' || d.state === 'post-battle');
          if (isMoving) {
            charFidget[name] = null;
            setCharAnim(name, 'walk');
            if (Math.abs(d.vx) > 0.0001) {
              // +π/4 = faces right (+X toward camera); −π/4 = faces left (−X toward camera)
              var targetRY = d.vx > 0 ? Math.PI * 0.25 : -Math.PI * 0.25;
              m.rotation.y += (targetRY - m.rotation.y) * 0.18;
            }
          } else if (d.state === 'fighting') {
            charFidget[name] = null;
            setCharAnim(name, 'attack-melee-right');
            // rotate to face the opponent (the other NPC currently in fighting state)
            var nNames = Object.keys(npcData);
            for (var fi = 0; fi < nNames.length; fi++) {
              var oName = nNames[fi];
              if (oName === name) continue;
              var od = npcData[oName];
              if (!od || od.state !== 'fighting') continue;
              var owp = phaserTo3D(od.x, od.y);
              if (owp) {
                // atan2(dx, dz) gives rotation.y angle to face toward opponent in XZ plane
                var fightRY = Math.atan2(owp.x - m.position.x, owp.z - m.position.z);
                m.rotation.y += (fightRY - m.rotation.y) * 0.18;
              }
              break;
            }
          } else {
            // idle — play a random emote "fidget" now and then so they aren't frozen
            if (charFidget[name]) {
              charFidget[name].t += dt;
              if (charFidget[name].t >= charFidget[name].dur) charFidget[name] = null;
            } else {
              setCharAnim(name, 'idle');
              var ft = fidgetTimer[name];
              fidgetTimer[name] = (ft === undefined) ? (5 + Math.random() * 9) : ft - dt;
              if (fidgetTimer[name] <= 0) {
                var emotes = ['emote-yes', 'emote-no', 'crouch', 'interact-right', 'pick-up'];
                var dur = playCharOnce(name, emotes[Math.floor(Math.random() * emotes.length)]);
                if (dur) charFidget[name] = { t: 0, dur: dur };
                fidgetTimer[name] = 8 + Math.random() * 12;
              }
            }
            m.rotation.y += (CHAR_MAP[name].baseRY - m.rotation.y) * 0.05;
          }
          m.scale.setScalar(CHAR_MAP[name].scale);
        });

        // ── Cart-visit director: occasionally send a wandering character over ──
        if (CART && !cartShow) {
          cartCooldown -= dt;
          if (cartCooldown <= 0) {
            var cand = [];
            Object.keys(char3d).forEach(function (nm) {
              var dd = npcData[nm];
              if (dd && (dd.state === 'walking' || dd.state === 'idle')) cand.push(nm);
            });
            if (cand.length) {
              cartShow = { name: cand[Math.floor(Math.random() * cand.length)], phase: 'approach', t: 0, danceT: 0 };
              charFidget[cartShow.name] = null;
            }
            cartCooldown = 6;   // re-check window if nobody was available
          }
        }
      }

      // fade out Jiraiya gold afterimage clones
      for (var k = goldTrails.length - 1; k >= 0; k--) {
        goldTrails[k].age += dt;
        var tp = goldTrails[k].age / goldTrails[k].life;
        var op = Math.max(0, 0.55 * (1 - tp));
        goldTrails[k].m.traverse(function(c) { if (c.isMesh) c.material.opacity = op; });
        if (tp >= 1) {
          scene.remove(goldTrails[k].m);
          goldTrails.splice(k, 1);
        }
      }

      composer.render();
    });
  }());

}());

