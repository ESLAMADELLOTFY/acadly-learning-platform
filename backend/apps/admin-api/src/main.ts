import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApi } from '../../../libs/modules/src/shared/http/configure-api.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await configureApi(app, Number(process.env.ADMIN_API_PORT) || 4000);
}

bootstrap();
