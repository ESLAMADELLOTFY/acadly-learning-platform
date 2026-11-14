import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../libs/modules/src/shared/database/database.module.js';
import { HealthModule } from '../../../libs/modules/src/shared/health/health.module.js';
import { StudentAuthModule } from '../../../libs/modules/src/user/auth/student-auth.module.js';

@Module({
  imports: [
    DatabaseModule.forRoot({ migrationsRun: false }),
    StudentAuthModule,
    HealthModule,
  ],
})
export class AppModule {}
