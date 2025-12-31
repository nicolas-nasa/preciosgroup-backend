import { Module } from '@nestjs/common';
import { ProcessesController } from './processes.controller';
import { ProcessesService } from './processes.service';
import { ProcessEntity } from './processes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [AuthenticationModule, TypeOrmModule.forFeature([ProcessEntity])],
  controllers: [ProcessesController],
  providers: [ProcessesService],
})
export class ProcessesModule {}
