import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TOKEN_KEY } from './constants/constants';
import AuthRepository from './repository/auth.repository';
import { DatabaseService } from 'src/database/database/database.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: TOKEN_KEY,
      signOptions: { expiresIn: 60 * 60 }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, DatabaseService],
  exports: [AuthRepository]
})
export class AuthModule {}
