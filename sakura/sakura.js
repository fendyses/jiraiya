#!/usr/bin/env node
const https    = require('https');
const readline = require('readline');
const fs       = require('fs');
const path     = require('path');
const os       = require('os');

// ── API Key (OpenRouter) ──────────────────────────────────
// Loads from /Applications/Sites/jiraiya/sakura/.env
function loadEnv(envPath) {
  try {
    return fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
      const [k, ...v] = line.split('=');
      if (k && v.length) acc[k.trim()] = v.join('=').trim();
      return acc;
    }, {});
  } catch { return {}; }
}
const ENV     = loadEnv('/Applications/Sites/jiraiya/sakura/.env');
const API_KEY = ENV.OPENROUTER_API_KEY || '';
if (!API_KEY) { console.error('[Sakura] Missing OPENROUTER_API_KEY in .env'); process.exit(1); }
// ─────────────────────────────────────────────────────────

const MODELS = [
  { id: 'x-ai/grok-4.20',               label: 'Grok 4.20',              tag: 'default · latest' },
  { id: 'x-ai/grok-4.3',                label: 'Grok 4.3',               tag: 'stable'           },
  { id: 'x-ai/grok-4.20-multi-agent',   label: 'Grok 4.20 Multi-Agent',  tag: 'agentic'          },
  { id: 'x-ai/grok-build-0.1',          label: 'Grok Build 0.1',         tag: 'cheapest'         },
];

const DEFAULT_MODEL = MODELS[0].id;
const CONFIG_PATH   = path.join(os.homedir(), '.sakura', 'config.json');

const BASE_SYSTEM = 'You are Sakura, a helpful and warm AI assistant. Answer directly and clearly. Respond in the same language as the user.';

const ALLOWED_EXT = new Set([
  '.md', '.txt', '.js', '.ts', '.vue', '.jsx', '.tsx',
  '.json', '.yaml', '.yml', '.html', '.css', '.sh',
  '.py', '.rb', '.go', '.php', '.env.example', '.toml', '.ini',
]);

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'vendor', '.nuxt', '.next', 'build', 'out', 'cache']);

// ── Config ────────────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return { trusted_folders: [], trusted_files: [], auto_load: false, max_file_kb: 50, max_total_kb: 120 };
  }
}

const config        = loadConfig();
const MAX_FILE_BYTES  = (config.max_file_kb  || 50)  * 1024;
const MAX_TOTAL_BYTES = (config.max_total_kb || 120) * 1024;

// ── File helpers ──────────────────────────────────────────
function isTrustedPath(targetPath) {
  const abs = path.resolve(targetPath);
  return (config.trusted_folders || []).some(folder =>
    abs === path.resolve(folder) || abs.startsWith(path.resolve(folder) + path.sep)
  );
}

function readOneFile(filePath) {
  try {
    const abs = path.resolve(filePath);
    if (!fs.statSync(abs).isFile()) return null;
    const ext = path.extname(abs).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return null;
    const raw = fs.readFileSync(abs, 'utf8');
    return raw.length > MAX_FILE_BYTES
      ? raw.slice(0, MAX_FILE_BYTES) + '\n[...file truncated at 50 KB]'
      : raw;
  } catch { return null; }
}

function scanFolder(folderPath, depth = 0) {
  if (depth > 2) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(path.resolve(folderPath), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env.example') continue;
      const full = path.join(path.resolve(folderPath), entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) results.push(...scanFolder(full, depth + 1));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXT.has(ext)) {
          const content = readOneFile(full);
          if (content) results.push({ path: full, content });
        }
      }
    }
  } catch {}
  return results;
}

function buildContextBlock(files) {
  if (!files.length) return '';
  let total = 0;
  const kept = [];
  for (const f of files) {
    const bytes = Buffer.byteLength(f.content, 'utf8');
    if (total + bytes > MAX_TOTAL_BYTES) break;
    kept.push(f);
    total += bytes;
  }
  return '\n\n[Loaded File Context]\n' + kept.map(f => `--- File: ${f.path} ---\n${f.content}\n---`).join('\n\n');
}

// ── Arg parsing ───────────────────────────────────────────
const rawArgs    = process.argv.slice(2);
const injected   = [];
const queryParts = [];
let   activeModel = DEFAULT_MODEL;

