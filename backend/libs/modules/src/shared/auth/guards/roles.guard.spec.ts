import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { UserRole } from '../../users/user-role.enum.js';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(),
  };
  const guard = new RolesGuard(reflector as unknown as Reflector);
  const handler = () => undefined;
  const controller = class {};

  function createContext(roles: UserRole[]): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 1, roles } }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies a student access to an admin-only route', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createContext([UserRole.STUDENT]))).toBe(false);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      handler,
      controller,
    ]);
  });

  it('allows a user with any required role', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

    expect(guard.canActivate(createContext([UserRole.SUPER_ADMIN]))).toBe(true);
  });

  it('allows routes without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext([UserRole.STUDENT]))).toBe(true);
  });
});
