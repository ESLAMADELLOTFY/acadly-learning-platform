import { Module } from '@nestjs/common';
import { AuthModule } from '../../../libs/modules/src/shared/auth/auth.module.js';
import { DatabaseModule } from '../../../libs/modules/src/shared/database/database.module.js';
import { HealthModule } from '../../../libs/modules/src/shared/health/health.module.js';
import { UsersAdminModule } from '../../../libs/modules/src/admin/users/users-admin.module.js';

@Module({
  imports: [
    DatabaseModule.forRoot({ migrationsRun: true }),
    AuthModule,
    UsersAdminModule,
    HealthModule,
  ],
})
export class AppModule {}
