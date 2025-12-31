import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create Users',
    description: 'Name of the permission',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Permission to create new users in the system',
    description: 'Description of what the permission allows',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  description: string;

  @ApiProperty({
    example: 'users:create',
    description: 'Unique identifier key for the permission',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  key: string;
}
