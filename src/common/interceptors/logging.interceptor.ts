import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LogsService } from 'src/logs/logs.service';
import { FriendlyActionEnum, ResultEnum } from 'src/logs/enums/action.enum';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: Record<string, unknown> }>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;

    if (
      url.includes('/authentication/sign-in') ||
      url.includes('/authentication/logout') ||
      url.includes('/authentication/refresh-token')
    ) {
      return next.handle();
    }

    let userId: string | undefined;
    const bypassHeader = request.headers['x-bypass-auth'] as string | undefined;
    const secretBypass = process.env.SECRET_BYPASS;

    if (secretBypass && bypassHeader === secretBypass) {
      userId = undefined;
    } else if (request.user?.id) {
      userId = request.user.id as string;
    } else if (request.user?.sub) {
      userId = request.user.sub as string;
    }

    const actionDate = new Date();

    const module = this.extractModuleFromUrl(url);
    const friendlyAction = this.getActionFromMethod(method);

    const parameters = this.extractAndFormatParameters(request);

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;

        if (this.shouldLog(method, statusCode)) {
          try {
            void this.logsService.create({
              module,
              route: url,
              action: method,
              friendlyAction,
              result: ResultEnum.SUCCESS,
              userId,
              actionDate,
              parameters,
            });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Erro ao registrar log: ${message}`);
          }
        }
      }),
      catchError((error: unknown) => {
        const resultMessage = this.getResultFromError(error);

        try {
          void this.logsService.create({
            module,
            route: url,
            action: method,
            friendlyAction,
            result: resultMessage,
            userId,
            actionDate,
            parameters,
          });
        } catch (logError: unknown) {
          const message =
            logError instanceof Error ? logError.message : 'Unknown error';
          this.logger.error(`Erro ao registrar log de erro: ${message}`);
        }

        throw error;
      }),
    );
  }

  private extractModuleFromUrl(url: string): string {
    const cleanUrl = url.split('?')[0];

    const segments = cleanUrl
      .split('/')
      .filter((segment) => segment.length > 0);

    if (segments.length > 0) {
      if (segments[0] === 'api') {
        if (segments[1] === 'v1' && segments.length > 2) {
          return segments[2];
        }
        return segments.length > 1 ? segments[1] : 'unknown';
      }
      return segments[0];
    }

    return 'unknown';
  }

  private getActionFromMethod(method: string): string {
    const methodMap: Record<string, FriendlyActionEnum> = {
      POST: FriendlyActionEnum.CREATE,
      GET: FriendlyActionEnum.READ,
      PUT: FriendlyActionEnum.UPDATE,
      DELETE: FriendlyActionEnum.DELETE,
      PATCH: FriendlyActionEnum.UPDATE,
    };

    return methodMap[method] || method;
  }

  private shouldLog(method: string, statusCode: number): boolean {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return true;
    }

    if (statusCode >= 400) {
      return true;
    }

    return false;
  }

  private getResultFromError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes('unauthorized') ||
        message.includes('invalid credentials')
      ) {
        return ResultEnum.INVALID_CREDENTIALS;
      }

      if (message.includes('not found')) {
        return ResultEnum.NOT_FOUND;
      }

      if (message.includes('conflict')) {
        return ResultEnum.CONFLICT;
      }

      if (message.includes('bad request')) {
        return ResultEnum.BAD_REQUEST;
      }

      if (message.includes('inactive')) {
        return ResultEnum.USER_INACTIVE;
      }

      if (message.includes('expired')) {
        return ResultEnum.TOKEN_EXPIRED;
      }

      if (message.includes('invalid token')) {
        return ResultEnum.INVALID_TOKEN;
      }
    }

    return ResultEnum.INTERNAL_SERVER_ERROR;
  }

  private extractAndFormatParameters(
    request: Request & {
      user?: Record<string, unknown>;
      body?: Record<string, unknown>;
      params?: Record<string, unknown>;
    },
  ): Record<string, unknown> | undefined {
    const result: Record<string, unknown> = {};

    try {
      if (request.query && typeof request.query === 'object') {
        for (const [key, value] of Object.entries(request.query)) {
          if (value !== undefined) {
            result[key] = value;
          }
        }
      }

      if (request.body && typeof request.body === 'object') {
        for (const [key, value] of Object.entries(
          request.body as Record<string, unknown>,
        )) {
          if (!key.toLowerCase().includes('password') && value !== undefined) {
            result[key] = value;
          }
        }
      }

      if (request.params && typeof request.params === 'object') {
        for (const [key, value] of Object.entries(request.params)) {
          if (value !== undefined) {
            result[key] = value;
          }
        }
      }

      return Object.keys(result).length > 0 ? result : undefined;
    } catch (error) {
      this.logger.debug(
        `Erro ao extrair parâmetros: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return undefined;
    }
  }
}
