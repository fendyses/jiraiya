#!/usr/bin/env node
import { config } from 'dotenv';
import readline from 'readline';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const models = JSON.parse(readFileSync(join(__dirname, 'models.json'), 'utf8'));

function providerConfig(providerName) {
  const provider = models.providers[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);
  const apiKey = process.env[provider.api_key_env];
  if (!apiKey) throw new Error(`Missing ${provider.api_key_env} in .env`);
  return { apiKey, baseUrl: provider.base_url };
}

const ALIASES = {
  nemotron: 'nvidia/nemotron-3-ultra-550b-a55b',
  qwen:     'qwen/qwen3-coder',
  coder:    'qwen/qwen3-coder',
  deepseek: 'deepseek/deepseek-v4-flash',
  flash:    'deepseek/deepseek-v4-flash',
  oss:      'openai/gpt-oss-120b:free',
  gpt:      'openai/gpt-oss-120b:free',
  gemma:    'google/gemma-4-31b-it:free',
  super:    'nvidia/nemotron-3-super-120b-a12b:free',
  laguna:   'poolside/laguna-m.1:free',
  north:    'cohere/north-mini-code:free',
  owl:      'openrouter/owl-alpha',
  llama70:  'llama-3.3-70b-versatile',
  llama8:   'llama-3.1-8b-instant',
  qwen32:   'qwen/qwen3-32b',
  groqoss:  'openai/gpt-oss-120b',
};

function resolveModel(input) {
  if (!input) return null;
  const alias = ALIASES[input.toLowerCase()];
  if (alias) return models.models.find(m => m.id === alias);
  return models.models.find(m => m.id === input || m.name.toLowerCase().includes(input.toLowerCase()));
}

function listModels() {
  console.log('\nAvailable models:');
  models.models.forEach((m, i) => {
    console.log(`  [${i + 1}] ${m.name} (${m.provider})`);
    console.log(`      id: ${m.id}`);
    console.log(`      best for: ${m.best_for.join(', ')}`);
  });
  console.log('\nAliases: nemotron, qwen/coder, deepseek/flash, oss/gpt, gemma, super, laguna, north, owl, llama70, llama8, qwen32, groqoss\n');
}

async function ask(model, history) {
  const max_tokens = model.max_tokens ?? 4096;
  const { apiKey, baseUrl } = providerConfig(model.provider);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: model.id, messages: history, max_tokens }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--list' || args[0] === '-l') {
    listModels();
    process.exit(0);
  }

  // One-shot mode: ai <model> "your question"
  if (args.length >= 2) {
    const model = resolveModel(args[0]);
    if (!model) { console.error(`Unknown model: ${args[0]}`); process.exit(1); }
    const prompt = args.slice(1).join(' ');
    process.stdout.write(`${model.name}: `);
    const reply = await ask(model, [{ role: 'user', content: prompt }]);
    console.log(reply);
    process.exit(0);
  }

  // Interactive mode
  const modelArg = args[0];
  if (!modelArg) {
    console.error('\nUsage: ai <model> [question]\n');
    listModels();
    process.exit(1);
  }
  const model = resolveModel(modelArg);
  if (!model) { console.error(`Unknown model: ${modelArg}`); listModels(); process.exit(1); }

  console.log(`\nChatting with: ${model.name}`);
  console.log('Type "exit" or Ctrl+C to quit, "clear" to reset history.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const history = [];

  const prompt = () => rl.question('You: ', async (input) => {
    const text = input.trim();
    if (!text) return prompt();
    if (text === 'exit') { rl.close(); return; }
    if (text === 'clear') { history.length = 0; console.log('(history cleared)\n'); return prompt(); }

    history.push({ role: 'user', content: text });
    try {
      const reply = await ask(model, history);
      history.push({ role: 'assistant', content: reply });
      console.log(`\n${model.name}: ${reply}\n`);
    } catch (e) {
      console.error(`Error: ${e.message}\n`);
      history.pop();
    }
    prompt();
  });

  prompt();
}

main().catch(console.error);
