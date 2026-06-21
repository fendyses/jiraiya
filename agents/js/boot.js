'use strict';
// ════════════════════════════════════════════════════════
// BOOT — wires the panels, the Phaser game and the 3D village together.
// Loaded after monitors.js / agents-scene.js / panels.js, before village3d.js.
// ════════════════════════════════════════════════════════

// ── Lite mode — a battery saver ──────────────────────────────────────────────
// When ON, the 3D village and the Phaser game freeze (their render loops stop)
// while the live gauges, repos and todo keep updating. The choice is remembered
// across reloads. Components subscribe and react; subscribe() also fires once
// immediately with the current state so late-loading code self-syncs.
window.LiteMode = (function () {
  const KEY = 'jiraiya.lite';
  let on = localStorage.getItem(KEY) === '1';
  const subs = [];
  function emit() { subs.forEach(function (f) { try { f(on); } catch (e) {} }); }
  return {
    get: function () { return on; },
    set: function (v) { on = !!v; localStorage.setItem(KEY, on ? '1' : '0'); emit(); },
    toggle: function () { this.set(!on); },
    subscribe: function (f) { subs.push(f); try { f(on); } catch (e) {} }
  };
})();

buildUI();
buildMonitors();
buildRepoPanel();
tick(); setInterval(tick, 1000);

const wrap = document.getElementById('game-wrap');
const cols = Math.max(16, Math.floor((wrap.clientWidth || 960) / DISP));
const GW = cols * DISP;
const GH = 9 * DISP;

window.BG3D_SIZE = { w: GW, h: GH };
window.dispatchEvent(new CustomEvent('bg3dReady', { detail: { w: GW, h: GH } }));

const game = new Phaser.Game({
  type: Phaser.AUTO,
  banner: false,
  audio: { noAudio: true },   // dashboard has no sound — skip Web Audio init entirely
  width: GW, height: GH,
  parent: 'game-container',
  transparent: true,
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY, width: GW, height: GH },
  scene: GameScene
});

// Freeze / wake the Phaser game loop with Lite mode (village3d.js handles the 3D side).
window.LiteMode.subscribe(function (on) {
  if (game.loop) { on ? game.loop.sleep() : game.loop.wake(); }
});

// Header Lite-mode toggle button.
(function liteToggle() {
  const btn = document.getElementById('liteToggle');
  if (!btn) return;
  window.LiteMode.subscribe(function (on) {
    btn.classList.toggle('on', !on);           // "on" class = Live (glowing); Lite = dim
    btn.textContent = on ? '◌ LITE' : '◉ LIVE';
    btn.title = on
      ? 'Lite mode ON — 3D village frozen to save battery. Click for Live.'
      : 'Live mode — click to freeze the village (Lite) and save battery.';
  });
  btn.addEventListener('click', function () { window.LiteMode.toggle(); });
})();

// Keep the repositories panel exactly as tall as the game window, scrolling its
// list internally. Desktop only — on mobile the panel stacks and sizes to content.
(function syncRepoHeight() {
  const panel = document.getElementById('repoPanel');
  const gw = document.getElementById('game-wrap');
  if (!panel || !gw) return;
  const apply = () => { panel.style.height = (window.innerWidth <= 780) ? '' : gw.offsetHeight + 'px'; };
  apply();
  if (window.ResizeObserver) new ResizeObserver(apply).observe(gw);
  window.addEventListener('resize', apply);
  setTimeout(apply, 300); setTimeout(apply, 1200);
})();
