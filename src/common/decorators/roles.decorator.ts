import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';

/* Decorator to indicate what roles are authorized to access this resource */

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
