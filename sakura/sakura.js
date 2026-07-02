#!/usr/bin/env node
import { config } from 'dotenv';
import readline from 'readline';
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, relative } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const { models, providers } = JSON.parse(readFileSync(join(__dirname, 'models.json'), 'utf8'));

function providerConfig(providerName) {
  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);
  const apiKey = process.env[provider.api_key_env];
  if (!apiKey) throw new Error(`Missing ${provider.api_key_env} in .env`);
  return { apiKey, baseUrl: provider.base_url };
}

const C = {
  reset:  '\x1b[0m',
  pink:   '\x1b[38;5;219m',
  purple: '\x1b[38;5;183m',
  green:  '\x1b[38;5;120m',
  yellow: '\x1b[38;5;228m',
  red:    '\x1b[38;5;210m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
  cyan:   '\x1b[38;5;159m',
};

const CWD = process.cwd();

// ─── Tools ───────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the full contents of a file. Use relative or absolute paths.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file. Creates the file and any missing parent directories.',
      parameters: {
        type: 'object',
        properties: {
          path:    { type: 'string', description: 'File path to write' },
          content: { type: 'string', description: 'Content to write to the file' },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_dir',
      description: 'List files and directories at a given path. Shows type (file/dir) and size.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path to list (default: current directory)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Run a shell command and return stdout/stderr. Use for git, npm, compiling code, etc.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command to execute' },
          cwd:     { type: 'string', description: 'Working directory for the command (optional)' },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_files',
      description: 'Search for files matching a pattern or containing text.',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Glob pattern or filename to search for' },
          contains: { type: 'string', description: 'Text to search inside files (optional)' },
          path:     { type: 'string', description: 'Directory to search in (default: current directory)' },
        },
        required: ['pattern'],
      },
    },
  },
];

// ─── Tool Executors ───────────────────────────────────────────────────────────

