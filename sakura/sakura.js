#!/usr/bin/env node
const https    = require('https');
const readline = require('readline');
const fs       = require('fs');
const path     = require('path');
const os       = require('os');

// ── API Keys ─────────────────────────────────────────────
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
const ENV      = loadEnv('/Applications/Sites/jiraiya/sakura/.env');
const API_KEY  = ENV.OPENROUTER_API_KEY || '';   // OpenRouter — free-tier models
const GROQ_KEY = ENV.GROQ_API_KEY       || '';   // Groq — direct, fast-inference models
if (!API_KEY && !GROQ_KEY) {
  console.error('[Sakura] Missing both OPENROUTER_API_KEY and GROQ_API_KEY in .env');
  process.exit(1);
}
if (!GROQ_KEY) console.error('[Sakura] Warning: GROQ_API_KEY missing — Groq models unavailable.');
if (!API_KEY)  console.error('[Sakura] Warning: OPENROUTER_API_KEY missing — OpenRouter free models unavailable.');
// ─────────────────────────────────────────────────────────

// Groq's chat models come straight from its /models endpoint (fetched at
// startup). These aren't chat-completion models, so they're filtered out.
const GROQ_EXCLUDE = ['whisper', 'guard', 'orpheus'];

const DEFAULT_MODEL    = 'llama-3.3-70b-versatile';
const DEFAULT_PROVIDER = 'groq';
const CONFIG_PATH      = path.join(os.homedir(), '.sakura', 'config.json');

const BASE_SYSTEM_TOOLS = `You are Sakura, a helpful and warm AI assistant with real access to the local filesystem.
Working directory: ${process.cwd()}

You have tools: read_file, write_file, list_dir. Use them proactively whenever the user asks you to read, write, create, edit, or browse files/folders on this computer — don't just describe what you would do, actually do it. Always read a file before overwriting it if it might already contain something worth preserving. Be concise in explanations but thorough in using tools to actually get the job done. Respond in the same language as the user.`;

// Some models (e.g. Groq's compound/compound-mini, allam-2-7b) don't support
// function calling at all. Using BASE_SYSTEM_TOOLS with them causes confusing
// behavior — they either flatly refuse or hallucinate file contents because
// the prompt claims a capability they don't actually have this turn.
const BASE_SYSTEM_NO_TOOLS = `You are Sakura, a helpful and warm AI assistant.
Working directory: ${process.cwd()}

Note: the currently active model does not support tool-calling, so you do NOT have the ability to read, write, or browse files on this computer right now. If the user asks you to do that, tell them clearly that this model can't do it and suggest switching to a tool-capable model (via the "models" command). Respond in the same language as the user.`;

// ── Agentic file tools ─────────────────────────────────────
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the full contents of a text file on this computer.',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string', description: 'File path (relative to cwd or absolute)' } },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file, creating it and any missing parent folders. Overwrites existing content.',
      parameters: {
        type: 'object',
        properties: {
          path:    { type: 'string', description: 'File path to write (relative to cwd or absolute)' },
          content: { type: 'string', description: 'Full content to write to the file' },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_dir',
      description: 'List files and folders at a given path (default: current directory), with type and size.',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string', description: 'Directory path (default: current directory)' } },
        required: [],
      },
    },
  },
];

