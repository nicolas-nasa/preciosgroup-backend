import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthStatus(): string {
    return 'Online';
  }
}
