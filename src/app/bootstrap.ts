import { loadConfig } from '../infra/config/env.js';
import { createHttpServer } from '../infra/http/server.js';
import { createAppContainer } from './container.js';

export async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const container = createAppContainer(config);
  const app = createHttpServer(config, container.orchestration, {
    sessionRepository: container.sessionRepository,
    generationEventRepository: container.generationEventRepository,
  });

  await app.listen({ host: config.HOST, port: config.PORT });
}
