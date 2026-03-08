import { bootstrap } from './app/bootstrap.js';

bootstrap().catch((error) => {
  console.error('Bootstrap failed', error);
  process.exit(1);
});
