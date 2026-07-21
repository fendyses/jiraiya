<?php
// Auth gate — only authenticated sessions may load the dashboard.
require __DIR__ . '/../auth.php';
jiraiya_require_auth('../index.php');

// ── JIRAIYA cockpit: read active project + open reminders from the memory files ──
$REPO = dirname(__DIR__);
$ck_md = function ($s) {                       // strip light markdown, then escape
    $s = preg_replace('/\*\*(.+?)\*\*/', '$1', $s);
    $s = preg_replace('/`([^`]+)`/', '$1', $s);
    return htmlspecialchars(trim($s));
};
$projName = $projDesc = $projStatus = '';
if ($sess = @file_get_contents($REPO . '/main/current-session.md')) {
    if (preg_match('/\*\*Current Project\*\*:\s*(.+)/', $sess, $m)) {
        $line = trim($m[1]);
        if (preg_match('/^(.+?)\s*\(.*?\)\s*[—-]*\s*(.*)$/', $line, $mm)) {
            $projName = trim($mm[1]); $projDesc = trim($mm[2]);
        } else { $projName = $line; }
    }
    if (preg_match('/\*\*Status\*\*:\s*(.+)/', $sess, $m)) $projStatus = trim($m[1]);
}
$todoOngoing = [];
if ($td = @file_get_contents($REPO . '/main/todo.md')) {
    if (preg_match('/##\s*Ongoing(.*?)(?:##\s*Completed|$)/s', $td, $m) &&
        preg_match_all('/^\s*-\s+\d{4}-\d{2}-\d{2}\s*::\s*(.+?)\s*$/m', $m[1], $items)) {
        $todoOngoing = array_map('trim', $items[1]);
    }
}

// ── Skills: discover active plugins directly from their SKILL.md frontmatter ──
$skills = [];
foreach (glob($REPO . '/plugins/ses-skills/skills/*/SKILL.md') ?: [] as $skillFile) {
    $skillMd = @file_get_contents($skillFile);
    if (!$skillMd || !preg_match('/\A---\s*\R(.*?)\R---/s', $skillMd, $frontmatter)) continue;

    if (!preg_match('/^name:\s*["\']?([^"\'\r\n]+)["\']?\s*$/m', $frontmatter[1], $nameMatch)) continue;
    $name = trim($nameMatch[1]);
    $description = '';
    if (preg_match('/^description:\s*"((?:[^"\\\\]|\\\\.)*)"/ms', $frontmatter[1], $descriptionMatch)) {
        $description = stripcslashes($descriptionMatch[1]);
    } elseif (preg_match("/^description:\\s*'([^']*)'/ms", $frontmatter[1], $descriptionMatch)) {
        $description = $descriptionMatch[1];
    } elseif (preg_match('/^description:\s*(.+)$/m', $frontmatter[1], $descriptionMatch)) {
        $description = $descriptionMatch[1];
    }
    $description = trim(preg_replace('/\s+/', ' ', $description));
    $simpleDescription = preg_split('/(?<=[.!?])\s+/', $description, 2)[0] ?? $description;

    preg_match_all("/'([^']+)'/", $description, $triggerMatches);
    $triggers = array_values(array_unique(array_filter(
        $triggerMatches[1] ?? [],
        fn($trigger) => mb_strlen($trigger) <= 60
    )));

    preg_match_all('/^###\s+(?:Step\s+\d+|Fasa\s+\d+)\s*[—–-]?\s*(.+)$/mi', $skillMd, $stepMatches);
    $steps = array_slice(array_map(
        fn($step) => trim(preg_replace('/[*_`]/', '', $step)),
        $stepMatches[1] ?? []
    ), 0, 5);

    // Slash invocation: Claude Code dispatches on the folder name via .claude/skills/<dir>.
    $slug = basename(dirname($skillFile));
    $slash = '/' . $slug;
    $hasNativePointer = is_file($REPO . '/.claude/skills/' . $slug . '/SKILL.md');

    // The slash command is shown on its own, so drop it from the spoken-trigger list.
    $triggers = array_values(array_filter(
        $triggers,
        fn($trigger) => strcasecmp(ltrim($trigger, '/!'), $slug) !== 0
    ));

    $skills[] = [
        'name' => $name,
        'slash' => $slash,
        'native' => $hasNativePointer,
        'description' => $simpleDescription ?: 'Runs the documented JIRAIYA skill protocol.',
        'usage' => ($hasNativePointer ? 'Type “' . $slash . '”' : 'No slash command registered')
            . ($triggers
                ? ', or say “' . implode('”, “', array_slice($triggers, 0, 4)) . '”.'
                : '; otherwise it activates automatically when your request matches this workflow.'),
        'process' => $steps
            ? implode(' → ', $steps)
            : 'Loads its SKILL.md instructions, follows the protocol, and reports the result.',
    ];
}
usort($skills, fn($a, $b) => strcasecmp($a['name'], $b['name']));

