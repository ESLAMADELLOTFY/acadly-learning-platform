import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserRole } from './user-role.enum.js';

describe('UsersService', () => {
  let service: UsersService;
  const userRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('creates portal-shared accounts with the student role by default', async () => {
    userRepository.create.mockImplementation((values) => values);
    userRepository.save.mockImplementation(async (user) => ({
      id: 12,
      ...user,
    }));

    const user = await service.create({
      name: 'Student',
      email: '  STUDENT@example.com ',
      password: 'secure-password',
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'student@example.com',
        roles: [UserRole.STUDENT],
      }),
    );
    expect(user).toEqual({
      id: 12,
      name: 'Student',
      email: 'student@example.com',
      roles: [UserRole.STUDENT],
    });
    expect(user).not.toHaveProperty('password');
  });
});
