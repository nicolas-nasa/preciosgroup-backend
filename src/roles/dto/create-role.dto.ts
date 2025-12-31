import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Manager',
    description: 'Name of the role',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Manager with limited access to system resources',
    description: 'Description of the role and its purpose',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  description: string;

  @ApiProperty({
    example: 'manager',
    description: 'Unique identifier key for the role',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  key: string;

  @ApiProperty({
    type: [String],
    isArray: true,
    description: 'Array of permission IDs to assign to this role',
    example: ['uuid-perm-1', 'uuid-perm-2'],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the role is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