let i = 0;
while (i < rawArgs.length) {
  const a = rawArgs[i];
  if ((a === '--model' || a === '-m') && rawArgs[i + 1]) {
    activeModel = rawArgs[i + 1]; i += 2;
  } else if ((a === '--file' || a === '-f') && rawArgs[i + 1]) {
    const content = readOneFile(rawArgs[i + 1]);
    if (content) injected.push({ path: path.resolve(rawArgs[i + 1]), content });
    else console.error(`[Sakura] Warning: cannot read file: ${rawArgs[i + 1]}`);
    i += 2;
  } else if ((a === '--folder' || a === '--context') && rawArgs[i + 1]) {
    injected.push(...scanFolder(rawArgs[i + 1])); i += 2;
  } else {
    queryParts.push(a); i++;
  }
}

if (config.auto_load) {
  for (const folder of (config.trusted_folders || [])) injected.push(...scanFolder(folder));
  for (const file   of (config.trusted_files   || [])) {
    const content = readOneFile(file);
    if (content) injected.push({ path: path.resolve(file), content });
  }
}

const contextBlock = buildContextBlock(injected);
const SYSTEM = BASE_SYSTEM + contextBlock;

// ── API ───────────────────────────────────────────────────
function callAPI(messages, model, cb) {
  const body = JSON.stringify({ model, messages, max_tokens: 2048 });
  const opts = {
    hostname: 'openrouter.ai',
    path    : '/api/v1/chat/completions',
    method  : 'POST',
    headers : {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type' : 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'HTTP-Referer'  : 'https://openrouter.ai',
      'X-Title'       : 'Sakura CLI',
    },
  };
  const req = https.request(opts, res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => cb(null, res.statusCode, raw));
  });
  req.on('error', err => cb(err));
  req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  req.write(body);
  req.end();
}

function send(messages, model, cb) {
  callAPI(messages, model, (err, status, raw) => {
    if (err) return cb(null, err.message);
    let json;
    try { json = JSON.parse(raw); } catch { return cb(null, 'Parse error'); }
    if (json.error) return cb(null, `API error: ${json.error.message}`);
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return cb(null, 'Empty response from model');
    cb(text, null);
  });
}

// ── Free model fetch ──────────────────────────────────────
function fetchFreeModels() {
  return new Promise(resolve => {
    const opts = {
      hostname: 'openrouter.ai',
      path    : '/api/v1/models',
      method  : 'GET',
      headers : { 'Authorization': `Bearer ${API_KEY}` },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const free = json.data
            .filter(m => m.pricing?.prompt === '0' || m.pricing?.prompt === 0)
            .map(m => m.id)
            .filter(id => !id.startsWith('google/lyria') && id !== 'openrouter/free');
          resolve(free);
        } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
    req.end();
  });
}

// ── Banner ────────────────────────────────────────────────
function printBanner(freeModels = []) {
  const W    = 58;
  const line = (s) => console.log(`║ ${s.padEnd(W - 2)} ║`);
  const div  = () => console.log(`╠${'═'.repeat(W)}╣`);
  const top  = () => console.log(`╔${'═'.repeat(W)}╗`);
  const bot  = () => console.log(`╚${'═'.repeat(W)}╝`);

  const items = modelItems(freeModels);
  top();
  line('');
  line('           🌸  Sakura CLI                 ');
  line('      Powered by Grok  ×  OpenRouter      ');
  line('');
  div();
  line('  Grok Models:');
  items.filter(it => it.group === 'grok').forEach(it => {
    const star = it.id === activeModel ? '★' : '·';
    line(`  ${star} [${it.n}] ${it.short.padEnd(24)} (${it.tag})`);
  });
  if (items.some(it => it.group === 'free')) {
    div();
    line(`  Free Models (${items.filter(it => it.group === 'free').length}):`);
    items.filter(it => it.group === 'free').forEach(it => {
      const star   = it.id === activeModel ? '★' : '·';
      const display = it.short.length > 46 ? it.short.slice(0, 43) + '…' : it.short;
      line(`  ${star} [${it.n}] ${display}`);
    });
  }
  div();
  line('  Commands:');
  line('    models          — pick a model (↑/↓ + Enter, Esc to cancel)');
  line('    model <n>       — switch by number, e.g. "model 2"');
  line('    model <id>      — switch by id');
  line('    @/path/file     — attach file inline');
  line('    load <path>     — load file/folder');
  line('    list            — show loaded context');
  line('    clear           — clear chat history');
  line('    exit            — quit');
  line('');
  bot();
  console.log(`\n  Active: \x1b[35m${activeModel}\x1b[0m\n`);
}

