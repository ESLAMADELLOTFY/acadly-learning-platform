import { CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ExecutionContext } from '@nestjs/common';
import { UsersService } from '../../users/users.service.js';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
