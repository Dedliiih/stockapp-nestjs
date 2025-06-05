import { SetMetadata } from '@nestjs/common';

/* Decorator to indicate that an endpoint is of public character. */

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
