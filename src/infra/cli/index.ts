import { loadConfig } from '../config/env.js';
import { createAppContainer } from '../../app/container.js';

type CliArgs = {
  command?: string;
  json: boolean;
  input?: string;
  provider?: 'auto' | 'shared-llm' | 'decentralized-llm' | 'local-fallback';
  model?: string;
};

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const json = args.includes('--json');
  const command = args.find((a) => !a.startsWith('--'));

  const readFlag = (name: string): string | undefined => {
    const idx = args.indexOf(name);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const provider = readFlag('--provider') as CliArgs['provider'];

  return {
    command,
    json,
    input: readFlag('--input'),
    provider,
    model: readFlag('--model'),
  };
}

function print(data: unknown, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (typeof data === 'object' && data !== null) {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      console.log(`${k}: ${String(v)}`);
    }
    return;
  }

  console.log(String(data));
}

function printChat(data: {
  id: string;
  providerUsed: string;
  modelUsed?: string;
  output: string;
  timingMs: number;
}): void {
  console.log(`id: ${data.id}`);
  console.log(`provider: ${data.providerUsed}`);
  if (data.modelUsed) console.log(`model: ${data.modelUsed}`);
  console.log(`timingMs: ${data.timingMs}`);
  console.log('---');
  console.log(data.output);
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const { command, json, input, provider, model } = parseArgs(argv);
  const config = loadConfig();
  const container = createAppContainer(config);

  if (!command || command === 'help' || command === '--help') {
    print(
      {
        usage: 'memphis-v4 <command> [--json]',
        commands: 'health | providers:health | chat --input "..." [--provider auto|shared-llm|decentralized-llm|local-fallback] [--model <id>]',
      },
      json,
    );
    return;
  }

  if (command === 'health') {
    const payload = {
      status: 'ok',
      service: 'memphis-v4',
      version: '0.1.0',
      nodeEnv: config.NODE_ENV,
      defaultProvider: config.DEFAULT_PROVIDER,
      timestamp: new Date().toISOString(),
    };
    print(payload, json);
    return;
  }

  if (command === 'providers:health') {
    const providers = await container.orchestration.providersHealth();
    const payload = {
      defaultProvider: config.DEFAULT_PROVIDER,
      providers,
    };
    print(payload, json);
    return;
  }

  if (command === 'chat') {
    if (!input || input.trim().length === 0) {
      throw new Error('Missing required --input for chat command');
    }

    const result = await container.orchestration.generate({
      input,
      provider: provider ?? 'auto',
      model,
    });

    if (json) {
      print(result, true);
      return;
    }

    printChat(result);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

runCli().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(4);
});
