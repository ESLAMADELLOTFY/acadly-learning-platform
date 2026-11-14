var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum.js';
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
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
    async findAll() {
        const users = await this.userRepository.find({
            select: { id: true, name: true, email: true, roles: true },
        });
        return users.map((user) => this.toPublicUser(user));
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: { id: true, name: true, email: true, roles: true },
        });
        return user ? this.toPublicUser(user) : null;
    }
    async findByEmail(email) {
        return this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email: email.trim().toLowerCase() })
            .getOne();
    }
    async update(id, updateUserDto) {
        await this.userRepository.update(id, updateUserDto);
        return this.findOne(id);
    }
    async remove(id) {
        return this.userRepository.delete(id);
    }
    toPublicUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
        };
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map