// ── Repositories: load from the portable .env registry (see /.env) ──
// Colour/label map for language tags. Tags not listed fall back to a grey badge.
$LANG_DEFS = [
    'laravel' => ['label' => 'Laravel',    'color' => '#FF2D20'],
    'vue'     => ['label' => 'Vue.js',     'color' => '#42B883'],
    'angular' => ['label' => 'Angular',    'color' => '#f218ca'],
    'php'     => ['label' => 'PHP',        'color' => '#00b3ff'],
    'ts'      => ['label' => 'TypeScript', 'color' => '#3178C6'],
    'md'      => ['label' => 'Markdown',   'color' => '#D4A017'],
    'js'      => ['label' => 'JavaScript', 'color' => '#F7DF1E'],
];
$repoSys = [];
if ($envRaw = @file_get_contents($REPO . '/.env')) {
    foreach (preg_split('/\r\n|\r|\n/', $envRaw) as $ln) {
        $ln = trim($ln);
        if ($ln === '' || $ln[0] === '#') continue;                 // skip blanks + comments
        if (!preg_match('/^REPO(?:\[\])?\s*=\s*(.+)$/i', $ln, $m)) continue;
        $parts = array_map('trim', explode('|', $m[1]));
        if (($parts[0] ?? '') === '') continue;                     // name is required
        $langs = (isset($parts[1]) && $parts[1] !== '')
            ? array_values(array_filter(array_map('trim', explode(',', $parts[1])), 'strlen'))
            : [];
        $entry = [
            'name'     => $parts[0],
            'langs'    => $langs,
            'note'     => $parts[2] ?? '',
            'path'     => $parts[3] ?? '',
            'category' => $parts[5] ?? '',
        ];
        if (isset($parts[4]) && strtolower($parts[4]) === 'active') $entry['active'] = true;
        $repoSys[] = $entry;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JIRAIYA — Live Agent Ecosystem</title>
  <script>
  // Quiet known-harmless third-party console noise so real errors stay visible.
  // Flip window.JIRAIYA_DEBUG = true (here or in the console) to restore verbose logs.
  window.JIRAIYA_DEBUG = false;
  (function () {
    var MUTE = [
      'KHR_texture_transform'  // GLTFLoader: custom UV sets unsupported — harmless, from the Kenney models
    ];
    var _warn = console.warn.bind(console);
    console.warn = function () {
      var msg = arguments.length ? String(arguments[0]) : '';
      for (var i = 0; i < MUTE.length; i++) if (msg.indexOf(MUTE[i]) !== -1) return;
      return _warn.apply(console, arguments);
    };
  })();
  </script>
  <!-- Precompiled Tailwind (built from tailwind.config.js — no runtime CDN/JIT) -->
  <link rel="stylesheet" href="css/tailwind.css">
  <!-- Self-hosted vendor libs (offline-capable, no CDN dependency) -->
  <script src="vendor/phaser.min.js"></script>
  <script src="vendor/three.min.js"></script>
  <script src="vendor/three/GLTFLoader.js"></script>
  <script src="vendor/three/EffectComposer.js"></script>
  <script src="vendor/three/RenderPass.js"></script>
  <script src="vendor/three/ShaderPass.js"></script>
  <script src="vendor/three/UnrealBloomPass.js"></script>
  <script src="vendor/three/LuminosityHighPassShader.js"></script>
  <script src="vendor/three/CopyShader.js"></script>
  <script src="vendor/three/FXAAShader.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Press+Start+2P&family=IM+Fell+English+SC&family=IM+Fell+English:ital@0;1&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/dashboard.css?v=<?= @filemtime(__DIR__ . '/css/dashboard.css') ?: time() ?>">
</head>
<body>

<div id="todoOverlay">
  <div id="todoBox" class="glass relative">
    <div class="cdeco tl"></div><div class="cdeco tr"></div>
    <div class="cdeco bl"></div><div class="cdeco br"></div>
    <div class="flex items-center gap-2 mb-3">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span class="text-white font-bold text-base tracking-wide">ToDo</span>
      <span id="todoHeadCount" class="mono text-white/30 text-xs"></span>
      <button id="todoClose" class="ml-auto" onclick="closeTodo()">✕</button>
    </div>
    <div class="todo-tabs">
      <button id="todoTabOngoing" class="todo-tab active" onclick="todoTab('ongoing')">Ongoing</button>
      <button id="todoTabDone" class="todo-tab" onclick="todoTab('done')">Completed</button>
    </div>
    <div id="todoList" class="todo-list"></div>
    <div class="todo-add">
      <input id="todoInput" type="text" maxlength="300" placeholder="Add a task…" autocomplete="off">
      <button id="todoAddBtn" class="cf-btn cf-ok" onclick="addTodo()">Add</button>
    </div>
  </div>
</div>

<div id="confirmOverlay">
  <div id="confirmBox" class="glass relative">
    <div class="cdeco tl"></div><div class="cdeco tr"></div>
    <div class="cdeco bl"></div><div class="cdeco br"></div>
    <div class="flex items-center gap-2 mb-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 2 7 11l-4-3-2 1 4 4-4 4 2 1 4-3 10 9 5-2V4l-5-2Zm1 5v10l-7-5 7-5Z" fill="#3aa0ff"/></svg>
      <span class="text-white font-bold text-base tracking-wide">Open in VS Code?</span>
    </div>
    <div class="mb-1 text-white/70 text-sm">Launch <span id="cfRepo" class="text-yellow-400 font-bold"></span> in Visual Studio Code.</div>
    <div id="cfPath" class="mono text-white/30 text-xs mb-5 break-all"></div>
    <div class="flex gap-2 justify-end">
      <button id="cfNo" class="cf-btn cf-cancel">Cancel</button>
      <button id="cfYes" class="cf-btn cf-ok">Open</button>
    </div>
  </div>
</div>

<div id="skillsOverlay">
  <div id="skillsPanel">
    <div id="skillsHeader">
      <div>
        <div class="skills-eyebrow">HINATA · SKILL ARCHIVE</div>
        <div class="skills-title">Available Skills <span><?= count($skills) ?></span></div>
      </div>
      <button id="skillsCloseBtn">Close ✕</button>
    </div>
    <div id="skillsSearchBar">
      <span class="skills-search-icon">⌕</span>
      <input id="skillsSearchInput" type="text" autocomplete="off" spellcheck="false"
             placeholder="Search skills — name, trigger, or what it does…">
      <button id="skillsSearchClear" type="button" title="Clear">✕</button>
      <span id="skillsSearchCount"></span>
    </div>
    <div id="skillsList">
      <?php foreach ($skills as $skill): ?>
        <article class="skill-item" data-search="<?= htmlspecialchars(mb_strtolower(
              $skill['name'].' '.$skill['slash'].' '.$skill['description'].' '.$skill['usage'].' '.$skill['process']
            )) ?>">
          <div class="skill-name">
            <?= htmlspecialchars($skill['name']) ?>
            <?php if ($skill['native']): ?>
              <code class="skill-slash"><?= htmlspecialchars($skill['slash']) ?></code>
            <?php endif; ?>
          </div>
          <div class="skill-description"><?= htmlspecialchars($skill['description']) ?></div>
          <div class="skill-detail"><strong>How to use</strong><?= htmlspecialchars($skill['usage']) ?></div>
          <div class="skill-detail"><strong>How it works</strong><?= htmlspecialchars($skill['process']) ?></div>
        </article>
      <?php endforeach; ?>
      <div id="skillsEmpty">No skill matches that search.</div>
    </div>
  </div>
