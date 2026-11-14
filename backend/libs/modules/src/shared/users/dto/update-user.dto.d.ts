import { UserRole } from '../user-role.enum.js';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    roles?: UserRole[];
}
