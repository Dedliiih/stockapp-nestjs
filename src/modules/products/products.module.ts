import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseService } from 'src/database/database/database.service';
import ProductsRepository from './repository/products.repository';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, DatabaseService, ProductsRepository]
})
export class ProductsModule {}
