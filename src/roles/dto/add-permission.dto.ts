import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPermissionDto {
  @ApiProperty({
    example: 'uuid-permission-1',
    description: 'UUID of the permission to add to the role',
  })
  @IsUUID('4')
  @IsNotEmpty()
  permissionId: string;
}
