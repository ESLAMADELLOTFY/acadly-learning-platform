import { UserRole } from '../user-role.enum.js';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    roles?: UserRole[];
}
