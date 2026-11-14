import type { Request } from 'express';
import type { UserRole } from '../users/user-role.enum.js';

export type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    roles: UserRole[];
  };
};
