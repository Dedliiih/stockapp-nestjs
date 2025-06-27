import { ApiProperty } from '@nestjs/swagger';

export class UserPublicProfileDto {
  @ApiProperty({ example: 1 })
  userId: string;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiProperty({ example: 'admin' })
  lastName: string;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 5 })
  rolId: string;
}
