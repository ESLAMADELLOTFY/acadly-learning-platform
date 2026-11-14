import { CreateUserDto } from '../../shared/users/dto/create-user.dto.js';
import { UpdateUserDto } from '../../shared/users/dto/update-user.dto.js';
import { UsersService } from '../../shared/users/users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("../../shared/users/entities/user.entity.js").PublicUser>;
    findAll(): Promise<import("../../shared/users/entities/user.entity.js").PublicUser[]>;
    findOne(id: number): Promise<import("../../shared/users/entities/user.entity.js").PublicUser | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("../../shared/users/entities/user.entity.js").PublicUser | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
