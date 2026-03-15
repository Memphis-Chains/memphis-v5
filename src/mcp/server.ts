import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { runMemphisDecide } from './tools/decide.js';
import { runMemphisExec } from './tools/exec.js';
import { runMemphisHealth } from './tools/health.js';
import { runMemphisJournal } from './tools/journal.js';
import { runMemphisLoopStep } from './tools/loop-step.js';
import { runMemphisRecall } from './tools/recall.js';
import { runMemphisWebFetch } from './tools/web-fetch.js';
import { loadConfig } from '../infra/config/env.js';
import { createSqliteClient, runMigrations } from '../infra/storage/sqlite/client.js';
import { SqliteToolPermissionRepository } from '../infra/storage/sqlite/repositories/tool-permission-repository.js';

function getToolPermissionRepo(): SqliteToolPermissionRepository {
  const config = loadConfig();
  const db = createSqliteClient(config.DATABASE_URL);
  runMigrations(db);
  return new SqliteToolPermissionRepository(db);
}

function isToolAllowed(repo: SqliteToolPermissionRepository, toolName: string): boolean {
  return repo.isAllowed(toolName).allowed;
}

export function createMemphisMcpServer(): McpServer {
  const server = new McpServer({
    name: 'memphis-v5-mcp',
    version: '5.1.2',
  });

  const repo = getToolPermissionRepo();

  if (isToolAllowed(repo, 'memphis_journal')) {
    server.registerTool(
      'memphis_journal',
      {
        description: 'Save entries to journal chain',
        inputSchema: {
          content: z.string().min(1),
          tags: z.array(z.string()).optional(),
        },
      },
      async ({ content, tags }) => {
        const result = await runMemphisJournal({ content, tags });
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }

  if (isToolAllowed(repo, 'memphis_recall')) {
    server.registerTool(
      'memphis_recall',
      {
        description: 'Semantic search across chains',
        inputSchema: {
          query: z.string().min(1),
          limit: z.number().int().min(1).max(50).optional(),
        },
      },
      async ({ query, limit }) => {
        const result = runMemphisRecall({ query, limit });
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }

  if (isToolAllowed(repo, 'memphis_decide')) {
    server.registerTool(
      'memphis_decide',
      {
        description: 'Record decisions',
        inputSchema: {
          title: z.string().min(1),
          choice: z.string().min(1),
          context: z.string().optional(),
        },
      },
      async ({ title, choice, context }) => {
        const result = await runMemphisDecide({ title, choice, context });
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }

  if (isToolAllowed(repo, 'memphis_health')) {
    server.registerTool(
      'memphis_health',
      {
        description: 'Check Memphis runtime health (database, rust bridge, data dir, embedding provider)',
        inputSchema: {},
      },
      async () => {
        const result = await runMemphisHealth();
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }

  if (isToolAllowed(repo, 'memphis_web_fetch')) {
    server.registerTool(
      'memphis_web_fetch',
      {
        description: 'Fetch a public URL and return its content (blocks internal/private addresses)',
        inputSchema: {
          url: z.string().url(),
        },
      },
      async ({ url }) => {
        const result = await runMemphisWebFetch({ url });
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }

  if (isToolAllowed(repo, 'memphis_loop_step')) {
    server.registerTool(
      'memphis_loop_step',
      {
        description: 'Enforce agent loop limits via Rust LoopEngine (authoritative step enforcement)',
        inputSchema: {
          state: z.object({
            steps: z.number().int().min(0),
            tool_calls: z.number().int().min(0),
            wait_ms: z.number().int().min(0),
            errors: z.number().int().min(0),
            completed: z.boolean(),
            halt_reason: z.string().nullable(),
          }),
          action: z.discriminatedUnion('type', [
            z.object({ type: z.literal('tool_call'), data: z.object({ tool: z.string() }) }),
            z.object({ type: z.literal('wait'), data: z.object({ duration_ms: z.number() }) }),
            z.object({ type: z.literal('complete'), data: z.object({ summary: z.string() }) }),
            z.object({ type: z.literal('error'), data: z.object({ recoverable: z.boolean(), message: z.string() }) }),
          ]),
          limits: z.object({
            max_steps: z.number().int().min(1),
            max_tool_calls: z.number().int().min(1),
            max_wait_ms: z.number().int().min(1),
            max_errors: z.number().int().min(1),
          }).optional(),
        },
      },
      async ({ state, action, limits }) => {
        const result = runMemphisLoopStep({ state, action, limits });
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      },
    );
  }

  if (isToolAllowed(repo, 'memphis_exec')) {
    server.registerTool(
      'memphis_exec',
      {
        description: 'Execute a safe, allowlisted command (echo, pwd, ls, whoami, date, uptime)',
        inputSchema: {
          command: z.string().min(1).max(256),
        },
      },
      async ({ command }) => {
        const result = runMemphisExec({ command });
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }

  return server;
}
