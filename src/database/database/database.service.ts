import { Inject, Injectable, InternalServerErrorException, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject('DATABASE_CONNECTION') private readonly connection: mysql.Connection) {}

  private async closeConnection(): Promise<void> {
    await this.connection.end();
  }

  private async executeQuery(query: string, params: any): Promise<any> {
    return await this.connection.query(query, params);
  }

  async getData(query: string, params: any[] | string = null): Promise<any> {
    const [result] = await this.executeQuery(query, params);
    return result;
  }

  async insertData(query: string, params: any[]) {
    const [result] = await this.executeQuery(query, params);
    return result;
  }

  async deleteData(query: string, params: any[]): Promise<any> {
    const [result] = await this.executeQuery(query, params);
    return result;
  }

  async transaction(queries: [string, any[]][]): Promise<any> {
    let lastInsertId: number | undefined = null;
    try {
      await this.connection.beginTransaction();

      for (const [query, params] of queries) {
        const processedParams = params.map((param) => (param === ':lastInsertId' && lastInsertId !== undefined ? lastInsertId : param));

        const [result] = await this.executeQuery(query, processedParams);

        if (query.trim().toUpperCase().startsWith('INSERT') && result.insertId) {
          lastInsertId = result.insertId;
        }
      }
      return await this.connection.commit();
    } catch {
      await this.connection.rollback();
      throw new InternalServerErrorException('Hubo un error.');
    }
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }
}
