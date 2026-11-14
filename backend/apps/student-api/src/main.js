import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApi } from '../../../libs/modules/src/shared/http/configure-api.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await configureApi(app, Number(process.env.STUDENT_API_PORT) || 4001);
}
bootstrap();
//# sourceMappingURL=main.js.map