import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
export declare class StudentAuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    register(registerDto: RegisterDto, response: Response): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            roles: import("../users/user-role.enum.js").UserRole[];
        };
    }>;
}