// Build a single numbered list combining Grok models + fetched free models.
function modelItems(freeModels) {
  let n = 1;
  const grok = MODELS.map(m => ({
    n: n++, id: m.id, short: m.id.replace('x-ai/', ''), tag: m.tag, group: 'grok',
  }));
  const free = freeModels.map(id => ({
    n: n++, id, short: id.replace(':free', ''), tag: 'free', group: 'free',
  }));
  return [...grok, ...free];
}

// Interactive arrow-key model picker. Returns the chosen item, or null on cancel/non-TTY.
function interactiveModelPicker(items, activeId) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) { resolve(null); return; }

    const options = [...items, { id: null, short: 'Cancel', tag: '' }];
    let selected = Math.max(0, items.findIndex(it => it.id === activeId));

    const render = (first) => {
      if (!first) {
        readline.moveCursor(process.stdout, 0, -(options.length + 1));
        readline.cursorTo(process.stdout, 0);
      }
      console.log(`  \x1b[35mPick a model\x1b[0m (↑/↓ move · Enter select · Esc cancel)\x1b[K`);
      options.forEach((opt, i) => {
        const cursor = i === selected ? '\x1b[35m❯\x1b[0m' : ' ';
        const label  = opt.tag ? `${opt.short}  (${opt.tag})` : opt.short;
        const text   = i === selected ? `\x1b[1m${label}\x1b[0m` : label;
        console.log(`  ${cursor} ${text}\x1b[K`);
      });
    };

    render(true);

    const wasRaw = process.stdin.isRaw;
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKeypress);
      process.stdin.setRawMode(wasRaw ?? false);
    };
    const finish = (result) => { cleanup(); resolve(result); };

    function onKeypress(str, key) {
      if (!key) return;
      if (key.name === 'up')        { selected = (selected - 1 + options.length) % options.length; render(); }
      else if (key.name === 'down') { selected = (selected + 1) % options.length; render(); }
      else if (key.name === 'return') finish(options[selected].id === null ? null : options[selected]);
      else if (key.name === 'escape') finish(null);
      else if (key.ctrl && key.name === 'c') { cleanup(); process.exit(0); }
    }

    process.stdin.on('keypress', onKeypress);
  });
}

// ── One-shot mode ─────────────────────────────────────────
const oneShot = queryParts.join(' ').trim();
if (oneShot) {
  send(
    [{ role: 'system', content: SYSTEM }, { role: 'user', content: oneShot }],
    activeModel,
    (text, err) => {
      if (err) { console.error('[Sakura] Error:', err); process.exit(1); }
      console.log(`\n[Sakura · ${activeModel.replace('x-ai/','')}]\n${text}\n`);
      process.exit(0);
    }
  );
  return;
}

