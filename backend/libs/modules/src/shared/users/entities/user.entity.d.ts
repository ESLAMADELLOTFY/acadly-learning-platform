import { UserRole } from '../user-role.enum.js';
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'roles'>;
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    roles: UserRole[];
}
