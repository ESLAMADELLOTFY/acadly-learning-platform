import { Repository } from 'typeorm';
import { User, type PublicUser } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<PublicUser>;
    findAll(): Promise<PublicUser[]>;
    findOne(id: number): Promise<PublicUser | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    private toPublicUser;
}
