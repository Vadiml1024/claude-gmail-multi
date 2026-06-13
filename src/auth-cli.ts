import { authorizeAccount } from './auth.js';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

const alias = arg('alias');
if (!alias) {
  console.error('Usage: npm run auth -- --alias <name> [--email <expected@email>]');
  process.exit(1);
}

authorizeAccount(alias, arg('email'))
  .then(({ alias, email }) => {
    console.error(`\nAccount "${alias}" (${email}) ready.`);
    process.exit(0);
  })
  .catch((e: Error) => {
    console.error(`\nAuth failed: ${e.message}`);
    process.exit(1);
  });