// ── Interactive mode ──────────────────────────────────────
(async () => {
  process.stdout.write('  🌸 Fetching free models from OpenRouter...\r');
  const freeModels = await fetchFreeModels();
  process.stdout.write('                                              \r');

  printBanner(freeModels);

  if (injected.length) {
    console.log('  Loaded context:');
    injected.forEach(f => console.log('  •', f.path));
    console.log('');
  }

  const history = [{ role: 'system', content: SYSTEM }];
  let rl;
  let switchingModel = false;

  const makeInterface = () => {
    const instance = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '\x1b[35mYou\x1b[0m: ' });
    instance.on('line', onLine);
    instance.on('close', () => {
      if (switchingModel) { switchingModel = false; return; }
      console.log('\n🌸 Sakura: Session ended.\n');
      process.exit(0);
    });
    return instance;
  };

  async function onLine(input) {
    const trimmed = input.trim();
    if (!trimmed) { rl.prompt(); return; }

    const low = trimmed.toLowerCase();

    // ── Built-in commands ──────────────────────────────────
    if (['exit', 'quit', 'bye'].includes(low)) {
      console.log('\n🌸 Sakura: Goodbye! Take care.\n');
      process.exit(0);
    }

    if (low === 'models' || low === 'model') {
      const items = modelItems(freeModels);
      switchingModel = true;
      rl.close();
      const chosen = await interactiveModelPicker(items, activeModel);
      process.stdin.resume();
      rl = makeInterface();
      if (chosen) {
        activeModel = chosen.id;
        console.log(`\n  ✓ Switched to \x1b[35m${activeModel}\x1b[0m\n`);
      } else {
        console.log(`\n  (cancelled — still using \x1b[35m${activeModel}\x1b[0m)\n`);
      }
      rl.prompt(); return;
    }

    if (low.startsWith('model ')) {
      const pick  = trimmed.slice(6).trim();
      const items = modelItems(freeModels);
      const asNum = /^\d+$/.test(pick) ? parseInt(pick, 10) : null;
      const byNum = asNum ? items.find(it => it.n === asNum) : null;
      const grok  = MODELS.find(m => m.id === pick || m.id === `x-ai/${pick}` || m.id.replace('x-ai/', '') === pick);
      const free  = freeModels.find(id => id === pick || id.replace(':free', '') === pick);
      if (byNum) {
        activeModel = byNum.id;
        console.log(`\n  ✓ Switched to \x1b[35m${activeModel}\x1b[0m\n`);
      } else if (grok) {
        activeModel = grok.id;
        console.log(`\n  ✓ Switched to \x1b[35m${activeModel}\x1b[0m\n`);
      } else if (free) {
        activeModel = free;
        console.log(`\n  ✓ Switched to \x1b[35m${activeModel}\x1b[0m\n`);
      } else {
        console.log(`\n  [Sakura] Unknown model: ${pick}. Type "models" to pick interactively.\n`);
      }
      rl.prompt(); return;
    }

  if (low === 'list') {
    console.log('\n  Loaded context files:');
    if (injected.length) injected.forEach(f => console.log('  •', f.path));
    else console.log('  (none — use @/path/to/file or load <path>)');
    console.log('');
    rl.prompt(); return;
  }

  if (low === 'clear') {
    history.length = 0;
    history.push({ role: 'system', content: SYSTEM });
    console.log('\n  ✓ Chat history cleared.\n');
    rl.prompt(); return;
  }

  if (low.startsWith('load ')) {
    const target = trimmed.slice(5).trim();
    let loaded = 0;
    try {
      const abs  = path.resolve(target);
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        const files = scanFolder(abs);
        files.forEach(f => { injected.push(f); history[0].content += '\n\n' + buildContextBlock([f]); });
        loaded = files.length;
      } else {
        const content = readOneFile(abs);
        if (content) {
          const f = { path: abs, content };
          injected.push(f);
          history[0].content += '\n\n' + buildContextBlock([f]);
          loaded = 1;
        }
      }
    } catch (e) {
      console.log(`\n  [Sakura] Cannot load: ${e.message}\n`);
      rl.prompt(); return;
    }
    console.log(`\n  ✓ Loaded ${loaded} file(s) into context.\n`);
    rl.prompt(); return;
  }

  // ── @/path inline attachment ───────────────────────────
  let msg = trimmed;
  const atRefs = trimmed.match(/@([^\s]+)/g);
  if (atRefs) {
    for (const ref of atRefs) {
      const filePath = ref.slice(1);
      const abs      = path.resolve(filePath);
      if (!isTrustedPath(abs) && !injected.some(f => f.path === abs)) {
        console.log(`\n  [Sakura] Access denied: ${filePath} not in a trusted folder.`);
        console.log(`           Add it with: load ${filePath}\n`);
        rl.prompt(); return;
      }
      const content = readOneFile(abs);
      if (content) {
        msg = msg.replace(ref, `[attached: ${path.basename(abs)}]`);
        msg += `\n\n--- Attached: ${abs} ---\n${content}\n---`;
        console.log(`  Attached: ${abs}`);
      } else {
        console.log(`  [Sakura] Could not read: ${filePath}`);
      }
    }
  }

  // ── Send to model ──────────────────────────────────────
  history.push({ role: 'user', content: msg });
  process.stdout.write('\n\x1b[35m🌸 Sakura\x1b[0m: thinking...\r');

  send([...history], activeModel, (text, err) => {
    if (err) {
      process.stdout.write(`\r  [Sakura] Error: ${err}                    \n\n`);
      history.pop();
      rl.prompt(); return;
    }
    history.push({ role: 'assistant', content: text });
    process.stdout.write(`\r\x1b[35m🌸 Sakura\x1b[0m:                          \n${text}\n\n`);
    rl.prompt();
  });
  }

  rl = makeInterface();
  rl.prompt();
})();
