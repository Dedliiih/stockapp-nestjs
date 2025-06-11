import * as mysql from 'mysql2/promise';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';

export const testDatabaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    return mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      port: parseInt(process.env.DBPORT),
      password: process.env.DBPASSWORD,
      database: process.env.TEST_DB
    });
  }
};

@Global()
@Module({
  providers: [testDatabaseProvider, DatabaseService],
  exports: ['DATABASE_CONNECTION', DatabaseService]
})
export class TestDatabaseModule {}

export const restartDB = async (dbConnection: mysql.Connection) => {
  await dbConnection.query('SET FOREIGN_KEY_CHECKS = 0');
  await dbConnection.query('DELETE FROM categorias');
  await dbConnection.query('DELETE FROM productos');
  await dbConnection.query("INSERT INTO categorias (categoria_id, categoria) VALUES (1, 'Electronica'), (2, 'Ropa')");
  await dbConnection.query('SET FOREIGN_KEY_CHECKS = 1');
};
