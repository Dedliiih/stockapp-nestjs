import { Controller, Post, Body, Get } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('signup')
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<any> {
    await this.usersService.registerUser(registerUserDto);

    return { message: 'Usuario registrado correctamente' };
  }
}
