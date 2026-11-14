import { UsersController } from './users.controller.js';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../shared/auth/decorators/roles.decorator.js';
import { UserRole } from '../../shared/users/user-role.enum.js';

describe('UsersController', () => {
  it('restricts user management to admin roles', () => {
    const reflector = new Reflector();

    expect(reflector.get(ROLES_KEY, UsersController)).toEqual([
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);
  });
});
