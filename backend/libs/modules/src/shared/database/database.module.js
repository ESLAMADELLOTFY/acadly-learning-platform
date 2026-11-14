var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import databaseConfig from '../config/database.config.js';
import jwtConfig from '../config/jwt.config.js';
import { SharedPortalUserRoles1794683559000 } from './migrations/SharedPortalUserRoles1794683559000.js';
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static forRoot(options) {
        return {
            module: DatabaseModule_1,
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
                    useFactory: (configService) => ({
                        type: 'mysql',
                        host: configService.getOrThrow('database.host'),
                        port: configService.getOrThrow('database.port'),
                        username: configService.getOrThrow('database.username'),
                        password: configService.getOrThrow('database.password'),
                        database: configService.getOrThrow('database.database'),
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
};
DatabaseModule = DatabaseModule_1 = __decorate([
    Module({})
], DatabaseModule);
export { DatabaseModule };
//# sourceMappingURL=database.module.js.map