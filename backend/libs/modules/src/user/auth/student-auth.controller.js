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
import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../shared/auth/auth.service.js';
import { setAccessTokenCookie } from '../../shared/auth/access-token-cookie.js';
import { RegisterDto } from '../../shared/auth/dto/register.dto.js';
let StudentAuthController = class StudentAuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async register(registerDto, response) {
        const result = await this.authService.register(registerDto);
        setAccessTokenCookie(response, result.accessToken, this.configService.getOrThrow('jwt.expiresIn'));
        return {
            message: 'Register successful',
            user: result.user,
        };
    }
};
__decorate([
    Post('register'),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], StudentAuthController.prototype, "register", null);
StudentAuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        ConfigService])
], StudentAuthController);
export { StudentAuthController };
//# sourceMappingURL=student-auth.controller.js.map