import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../shared/auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../shared/auth/guards/roles.guard.js';
import { CreateUserDto } from '../../shared/users/dto/create-user.dto.js';
import { UpdateUserDto } from '../../shared/users/dto/update-user.dto.js';
import { UserRole } from '../../shared/users/user-role.enum.js';
import { UsersService } from '../../shared/users/users.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
