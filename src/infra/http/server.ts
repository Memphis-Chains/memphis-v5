import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import type { AppConfig } from '../config/schema.js';
import { createLogger } from '../logging/logger.js';
import { metrics } from '../logging/metrics.js';
import { isAuthRequired } from './auth-policy.js';
import { sensitiveLimiter } from './rate-limit.js';
import { computeHealthSummary } from '../ops/health-summary.js';
import { handleHttpError } from './error-handler.js';
import type { OrchestrationService } from '../../modules/orchestration/service.js';
import { registerChatRoutes } from './routes/chat.js';
import type {
  GenerationEventRepository,
  SessionRepository,
} from '../../core/contracts/repository.js';

export function createHttpServer(
  config: AppConfig,
  orchestration: OrchestrationService,
  repos?: { sessionRepository: SessionRepository; generationEventRepository: GenerationEventRepository },
) {
  const logger = createLogger(config.LOG_LEVEL);

  const app = Fastify({
    loggerInstance: logger,
    genReqId: (req) => {
      const incoming = req.headers['x-request-id'];
      if (typeof incoming === 'string' && incoming.trim().length > 0) return incoming;
      return randomUUID();
    },
    requestIdHeader: 'x-request-id',
  });

  app.setErrorHandler((error, request, reply) => handleHttpError(error, request, reply));


  const apiToken = process.env.MEMPHIS_API_TOKEN;

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);

    const requiresAuth = isAuthRequired(request.method, request.url.split('?')[0] || request.url);
    const routePath = request.url.split('?')[0] || request.url;
    const key = `${request.ip}:${request.method}:${routePath}`;
    if (
      routePath === '/v1/chat/generate' ||
      routePath === '/v1/metrics' ||
      routePath === '/v1/ops/status' ||
      routePath === '/v1/sessions' ||
      routePath.startsWith('/v1/sessions/')
    ) {
      sensitiveLimiter.check(key);
    }

    if (!requiresAuth) return;

    if (!apiToken) return;

    const auth = request.headers.authorization;
    if (!auth || auth !== `Bearer ${apiToken}`) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'unauthorized',
          details: {},
          requestId: request.id,
        },
      });
    }
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        event: 'http.request.completed',
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
      },
      'HTTP request completed',
    );
  });

  app.get('/health', async (request) => ({
    status: 'ok',
    service: 'memphis-v4',
    version: '0.1.0',
    requestId: request.id,
  }));

  app.get('/v1/providers/health', async () => {
    const providers = await orchestration.providersHealth();
    return {
      defaultProvider: config.DEFAULT_PROVIDER,
      providers,
    };
  });

  app.get('/v1/metrics', async () => {
    return metrics.snapshot();
  });


  app.get('/v1/ops/status', async () => {
    const providers = await orchestration.providersHealth();
    const uptimeSec = Math.floor(process.uptime());
    const metricsSnapshot = metrics.snapshot();
    const health = computeHealthSummary({ providers, uptimeSec });
    return {
      service: 'memphis-v4',
      version: '0.1.0',
      uptimeSec,
      defaultProvider: config.DEFAULT_PROVIDER,
      providers,
      metrics: metricsSnapshot,
      health,
      timestamp: new Date().toISOString(),
    };
  });



  app.get('/v1/sessions', async () => {
    if (!repos) return { sessions: [] };
    const sessions = repos.sessionRepository.listSessions();
    return { sessions };
  });

  app.get<{ Params: { sessionId: string } }>('/v1/sessions/:sessionId/events', async (request) => {
    if (!repos) {
      return { sessionId: request.params.sessionId, events: [] };
    }

    const sessionId = request.params.sessionId;
    const events = repos.generationEventRepository.listBySession(sessionId);
    return { sessionId, events };
  });

  registerChatRoutes(app, orchestration, repos);

  return app;
}
