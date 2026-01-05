import { PartialType } from '@nestjs/swagger';
import { CreateTypeOfProcessDto } from './create-type-of-process.dto';

export class UpdateTypeOfProcessDto extends PartialType(
  CreateTypeOfProcessDto,
) {}
