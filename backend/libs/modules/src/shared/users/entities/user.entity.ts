import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../user-role.enum.js';

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'roles'>;

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'json' })
  roles: UserRole[];
}