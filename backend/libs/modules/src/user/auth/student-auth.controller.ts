import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from '../../shared/auth/auth.service.js';
import { setAccessTokenCookie } from '../../shared/auth/access-token-cookie.js';
import { RegisterDto } from '../../shared/auth/dto/register.dto.js';

@Controller('auth')
export class StudentAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);
    setAccessTokenCookie(
      response,
      result.accessToken,
      this.configService.getOrThrow<string>('jwt.expiresIn'),
    );

    return {
      message: 'Register successful',
      user: result.user,
    };
  }
}
