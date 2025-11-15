const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const OUTPUT_PATH = path.join(ROOT_DIR, 'supabase-config.js');

function parseEnv(content) {
  const result = {};
  content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      return;
    }
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    result[key] = value;
  });
  return result;
}

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function main() {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('Missing .env file. Create it from .env.example before running this script.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  const env = parseEnv(envContent);
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  const fileContents = `window.__SUPABASE_CONFIG = {
  url: '${escapeJs(env.SUPABASE_URL)}',
  anonKey: '${escapeJs(env.SUPABASE_ANON_KEY)}'
};
`;

  fs.writeFileSync(OUTPUT_PATH, fileContents, 'utf8');
  console.log(`Generated ${path.relative(ROOT_DIR, OUTPUT_PATH)} from .env.`);
}

main();

