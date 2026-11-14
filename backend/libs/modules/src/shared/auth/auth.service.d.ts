import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { SignInDto } from './dto/signin.dto.js';
import { RegisterDto } from './dto/register.dto.js';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            roles: import("../users/user-role.enum.js").UserRole[];
        };
    }>;
    signIn(signInDto: SignInDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            roles: import("../users/user-role.enum.js").UserRole[];
        };
    }>;
    getMe(token: string): Promise<{
        id: number;
        name: string;
        email: string;
        roles: import("../users/user-role.enum.js").UserRole[];
    }>;
    private buildAuthResponse;
}
