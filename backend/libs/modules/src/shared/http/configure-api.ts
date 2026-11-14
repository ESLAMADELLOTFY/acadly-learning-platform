import { Logger, ValidationPipe, type INestApplication } from '@nestjs/common';

export async function configureApi(
  app: INestApplication,
  port: number,
): Promise<void> {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins =
    process.env.FRONTEND_URL?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(port);
  Logger.log(`API listening at http://localhost:${port}`);
}
