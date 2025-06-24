import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import UserRepository from './repository/user.repository';
import { DatabaseService } from 'src/database/database/database.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  providers: [UsersService, UserRepository, DatabaseService],
  exports: [UsersService],
  imports: [DatabaseModule],
  controllers: [UsersController]
})
export class UsersModule {}
