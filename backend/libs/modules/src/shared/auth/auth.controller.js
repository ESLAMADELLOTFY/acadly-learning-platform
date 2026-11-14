var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, } from '@nestjs/common';
import { AUTH_CONSTANTS } from './auth.constants.js';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/signin.dto.js';
import { ConfigService } from '@nestjs/config';
import { extractAccessToken } from './access-token.js';
import { setAccessTokenCookie } from './access-token-cookie.js';
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async signIn(signInDto, res) {
        const result = await this.authService.signIn(signInDto);
        this.setAccessTokenCookie(res, result.accessToken);
        return {
            message: 'Login successful',
            user: result.user,
        };
    }
    logout(res) {
        res.clearCookie(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return {
            message: 'Logged out successfully',
        };
    }
    me(req) {
        const token = extractAccessToken(req);
        if (!token) {
            throw new UnauthorizedException('Missing access token');
        }
        return this.authService.getMe(token);
    }
    setAccessTokenCookie(res, accessToken) {
        setAccessTokenCookie(res, accessToken, this.configService.getOrThrow('jwt.expiresIn'));
    }
};
__decorate([
    Post('signin'),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignInDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    Post('logout'),
    __param(0, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    Get('me'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        ConfigService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map