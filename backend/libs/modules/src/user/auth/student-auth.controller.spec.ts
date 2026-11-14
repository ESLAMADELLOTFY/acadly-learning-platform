import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { AuthController } from '../../shared/auth/auth.controller.js';
import { AUTH_CONSTANTS } from '../../shared/auth/auth.constants.js';
import { setAccessTokenCookie } from '../../shared/auth/access-token-cookie.js';
import { StudentAuthController } from './student-auth.controller.js';

describe('StudentAuthController', () => {
  it('exposes registration only from the student API', () => {
    const register = StudentAuthController.prototype.register;
    expect(Reflect.getMetadata(PATH_METADATA, register)).toBe('register');
    expect(Reflect.getMetadata(METHOD_METADATA, register)).toBe(
      RequestMethod.POST,
    );
    expect('register' in AuthController.prototype).toBe(false);
  });

  it('sets the authentication cookie for a successful registration', () => {
    const response = { cookie: vi.fn() };
    setAccessTokenCookie(response, 'signed-token', '1d');

    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE_NAME,
      'signed-token',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );
  });
});
