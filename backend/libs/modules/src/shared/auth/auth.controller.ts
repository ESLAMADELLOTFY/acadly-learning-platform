import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_CONSTANTS } from './auth.constants.js';
import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';
import { SignInDto } from './dto/signin.dto.js';
import { ConfigService } from '@nestjs/config';
import { extractAccessToken } from './access-token.js';
import { setAccessTokenCookie } from './access-token-cookie.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(signInDto);
    this.setAccessTokenCookie(res, result.accessToken);

    return {
      message: 'Login successful',
      user: result.user,
    };
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
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
  @Get('me')
  me(@Req() req: Request) {
    const token = extractAccessToken(req);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    return this.authService.getMe(token);
  }

  private setAccessTokenCookie(res: Response, accessToken: string) {
    setAccessTokenCookie(
      res,
      accessToken,
      this.configService.getOrThrow<string>('jwt.expiresIn'),
    );
  }
}
