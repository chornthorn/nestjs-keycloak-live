import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'username of the user',
    example: 'thorn',
  })
  username: string;

  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'password of the user',
    example: '123456',
  })
  password: string;
}
