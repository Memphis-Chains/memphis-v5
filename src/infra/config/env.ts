import 'dotenv/config';
import { envSchema, type AppConfig } from './schema.js';
import { applyConfigProfile, validateProductionSafety } from './profiles.js';

function formatIssues(issues: Array<{ path: PropertyKey[]; message: string }>): string {
  return issues
    .map((issue) => {
      const key = issue.path.length > 0 ? issue.path.map(String).join('.') : 'env';
      return `- ${key}: ${issue.message}`;
    })
    .join('\n');
}

export function loadConfig(rawEnv: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const details = formatIssues(parsed.error.issues);
    throw new Error(`Invalid configuration:\n${details}`);
  }

  const profiled = applyConfigProfile(parsed.data);
  validateProductionSafety(profiled);
  return profiled;
}
