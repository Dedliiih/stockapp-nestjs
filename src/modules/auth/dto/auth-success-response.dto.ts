import { ApiProperty } from '@nestjs/swagger';
import { UserPublicProfileDto } from './user-public-profile.dto';

export class AuthSuccessResponseDto {
  @ApiProperty({ example: 'Sesión iniciada correctamente.' })
  message: string;

  @ApiProperty({ type: UserPublicProfileDto })
  userProfile: UserPublicProfileDto;
}
