import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { LogsService } from '../../logs/logs.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logsService: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: LogsService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: '1', action: 'test' }),
          },
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    logsService = module.get<LogsService>(LogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should log POST requests', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/users',
        body: {},
        user: { id: '1' },
      };

      const mockResponse = {
        statusCode: 201,
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({ id: '1' })),
      } as unknown as CallHandler;

      await interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .toPromise();

      expect(logsService.create).toHaveBeenCalled();
    });

    it('should log PUT requests', async () => {
      const mockRequest = {
        method: 'PUT',
        url: '/users/1',
        body: {},
        user: { id: '1' },
      };

      const mockResponse = {
        statusCode: 200,
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({ id: '1' })),
      } as unknown as CallHandler;

      await interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .toPromise();

      expect(logsService.create).toHaveBeenCalled();
    });

    it('should log DELETE requests', async () => {
      const mockRequest = {
        method: 'DELETE',
        url: '/users/1',
        body: {},
        user: { id: '1' },
      };

      const mockResponse = {
        statusCode: 204,
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(null)),
      } as unknown as CallHandler;

      await interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .toPromise();

      expect(logsService.create).toHaveBeenCalled();
    });

    it('should log errors', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/users',
        body: {},
        user: { id: '1' },
      };

      const mockResponse = {
        statusCode: 500,
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const mockError = new Error('Test error');
      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => mockError)),
      } as unknown as CallHandler;

      try {
        await interceptor
          .intercept(mockExecutionContext, mockCallHandler)
          .toPromise();
      } catch {
        expect(logsService.create).toHaveBeenCalled();
      }
    });
  });
});
