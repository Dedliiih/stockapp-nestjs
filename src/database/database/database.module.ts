import { Module, Global } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { configDotenv } from 'dotenv';

configDotenv();

const databaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    return mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      port: parseInt(process.env.DBPORT),
      password: process.env.DBPASSWORD,
      database: process.env.DB,
    });
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
