import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User, type PublicUser } from './entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email.trim().toLowerCase(),
      password: hashedPassword,
      roles: createUserDto.roles ?? [UserRole.STUDENT],
    });

    const savedUser = await this.userRepository.save(user);
    return this.toPublicUser(savedUser);
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.userRepository.find({
      select: { id: true, name: true, email: true, roles: true },
    });
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number): Promise<PublicUser | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { id: true, name: true, email: true, roles: true },
    });
    return user ? this.toPublicUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<PublicUser | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };
  }
}