import { InternalServerErrorException } from '@nestjs/common';

export const CORS_WHITELIST = [process.env.FRONTEND_URL];

export const CORS_CONFIG = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || CORS_WHITELIST.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new InternalServerErrorException('No permitido por CORS.'));
    }
  },
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
};
