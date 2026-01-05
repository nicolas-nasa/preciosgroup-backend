import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeOfProcessDto {
  @ApiProperty({
    example: 'Quality Control',
    description: 'Name of the type of process',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: false,
    description: 'Whether the processes of this type are grouped',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  agrouped?: boolean;
}