</div>

<div id="crBookOverlay">
  <div id="crBook">
    <div id="crBookLeftPage" class="cr-book-page">
      <div class="cr-book-title">📋 CR Records</div>
      <div id="crFileList"></div>
    </div>
    <div id="crBookSpine"></div>
    <div id="crBookRightPage" class="cr-book-page">
      <div id="crBookHeader">
        <span style="font-family:'Lora',serif;font-size:11px;color:#a85d2e;opacity:.8">Change Request Archive — UiTM UNIDEV</span>
        <button id="crBookCloseBtn">Close ✕</button>
      </div>
      <div id="crBookContent"></div>
    </div>
  </div>
</div>

<div id="diaryBookOverlay">
  <div id="diaryBook">
    <div id="bookLeftPage" class="book-page">
      <div class="book-title">📓 Daily Diary</div>
      <div id="bookDateList"></div>
    </div>
    <div id="bookSpine"></div>
    <div id="bookRightPage" class="book-page">
      <div id="bookHeader">
        <span class="mono text-xs" style="color:#a85d2e">// JIRAIYA MEMORY ARCHIVE</span>
        <button id="bookCloseBtn">Close ✕</button>
      </div>
      <div id="bookContent"></div>
    </div>
  </div>
</div>

<header class="scroll-header px-5 py-4 relative">
  <div class="cdeco tl"></div><div class="cdeco tr"></div>
  <div class="max-w-screen-xl mx-auto flex items-center justify-between">
    <div>
      <div class="mono text-yellow-700 text-xs tracking-[3px] uppercase mb-1">// CLASSIFIED — LEVEL 5 CLEARANCE</div>
      <h1 class="text-2xl font-bold tracking-wide leading-none">
        <span class="text-yellow-400" style="text-shadow:0 0 20px #D4A01788">JIRAIYA</span>
        <span class="text-white/30 mx-2">·</span>
        <span class="text-white/70 text-lg font-semibold">Live Agent Ecosystem</span>
      </h1>
    </div>
    <div class="flex items-center gap-7">
      <button id="liteToggle" class="lite-toggle" type="button">◉ LIVE</button>
      <div class="text-right">
        <div id="clock" class="clockbox text-yellow-400/90 text-lg tracking-wider"></div>
        <div id="dateDisp" class="mono text-white/25 text-xs mt-1.5"></div>
      </div>
    </div>
  </div>
  <div class="cdeco bl"></div><div class="cdeco br"></div>