function execTool(name, args) {
  try {
    switch (name) {
      case 'read_file': {
        const p = resolve(CWD, args.path);
        return readFileSync(p, 'utf8');
      }

      case 'write_file': {
        const p = resolve(CWD, args.path);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, args.content, 'utf8');
        return `Written: ${p}`;
      }

      case 'list_dir': {
        const p = resolve(CWD, args.path ?? '.');
        const entries = readdirSync(p);
        return entries.map(e => {
          const stat = statSync(join(p, e));
          const type = stat.isDirectory() ? 'dir' : 'file';
          const size = stat.isFile() ? ` (${stat.size}b)` : '';
          return `${type}  ${e}${size}`;
        }).join('\n') || '(empty)';
      }

      case 'run_command': {
        const cwd = args.cwd ? resolve(CWD, args.cwd) : CWD;
        const out = execSync(args.command, { cwd, timeout: 30000, encoding: 'utf8', stdio: 'pipe' });
        return out || '(no output)';
      }

      case 'search_files': {
        const searchPath = args.path ? resolve(CWD, args.path) : CWD;
        let cmd = `find "${searchPath}" -name "${args.pattern}" 2>/dev/null | head -50`;
        if (args.contains) {
          cmd = `grep -rl "${args.contains}" "${searchPath}" 2>/dev/null | head -50`;
        }
        const out = execSync(cmd, { encoding: 'utf8' });
        return out.trim() || '(no results)';
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

// ─── Agent Loop ───────────────────────────────────────────────────────────────

async function agentLoop(modelId, history, onToolCall) {
  const modelDef = models.find(m => m.id === modelId);
  const max_tokens = modelDef?.max_tokens ?? 4096;
  const { apiKey, baseUrl } = providerConfig(modelDef.provider);

  while (true) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelId, messages: history, tools: TOOLS, max_tokens }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${res.status} — ${err}`);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message;

    if (!message) throw new Error('No response from model');

    // Model wants to call tools
    if (message.tool_calls?.length) {
      history.push(message);

      for (const call of message.tool_calls) {
        const args = JSON.parse(call.function.arguments ?? '{}');
        onToolCall(call.function.name, args);

        const result = execTool(call.function.name, args);

        history.push({
          role: 'tool',
          tool_call_id: call.id,
          content: String(result),
        });
      }
      // Loop back — model will process tool results
      continue;
    }

    // Final text response
    history.push(message);
    return message.content ?? '';
  }
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function banner() {
  console.log(`\n${C.pink}${C.bold}🌸 Sakura${C.reset}${C.dim} — Agentic AI CLI${C.reset}`);
  console.log(`${C.dim}Working dir: ${CWD}${C.reset}\n`);
}

function showPicker() {
  console.log(`${C.purple}Pick a model:${C.reset}\n`);
  console.log(`  ${C.pink}[0]${C.reset} ${C.bold}EXIT${C.reset}`);
  console.log(`      ${C.dim}Quit Sakura${C.reset}\n`);
  models.forEach((m, i) => {
    console.log(`  ${C.pink}[${i + 1}]${C.reset} ${C.bold}${m.name}${C.reset} ${C.dim}(${m.provider})${C.reset}`);
    console.log(`      ${C.dim}${m.best_for.join(' · ')}${C.reset}`);
    console.log();
  });
}

function printToolCall(name, args) {
  const label = {
    read_file:    `📄 read   ${args.path}`,
    write_file:   `✏️  write  ${args.path}`,
    list_dir:     `📁 list   ${args.path ?? '.'}`,
    run_command:  `⚡ run    ${args.command}`,
    search_files: `🔍 search ${args.pattern}${args.contains ? ` (contains: "${args.contains}")` : ''}`,
  }[name] ?? `🔧 ${name}`;
  console.log(`${C.yellow}  → ${label}${C.reset}`);
}

async function main() {
  banner();
  showPicker();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const pickModel = () => new Promise((resolve_) => {
    rl.question(`${C.cyan}Select (0-${models.length}): ${C.reset}`, (input) => {
      const n = parseInt(input.trim(), 10);
      if (n === 0) {
        console.log(`\n${C.pink}Bye! 🌸${C.reset}\n`);
        rl.close();
        process.exit(0);
      }
      if (n >= 1 && n <= models.length) {
        resolve_(models[n - 1]);
      } else {
        console.log(`${C.dim}  Enter a number between 0 and ${models.length}.${C.reset}`);
        resolve_(pickModel());
      }
    });
  });

  const model = await pickModel();
  console.log(`\n${C.pink}✓${C.reset} Using ${C.bold}${model.name}${C.reset}`);
  console.log(`${C.dim}Agent can read/write files, list dirs, run commands, search files.${C.reset}`);
  console.log(`${C.dim}Type "exit" to quit · "clear" to reset history${C.reset}\n`);

  const systemPrompt = {
    role: 'system',
    content: `You are Sakura, an agentic AI assistant with access to the local filesystem and shell.
Working directory: ${CWD}

You have these tools: read_file, write_file, list_dir, run_command, search_files.
Use them proactively to understand the codebase, read files before editing, and verify your work.
Always read a file before modifying it. When writing code, run it to confirm it works.
Be concise in explanations but thorough in execution.`,
  };

  const history = [systemPrompt];

  const chat = () => rl.question(`\n${C.cyan}You:${C.reset} `, async (input) => {
    const text = input.trim();
    if (!text) return chat();
    if (text === 'exit') { console.log(`\n${C.pink}Bye! 🌸${C.reset}\n`); rl.close(); return; }
    if (text === 'clear') {
      history.length = 1; // keep system prompt
      console.log(`${C.dim}(history cleared)${C.reset}`);
      return chat();
    }

    history.push({ role: 'user', content: text });

    try {
      console.log(`${C.dim}\nThinking...${C.reset}`);
      const reply = await agentLoop(model.id, history, (name, args) => {
        printToolCall(name, args);
      });
      console.log(`\n${C.purple}${model.name}:${C.reset} ${reply}`);
    } catch (e) {
      console.error(`${C.red}Error: ${e.message}${C.reset}`);
      history.pop();
    }

    chat();
  });

  chat();
}

main().catch(console.error);