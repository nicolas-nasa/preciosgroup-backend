import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOfProcessesService } from './type-of-processes.service';
import { TypeOfProcessesController } from './type-of-processes.controller';
import { TypeOfProcessEntity } from './type-of-processes.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOfProcessEntity]), AuthenticationModule],
  controllers: [TypeOfProcessesController],
  providers: [TypeOfProcessesService],
  exports: [TypeOfProcessesService, TypeOrmModule],
})
export class TypeOfProcessesModule {}