</header>

<div class="max-w-screen-xl mx-auto p-4 flex flex-col gap-3">
  <div class="stage-row flex gap-3 items-start">
    <aside id="repoPanel" class="glass p-3 relative flex flex-col" style="width:236px;flex-shrink:0">
      <div class="cdeco tl"></div><div class="cdeco br"></div>

      <!-- JIRAIYA cockpit (server-rendered from the memory files) -->
      <div class="cockpit">
        <div class="mono text-yellow-700 text-xs tracking-[2px] uppercase mb-1">// JIRAIYA</div>
        <?php if ($projName): ?>
          <div class="ck-proj"><span class="ck-dot"></span><?= $ck_md($projName) ?></div>
          <?php if ($projDesc): ?><div class="ck-desc"><?= $ck_md($projDesc) ?></div><?php endif; ?>
          <?php if ($projStatus): ?><div class="ck-status"><?= $ck_md($projStatus) ?></div><?php endif; ?>
        <?php endif; ?>
        <div class="ck-rem-head">ONGOING TODO<span class="ck-badge<?= $todoOngoing ? '' : ' zero' ?>"><?= count($todoOngoing) ?></span></div>
        <?php if ($todoOngoing): foreach (array_slice($todoOngoing, 0, 4) as $r): ?>
          <div class="ck-rem">› <?= $ck_md($r) ?></div>
        <?php endforeach; else: ?>
          <div class="ck-none">✓ all clear</div>
        <?php endif; ?>
      </div>

      <div class="flex items-center mb-3">
        <span class="mono text-yellow-700 text-xs tracking-[2px] uppercase">// REPOSITORIES</span>
        <span id="repoCount" class="mono text-white/30 text-xs ml-auto"></span>
      </div>
      <div id="repoList" class="flex flex-col gap-2 flex-1"></div>
    </aside>
    <div id="game-wrap" class="flex-1 min-w-0">
      <canvas id="bg3d"></canvas>
      <div id="game-container"></div>
      <div id="battleBanner">⚔ CONFLICT SIM &nbsp;—&nbsp; <span id="bCount">20</span>s</div>
      <div id="battleTimerWrapper"><div id="battleTimerBar"></div></div>
      <div id="diaryBubble">
        <div class="gb-box">
          <div class="gb-name">JIRAIYA</div>
          <div class="gb-text">You want to<br>read my diary?</div>
          <div class="gb-actions">
            <button id="bubbleNo" class="gbtn no">NO</button>
            <button id="bubbleYes" class="gbtn yes">YES</button>
          </div>
          <div class="gb-tail"></div>
        </div>
      </div>
      <div id="crBubble">
        <div class="gb-box cr-gb-box">
          <div class="gb-name cr-gb-name">CR LOG</div>
          <div class="gb-text">View change<br>records?</div>
          <div class="gb-actions">
            <button id="crBubbleNo" class="gbtn no">NO</button>
            <button id="crBubbleYes" class="gbtn yes">YES</button>
          </div>
          <div class="gb-tail cr-gb-tail"></div>
        </div>
      </div>
      <div id="skillsBubble">
        <div class="gb-box skills-gb-box">
          <div class="gb-name skills-gb-name">HINATA</div>
          <div class="gb-text">List the skills?</div>
          <div class="gb-actions">
            <button id="skillsBubbleNo" class="gbtn no">NO</button>
            <button id="skillsBubbleYes" class="gbtn yes">YES</button>
          </div>
          <div class="gb-tail skills-gb-tail"></div>
        </div>
      </div>
    </div>
  </div>
  <div id="cardGrid" class="grid gap-3 monitors-grid" style="grid-template-columns:1fr 1fr 1fr 1.7fr"></div>
