import { Module } from '@nestjs/common';
import { AuthModule } from '../../shared/auth/auth.module.js';
import { StudentAuthController } from './student-auth.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [StudentAuthController],
})
export class StudentAuthModule {}
