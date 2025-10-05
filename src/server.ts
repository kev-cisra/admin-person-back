import { app } from './app';
import { connectPrisma } from './config/prisma';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectPrisma();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
