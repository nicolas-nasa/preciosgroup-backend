import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeResponseInterceptor implements NestInterceptor {
  private readonly sensitiveFields = ['password'];
  private readonly dateFields = ['createdAt', 'updatedAt', 'deletedAt'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.sanitize(data)));
  }

  private sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    const obj = data as Record<string, unknown>;

    if ('data' in obj && 'total' in obj && Array.isArray(obj.data)) {
      return {
        ...obj,
        data: (obj.data as unknown[]).map((item) => this.sanitize(item)),
      };
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.sensitiveFields.includes(key)) {
        continue;
      }

      if (this.dateFields.includes(key) && value instanceof Date) {
        sanitized[key] = value.toISOString();
      } else {
        sanitized[key] = this.sanitize(value);
      }
    }

    return sanitized;
  }
}