</div>

<div id="app-dock">
  <button class="app-sc" onclick="openTodo()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
    <span id="todoDockCount" class="app-badge"<?= $todoOngoing ? '' : ' style="display:none"' ?>><?= count($todoOngoing) ?></span>
    <span class="app-label">ToDo</span>
  </button>
  <button class="app-sc" onclick="window.location.href='terminal://'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="16" rx="2.5" fill="none" stroke="#A78BFA" stroke-width="1.6" opacity=".85"/>
      <path d="M6 9l4 3-4 3" stroke="#A78BFA" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path d="M13 15h5" stroke="#A78BFA" stroke-width="1.7" stroke-linecap="round" opacity=".75"/>
    </svg>
    <span class="app-label">Terminal</span>
  </button>
  <button class="app-sc" onclick="window.location.href='servbay://'" >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="5.5" rx="1.5" fill="#00C4A7" opacity=".9"/>
      <rect x="2" y="10.5" width="20" height="5.5" rx="1.5" fill="#00C4A7" opacity=".65"/>
      <rect x="2" y="18" width="20" height="4" rx="1.5" fill="#00C4A7" opacity=".4"/>
      <circle cx="19" cy="5.75" r="1.1" fill="#fff" opacity=".75"/>
      <circle cx="19" cy="13.25" r="1.1" fill="#fff" opacity=".75"/>
    </svg>
    <span class="app-label">ServBay</span>
  </button>
  <button class="app-sc" onclick="window.location.href='dbeaver://'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="6" rx="8" ry="3" fill="#4A90E2" opacity=".9"/>
      <path d="M4 6v4.5c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="#4A90E2" opacity=".6"/>
      <path d="M4 10.5V15c0 1.66 3.58 3 8 3s8-1.34 8-3v-4.5" fill="#4A90E2" opacity=".38"/>
    </svg>
    <span class="app-label">DBeaver</span>
  </button>
  <button class="app-sc" onclick="window.location.href='spotify://'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1DB954" opacity=".88"/>
      <path d="M7.5 9.8c3.2-1.1 6.7-.8 9.4.65M8 12.6c2.6-.9 5.4-.65 7.7.55M8.5 15.4c2-.65 4.1-.48 5.8.42" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
    <span class="app-label">Spotify</span>
  </button>
  <button class="app-sc" onclick="window.location.href='googlechrome://'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#fff" opacity=".08"/>
      <path d="M12 2a10 10 0 0 1 8.66 5H12a5 5 0 0 0-4.33 2.5L5.3 5.74A9.96 9.96 0 0 1 12 2Z" fill="#EA4335" opacity=".9"/>
      <path d="M22 12a10 10 0 0 1-5 8.66L14 13a5 5 0 0 0 0-5h6.94A9.96 9.96 0 0 1 22 12Z" fill="#34A853" opacity=".9"/>
      <path d="M7 20.66A10 10 0 0 1 2 12c0-1.85.5-3.58 1.36-5.06L10 13a5 5 0 0 0 4 7.94L12 22a9.96 9.96 0 0 1-5-1.34Z" fill="#FBBC05" opacity=".9"/>
      <circle cx="12" cy="12" r="3.8" fill="#fff" opacity=".95"/>
      <circle cx="12" cy="12" r="2.6" fill="#4285F4" opacity=".9"/>
    </svg>
    <span class="app-label">Chrome</span>
  </button>
  <button class="app-sc" onclick="window.location.href='whatsapp://'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#25D366" opacity=".88"/>
      <path d="M17.5 14.4c-.3-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51H7.2c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46s1.06 2.85 1.2 3.05c.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.12.56-.08 1.74-.71 1.98-1.4.25-.68.25-1.27.18-1.4-.07-.12-.27-.19-.57-.34Z" fill="#fff" opacity=".95"/>
    </svg>
    <span class="app-label">WhatsApp</span>
  </button>
  <button class="app-sc" onclick="window.location.href='tg://'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#2AABEE" opacity=".88"/>
      <path d="M17.87 7.06 5.6 11.67c-.83.33-.82.8-.15 1l3.14.98 7.28-4.6c.34-.21.66-.1.4.13L10.1 14.3l-.18 3.27c.26 0 .37-.12.5-.25l1.2-1.16 3.17 2.34c.58.32 1 .16 1.15-.54l2.08-9.8c.2-.8-.3-1.16-.95-.1Z" fill="#fff" opacity=".95"/>
    </svg>
    <span class="app-label">Telegram</span>
  </button>
  <button class="app-sc" onclick="if(confirm('Log out of JIRAIYA?'))window.location.href='../logout.php'" style="border-color:rgba(255,90,90,.3)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff7a7a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <path d="M16 17l5-5-5-5"/>
      <path d="M21 12H9"/>
    </svg>
    <span class="app-label">Log out</span>
  </button>
</div>

<script>
// Repository registry — generated server-side from /.env (portable across machines)
const LANG = <?= json_encode($LANG_DEFS, JSON_UNESCAPED_SLASHES) ?>;
const REPO_SYS = <?= json_encode($repoSys, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
</script>
<script src="../daily-diary/diary-data.js"></script>
<script src="js/monitors.js"></script>
<script src="js/agents-scene.js?v=<?= @filemtime(__DIR__ . '/js/agents-scene.js') ?: time() ?>"></script>
<script src="js/panels.js?v=<?= @filemtime(__DIR__ . '/js/panels.js') ?: time() ?>"></script>
<script src="js/boot.js"></script>
<script src="js/village3d.js?v=<?= @filemtime(__DIR__ . '/js/village3d.js') ?: time() ?>"></script>
</body>
</html>