function execTool(name, args) {
  try {
    switch (name) {
      case 'read_file': {
        const abs = path.resolve(args.path);
        const raw = fs.readFileSync(abs, 'utf8');
        return raw.length > 200000 ? raw.slice(0, 200000) + '\n[...truncated at 200KB]' : raw;
      }
      case 'write_file': {
        const abs = path.resolve(args.path);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, args.content ?? '', 'utf8');
        return `Written: ${abs} (${Buffer.byteLength(args.content ?? '', 'utf8')} bytes)`;
      }
      case 'list_dir': {
        const abs = path.resolve(args.path || '.');
        const entries = fs.readdirSync(abs, { withFileTypes: true });
        return entries.map(e => {
          const full = path.join(abs, e.name);
          const type = e.isDirectory() ? 'dir' : 'file';
          let size = '';
          if (e.isFile()) {
            try { size = ` (${fs.statSync(full).size}b)`; } catch {}
          }
          return `${type}  ${e.name}${size}`;
        }).join('\n') || '(empty)';
      }
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

function printToolCall(name, args) {
  const label = {
    read_file:  `📄 read   ${args.path}`,
    write_file: `✏️  write  ${args.path}`,
    list_dir:   `📁 list   ${args.path || '.'}`,
  }[name] ?? `🔧 ${name}`;
  console.log(`  \x1b[33m→ ${label}\x1b[0m`);
}

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
const rawArgs      = process.argv.slice(2);
const injected     = [];
const queryParts   = [];
let   modelOverride = null;
let   activeModel        = DEFAULT_MODEL;
let   activeProvider     = DEFAULT_PROVIDER;
let   activeSupportsTools = true; // DEFAULT_MODEL (llama-3.3-70b-versatile) supports tools; corrected once items load

let i = 0;
while (i < rawArgs.length) {
  const a = rawArgs[i];
  if ((a === '--model' || a === '-m') && rawArgs[i + 1]) {
    modelOverride = rawArgs[i + 1]; i += 2;
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

// Accumulates `load`-command context across the session; kept separate from
// the tools/no-tools preamble so the system message can be rebuilt per-model
// without losing whatever the user has loaded in.
let loadedContextText = buildContextBlock(injected);
function systemFor(supportsTools) {
  return (supportsTools ? BASE_SYSTEM_TOOLS : BASE_SYSTEM_NO_TOOLS) + loadedContextText;
}

// ── API ───────────────────────────────────────────────────
function providerConfig(provider) {
  if (provider === 'groq') {
    return {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      apiKey: GROQ_KEY,
      extraHeaders: {},
    };
  }
  return {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    apiKey: API_KEY,
    extraHeaders: { 'HTTP-Referer': 'https://openrouter.ai', 'X-Title': 'Sakura CLI' },
  };
}

function callAPI(messages, model, tools, provider, cb) {
  const { hostname, path: apiPath, apiKey, extraHeaders } = providerConfig(provider);
  if (!apiKey) return cb(new Error(`Missing API key for provider "${provider}"`));
  const body = JSON.stringify({ model, messages, max_tokens: 4096, tools });
  const opts = {
    hostname,
    path: apiPath,
    method: 'POST',
    headers: {
      'Authorization' : `Bearer ${apiKey}`,
      'Content-Type'  : 'application/json',
      'Content-Length': Buffer.byteLength(body),
      ...extraHeaders,
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

// Agentic loop: sends `messages` (mutated in place — tool-call turns are
// appended as they happen) with TOOLS attached (when `supportsTools`),
// executes any tool calls the model makes, feeds results back, and loops
// until a final text reply.
// `supportsTools` is decided ahead of time from the provider's own model
// metadata (Groq's `supported_features` / OpenRouter's `supported_parameters`)
// so incapable models never even get offered tools. The retry-without-tools
// path is kept as a safety net in case that metadata is ever wrong/stale.
function agentLoop(messages, model, provider, supportsTools, onToolCall, cb, _noToolsRetry) {
  const attachTools = supportsTools && !_noToolsRetry;
  callAPI(messages, model, attachTools ? TOOLS : undefined, provider, (err, status, raw) => {
    if (err) return cb(null, err.message);
    let json;
    try { json = JSON.parse(raw); } catch { return cb(null, 'Parse error'); }
    if (json.error) {
      const emsg = json.error.message || JSON.stringify(json.error);
      if (attachTools && /tool/i.test(emsg) && /not support/i.test(emsg)) {
        return agentLoop(messages, model, provider, supportsTools, onToolCall, cb, true);
      }
      return cb(null, `API error: ${emsg}`);
    }
    const message = json.choices?.[0]?.message;
    if (!message) return cb(null, `Empty response from model (status ${status})`);

    if (message.tool_calls?.length) {
      messages.push(message);
      for (const call of message.tool_calls) {
        let args = {};
        try { args = JSON.parse(call.function.arguments || '{}'); } catch {}
        onToolCall(call.function.name, args);
        const result = execTool(call.function.name, args);
        messages.push({ role: 'tool', tool_call_id: call.id, content: String(result) });
      }
      return agentLoop(messages, model, provider, supportsTools, onToolCall, cb);
    }

    const text = message.content?.trim();
    if (!text) return cb(null, 'Empty response from model');
    messages.push(message);
    cb(text, null);
  });
}

// ── Model discovery ─────────────────────────────────────────
// Groq — direct, fetched live from api.groq.com (excludes audio/moderation models)
function fetchGroqModels() {
  return new Promise(resolve => {
    if (!GROQ_KEY) return resolve([]);
    const opts = {
      hostname: 'api.groq.com',
      path    : '/openai/v1/models',
      method  : 'GET',
      headers : { 'Authorization': `Bearer ${GROQ_KEY}` },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const models = (json.data || [])
            .filter(m => !GROQ_EXCLUDE.some(x => m.id.toLowerCase().includes(x)))
            .map(m => ({ id: m.id, supportsTools: !!m.supported_features?.includes('tools') }));
          resolve(models);
        } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
    req.end();
  });
}

// OpenRouter — free-tier models, fetched live from openrouter.ai
function fetchFreeModels() {
  return new Promise(resolve => {
    if (!API_KEY) return resolve([]);
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
          const isZero = (v) => v === undefined || v === null || v === '0' || v === 0;
          const free = json.data
            .filter(m => {
              const p = m.pricing || {};
              // Require every pricing dimension to be zero — a model that's
              // only free on prompt tokens but charges for completion/image/
              // request isn't actually free.
              return isZero(p.prompt) && isZero(p.completion) && isZero(p.request) && isZero(p.image);
            })
            .filter(m => !m.id.startsWith('google/lyria') && m.id !== 'openrouter/free')
            .map(m => ({ id: m.id, supportsTools: !!m.supported_parameters?.includes('tools') }));
          resolve(free);
        } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
    req.end();
  });
}

// Build a single numbered list: Groq models first, then OpenRouter free models.
// Each item carries its own `provider` so routing is never guessed from the id
// (the same id string can legitimately exist on both providers).
function modelItems(groqModels, freeModels) {
  let n = 1;
  const groq = groqModels.map(m => ({
    n: n++, id: m.id, short: m.id, group: 'groq', provider: 'groq',
    supportsTools: m.supportsTools,
    tag: m.supportsTools ? 'groq · direct' : 'groq · direct · no tools',
  }));
  const free = freeModels.map(m => ({
    n: n++, id: m.id, short: m.id.replace(':free', ''), group: 'free', provider: 'openrouter',
    supportsTools: m.supportsTools,
    tag: m.supportsTools ? 'openrouter · free' : 'openrouter · free · no tools',
  }));
  return [...groq, ...free];
}

// ── Shared box-drawing + color helpers ──────────────────────
// Sakura's palette: pink/violet for chrome (borders, title), a distinct hue
// per provider so Groq vs OpenRouter is instantly scannable, gold for the
// agentic star, green for the active-model marker.
const BOX_W = 120; // shared width for both the startup banner and the models picker

const CLR = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  border:  '\x1b[38;5;219m', // pink
  title:   '\x1b[38;5;219m\x1b[1m',
  sub:     '\x1b[38;5;183m', // soft lavender
  groq:    '\x1b[38;5;80m',  // teal
  openrouter: '\x1b[38;5;111m', // periwinkle
  star:    '\x1b[38;5;220m', // gold
  active:  '\x1b[38;5;120m', // green
  warn:    '\x1b[38;5;209m', // orange
  cmd:     '\x1b[38;5;159m', // cyan
};

// Strip ANSI codes to measure/pad by *visible* width — lets us freely embed
// color codes in row content without ever breaking box alignment.
function visLen(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }
function padVisible(s, width) {
  const len = visLen(s);
  return len < width ? s + ' '.repeat(width - len) : s;
}

function makeBox(W) {
  const b = CLR.border, r = CLR.reset;
  return {
    line: (s = '') => console.log(`${b}║${r} ${padVisible(s, W - 2)} ${b}║${r}`),
    div:  () => console.log(`${b}╠${'═'.repeat(W)}╣${r}`),
    top:  () => console.log(`${b}╔${'═'.repeat(W)}╗${r}`),
    bot:  () => console.log(`${b}╚${'═'.repeat(W)}╝${r}`),
  };
}

function centerText(s, W) {
  const pad = Math.max(0, Math.floor((W - visLen(s)) / 2));
  return ' '.repeat(pad) + s;
}

// ── Banner ────────────────────────────────────────────────
function printBanner(items) {
  const W = BOX_W;
  const { line, div, top, bot } = makeBox(W);

  top();
  line();
  line(centerText(`${CLR.title}🌸  Sakura CLI${CLR.reset}`, W));
  line(centerText(`${CLR.groq}Groq (direct)${CLR.reset}  ${CLR.dim}×${CLR.reset}  ${CLR.openrouter}OpenRouter (free)${CLR.reset}`, W));
  line(centerText(`${CLR.dim}${CLR.star}★${CLR.reset}${CLR.dim} = agentic (supports read/write/list_dir tools)${CLR.reset}`, W));
  line();
  div();

  // ❯ (green) marks the currently active model; ★ (gold) in front of the
  // name marks agentic-capable models (tool-calling support).
  const groqItems = items.filter(it => it.group === 'groq');
  line(`  ${CLR.groq}${CLR.bold}Groq Models${CLR.reset} ${CLR.dim}— direct via api.groq.com  (${groqItems.length})${CLR.reset}:`);
  groqItems.forEach(it => {
    const active  = it.id === activeModel && it.provider === activeProvider ? `${CLR.active}❯${CLR.reset}` : ' ';
    const agentic = it.supportsTools ? `${CLR.star}★${CLR.reset}` : ' ';
    const display = it.short.length > 78 ? it.short.slice(0, 75) + '…' : it.short;
    line(`  ${active} ${CLR.dim}[${String(it.n).padStart(2)}]${CLR.reset} ${agentic} ${display.padEnd(80)} ${CLR.dim}(${it.tag})${CLR.reset}`);
  });

  const freeItems = items.filter(it => it.group === 'free');
  if (freeItems.length) {
    div();
    line(`  ${CLR.openrouter}${CLR.bold}OpenRouter Free Models${CLR.reset} ${CLR.dim}— via openrouter.ai  (${freeItems.length})${CLR.reset}:`);
    freeItems.forEach(it => {
      const active  = it.id === activeModel && it.provider === activeProvider ? `${CLR.active}❯${CLR.reset}` : ' ';
      const agentic = it.supportsTools ? `${CLR.star}★${CLR.reset}` : ' ';
      const display = it.short.length > 90 ? it.short.slice(0, 87) + '…' : it.short;
      line(`  ${active} ${CLR.dim}[${String(it.n).padStart(2)}]${CLR.reset} ${agentic} ${display}`);
    });
  }

  div();
  line(`  ${CLR.bold}Commands:${CLR.reset}`);
  line(`    ${CLR.cmd}models${CLR.reset}          — pick a model (↑/↓ + Enter, Esc to cancel)`);
  line(`    ${CLR.cmd}model <n>${CLR.reset}       — switch by number, e.g. "model 2"`);
  line(`    ${CLR.cmd}model <id>${CLR.reset}      — switch by id`);
  line(`    ${CLR.cmd}@/path/file${CLR.reset}     — attach file inline`);
  line(`    ${CLR.cmd}load <path>${CLR.reset}     — load file/folder`);
  line(`    ${CLR.cmd}list${CLR.reset}            — show loaded context`);
  line(`    ${CLR.cmd}clear${CLR.reset}           — clear chat history`);
  line(`    ${CLR.cmd}exit${CLR.reset}            — quit`);
  line();
  line(`  ${CLR.dim}Sakura can also read/write/list files on this computer directly —${CLR.reset}`);
  line(`  ${CLR.dim}just ask, e.g. "read package.json" or "create a notes.txt with...".${CLR.reset}`);
  line(`  ${CLR.dim}No @/load needed for that.${CLR.reset}`);
  line();
  bot();
  const toolsNote = activeSupportsTools ? '' : ` ${CLR.warn}(no tool-calling — file access unavailable)${CLR.reset}`;
  console.log(`\n  Active: ${CLR.border}${activeModel}${CLR.reset} ${CLR.dim}(${activeProvider})${CLR.reset}${toolsNote}\n`);
}

// Interactive arrow-key model picker. Renders as the same bordered box as the
// startup banner, redrawn in place on every arrow press. Returns the chosen
// item, or null on cancel/non-TTY.
function interactiveModelPicker(items, activeId) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) { resolve(null); return; }

    const W = BOX_W;
    // padVisible/CLR (shared with printBanner) let us embed color codes
    // freely — padding is computed on visible width, never raw .length.
    const plainLine = (s = '') => `${CLR.border}║${CLR.reset} ${padVisible(s, W - 2)} ${CLR.border}║${CLR.reset}`;
    // Selected row: reverse-video highlight bar (inverts fg/bg) for a real
    // "menu selection" look, computed on the plain (uncolored) row text so
    // the whole bar — including the tag — inverts uniformly.
    const rowLine = (plain, hl) => {
      if (!hl) return plainLine(plain.replace(/\x1b\[[0-9;]*m/g, ''));
      const bare = plain.replace(/\x1b\[[0-9;]*m/g, '');
      return `${CLR.border}║${CLR.reset} \x1b[1m\x1b[7m${padVisible(bare, W - 2)}${CLR.reset} ${CLR.border}║${CLR.reset}`;
    };
    const div = `${CLR.border}╠${'═'.repeat(W)}╣${CLR.reset}`;
    const top = `${CLR.border}╔${'═'.repeat(W)}╗${CLR.reset}`;
    const bot = `${CLR.border}╚${'═'.repeat(W)}╝${CLR.reset}`;

    const groqItems = items.filter(it => it.group === 'groq');
    const freeItems = items.filter(it => it.group === 'free');
    let selected = Math.max(0, items.findIndex(it => it.id === activeId)); // index into `items`; items.length == Cancel row

    // ★ in front of the name marks agentic-capable models (tool-calling support).
    const rowText = (opt) => {
      const agentic = opt.supportsTools ? '★' : ' ';
      const display = opt.short.length > 78 ? opt.short.slice(0, 75) + '…' : opt.short;
      return `[${String(opt.n).padStart(2)}] ${agentic} ${display}  (${opt.tag})`;
    };

    const buildLines = () => {
      const out = [top];
      out.push(plainLine());
      out.push(plainLine(centerText(`${CLR.title}🌸  Pick a Model${CLR.reset}`, W)));
      out.push(plainLine(centerText(`${CLR.dim}↑/↓ move · Enter select · Esc cancel${CLR.reset}`, W)));
      out.push(plainLine(centerText(`${CLR.dim}${CLR.star}★${CLR.reset}${CLR.dim} = agentic (supports file tools)${CLR.reset}`, W)));
      out.push(plainLine());
      out.push(div);

      let idx = 0;
      out.push(plainLine(`  ${CLR.groq}${CLR.bold}Groq Models${CLR.reset} ${CLR.dim}— direct via api.groq.com  (${groqItems.length})${CLR.reset}:`));
      groqItems.forEach(opt => {
        const hl = idx === selected;
        out.push(rowLine(`  ${hl ? '❯' : ' '} ${rowText(opt)}`, hl));
        idx++;
      });

      if (freeItems.length) {
        out.push(div);
        out.push(plainLine(`  ${CLR.openrouter}${CLR.bold}OpenRouter Free Models${CLR.reset} ${CLR.dim}— via openrouter.ai  (${freeItems.length})${CLR.reset}:`));
        freeItems.forEach(opt => {
          const hl = idx === selected;
          out.push(rowLine(`  ${hl ? '❯' : ' '} ${rowText(opt)}`, hl));
          idx++;
        });
      }

      out.push(div);
      const cancelSelected = idx === selected;
      out.push(rowLine(`  ${cancelSelected ? '❯' : ' '} [ 0] Cancel`, cancelSelected));
      out.push(bot);
      return out;
    };

    let lastLineCount = 0;
    const render = (first) => {
      if (!first) {
        readline.moveCursor(process.stdout, 0, -lastLineCount);
        readline.cursorTo(process.stdout, 0);
      }
      const lines = buildLines();
      lines.forEach(l => console.log(`${l}\x1b[K`));
      lastLineCount = lines.length;
    };

    render(true);
    const totalOptions = items.length + 1; // + Cancel

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
      if (key.name === 'up')        { selected = (selected - 1 + totalOptions) % totalOptions; render(); }
      else if (key.name === 'down') { selected = (selected + 1) % totalOptions; render(); }
      else if (key.name === 'return') finish(selected === items.length ? null : items[selected]);
      else if (key.name === 'escape') finish(null);
      else if (key.ctrl && key.name === 'c') { cleanup(); process.exit(0); }
    }

    process.stdin.on('keypress', onKeypress);
  });
}

// ── Startup: fetch model lists, then run one-shot or interactive mode ──────
const oneShot = queryParts.join(' ').trim();

(async () => {
  process.stdout.write('  🌸 Fetching models (Groq + OpenRouter)...\r');
  const [groqModels, freeModels] = await Promise.all([fetchGroqModels(), fetchFreeModels()]);
  process.stdout.write('                                                              \r');
  const items = modelItems(groqModels, freeModels);

  // Resolve the default model against the fetched items (in case metadata
  // ever disagrees with the DEFAULT_MODEL/DEFAULT_PROVIDER assumption above).
  const defaultItem = items.find(it => it.id === activeModel && it.provider === activeProvider);
  if (defaultItem) activeSupportsTools = defaultItem.supportsTools;

  if (modelOverride) {
    // items is ordered groq-first, so an id that (rarely) exists on both
    // providers resolves to Groq — matches the "prefer direct Groq" intent.
    const found = items.find(it => it.id === modelOverride || it.short === modelOverride);
    activeModel        = modelOverride;
    activeProvider     = found ? found.provider : DEFAULT_PROVIDER;
    activeSupportsTools = found ? found.supportsTools : true;
  }

  // ── One-shot mode ─────────────────────────────────────
  if (oneShot) {
    agentLoop(
      [{ role: 'system', content: systemFor(activeSupportsTools) }, { role: 'user', content: oneShot }],
      activeModel, activeProvider, activeSupportsTools,
      (name, args) => console.error(`  → ${name} ${JSON.stringify(args)}`),
      (text, err) => {
        if (err) { console.error('[Sakura] Error:', err); process.exit(1); }
        console.log(`\n[Sakura · ${activeModel}]\n${text}\n`);
        process.exit(0);
      }
    );
    return;
  }

  // ── Interactive mode ──────────────────────────────────
  printBanner(items);

  if (injected.length) {
    console.log('  Loaded context:');
    injected.forEach(f => console.log('  •', f.path));
    console.log('');
  }

  const history = [{ role: 'system', content: systemFor(activeSupportsTools) }];
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
      switchingModel = true;
      rl.close();
      const chosen = await interactiveModelPicker(items, activeModel);
      process.stdin.resume();
      rl = makeInterface();
      if (chosen) {
        activeModel         = chosen.id;
        activeProvider      = chosen.provider;
        activeSupportsTools = chosen.supportsTools;
        const warn = chosen.supportsTools ? '' : ` \x1b[33m(no tool-calling — file access unavailable)\x1b[0m`;
        console.log(`\n  ✓ Switched to \x1b[35m${activeModel}\x1b[0m \x1b[2m(${activeProvider})\x1b[0m${warn}\n`);
      } else {
        console.log(`\n  (cancelled — still using \x1b[35m${activeModel}\x1b[0m)\n`);
      }
      rl.prompt(); return;
    }

    if (low.startsWith('model ')) {
      const pick  = trimmed.slice(6).trim();
      const asNum = /^\d+$/.test(pick) ? parseInt(pick, 10) : null;
      const found = asNum ? items.find(it => it.n === asNum) : items.find(it => it.id === pick || it.short === pick);
      if (found) {
        activeModel         = found.id;
        activeProvider      = found.provider;
        activeSupportsTools = found.supportsTools;
        const warn = found.supportsTools ? '' : ` \x1b[33m(no tool-calling — file access unavailable)\x1b[0m`;
        console.log(`\n  ✓ Switched to \x1b[35m${activeModel}\x1b[0m \x1b[2m(${activeProvider})\x1b[0m${warn}\n`);
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
      history.push({ role: 'system', content: systemFor(activeSupportsTools) });
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
          files.forEach(f => { injected.push(f); loadedContextText += '\n\n' + buildContextBlock([f]); });
          loaded = files.length;
        } else {
          const content = readOneFile(abs);
          if (content) {
            const f = { path: abs, content };
            injected.push(f);
            loadedContextText += '\n\n' + buildContextBlock([f]);
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
    // Refresh the system message in case the active model (and therefore its
    // tool-calling support) changed since history[0] was last set.
    history[0].content = systemFor(activeSupportsTools);

    const turnStart = history.length;
    history.push({ role: 'user', content: msg });
    process.stdout.write('\n\x1b[35m🌸 Sakura\x1b[0m: thinking...\r');

    agentLoop(history, activeModel, activeProvider, activeSupportsTools, printToolCall, (text, err) => {
      if (err) {
        process.stdout.write(`\r  [Sakura] Error: ${err}                    \n\n`);
        history.length = turnStart;
        rl.prompt(); return;
      }
      process.stdout.write(`\r\x1b[35m🌸 Sakura\x1b[0m:                          \n${text}\n\n`);
      rl.prompt();
    });
  }

  rl = makeInterface();
  rl.prompt();
})();
