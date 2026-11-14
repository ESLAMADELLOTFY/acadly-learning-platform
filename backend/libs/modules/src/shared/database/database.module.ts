import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import databaseConfig from '../config/database.config.js';
import jwtConfig from '../config/jwt.config.js';
import { SharedPortalUserRoles1794683559000 } from './migrations/SharedPortalUserRoles1794683559000.js';

@Module({})
export class DatabaseModule {
  static forRoot(options: { migrationsRun: boolean }): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, jwtConfig],
          validationSchema: Joi.object({
            NODE_ENV: Joi.string()
              .valid('development', 'production', 'test')
              .default('development'),
            ADMIN_API_PORT: Joi.number().default(4000),
            STUDENT_API_PORT: Joi.number().default(4001),
            DB_HOST: Joi.string().required(),
            DB_PORT: Joi.number().default(3306),
            DB_USERNAME: Joi.string().required(),
            DB_PASSWORD: Joi.string().allow('').required(),
            DB_DATABASE: Joi.string().required(),
            JWT_SECRET: Joi.string().required(),
            JWT_EXPIRES_IN: Joi.string().default('1d'),
          }),
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql' as const,
            host: configService.getOrThrow<string>('database.host'),
            port: configService.getOrThrow<number>('database.port'),
            username: configService.getOrThrow<string>('database.username'),
            password: configService.getOrThrow<string>('database.password'),
            database: configService.getOrThrow<string>('database.database'),
            autoLoadEntities: true,
            migrations: [SharedPortalUserRoles1794683559000],
            migrationsRun: options.migrationsRun,
            synchronize: false,
          }),
        }),
      ],
      exports: [ConfigModule, TypeOrmModule],
    };
  }
}
