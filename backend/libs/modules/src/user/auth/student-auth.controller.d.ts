import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from '../../shared/auth/auth.service.js';
import { RegisterDto } from '../../shared/auth/dto/register.dto.js';
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
            roles: import("../../shared/users/user-role.enum.js").UserRole[];
        };
    }>;
}
