import 'dotenv/config';
import models from './models.json' with { type: 'json' };

function providerConfig(providerName) {
  const provider = models.providers[providerName];
  if (!provider) return null;
  const apiKey = process.env[provider.api_key_env];
  if (!apiKey) return null;
  return { apiKey, baseUrl: provider.base_url };
}

async function testModel(model) {
  console.log(`\nTesting: ${model.name} (${model.id}) [${model.provider}]`);
  const config = providerConfig(model.provider);
  if (!config) {
    console.log(`  SKIP: missing ${models.providers[model.provider]?.api_key_env ?? 'API key'} in .env`);
    return;
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.id,
      messages: [{ role: 'user', content: 'Say "OK" only.' }],
      max_tokens: 10,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.log(`  FAIL: ${res.status} — ${err}`);
    return;
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? '(no reply)';
  console.log(`  OK — Response: ${reply.trim()}`);
}

async function main() {
  console.log('Model Test');
  console.log('==========');
  for (const model of models.models) {
    await testModel(model);
  }
  console.log('\nDone.');
}

main().catch(console.error);
