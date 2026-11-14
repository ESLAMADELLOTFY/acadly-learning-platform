import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/user-role.enum.js';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns the shared account roles from registration', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 12,
      name: 'Student',
      email: 'student@example.com',
      roles: [UserRole.STUDENT],
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    const result = await service.register({
      name: 'Student',
      email: 'student@example.com',
      password: 'secure-password',
    });

    expect(result.user.roles).toEqual([UserRole.STUDENT]);
    expect(result.accessToken).toBe('signed-token');
    expect(usersService.create).toHaveBeenCalledOnce();
  });
});
