import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';
import { SignInDto } from './dto/signin.dto.js';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    signIn(signInDto: SignInDto, res: Response): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            roles: import("../users/user-role.enum.js").UserRole[];
        };
    }>;
    logout(res: Response): {
        message: string;
    };
    me(req: Request): Promise<{
        id: number;
        name: string;
        email: string;
        roles: import("../users/user-role.enum.js").UserRole[];
    }>;
    private setAccessTokenCookie;
}
