import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../users/user-role.enum.js';
import { UsersService } from '../../users/users.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  const jwtService = {
    verifyAsync: vi.fn(),
  };
  const usersService = {
    findOne: vi.fn(),
  };
  const request = {
    headers: { cookie: 'access_token=valid-token' },
  };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  };
  const guard = new JwtAuthGuard(
    jwtService as unknown as JwtService,
    usersService as unknown as UsersService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    request.headers.cookie = 'access_token=valid-token';
  });

  it('attaches the current database roles to an authenticated request', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 8 });
    usersService.findOne.mockResolvedValue({
      id: 8,
      name: 'Student',
      email: 'student@example.com',
      roles: [UserRole.STUDENT],
    });

    await expect(
      guard.canActivate(context as unknown as ExecutionContext),
    ).resolves.toBe(true);
    expect(request).toHaveProperty('user', {
      id: 8,
      roles: [UserRole.STUDENT],
    });
  });

  it('rejects requests without an access token', async () => {
    request.headers.cookie = '';

    await expect(
      guard.canActivate(context as unknown as ExecutionContext),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });
});
