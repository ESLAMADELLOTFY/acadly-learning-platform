import { Module } from '@nestjs/common';
import { AuthModule } from '../../shared/auth/auth.module.js';
import { UsersController } from './users.controller.js';
import { UsersModule } from '../../shared/users/users.module.js';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [UsersController],
})
export class UsersAdminModule {}
