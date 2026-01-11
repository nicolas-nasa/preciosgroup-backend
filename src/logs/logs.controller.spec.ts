import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

describe('LogsController', () => {
  let controller: LogsController;
  let service: LogsService;

  const mockLogsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByAction: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: LogsService,
          useValue: mockLogsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .compile();

    controller = module.get<LogsController>(LogsController);
    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all logs with pagination', async () => {
      const mockLogs = {
        data: [],
        total: 0,
      };

      mockLogsService.findAll.mockResolvedValue(mockLogs);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(mockLogs);
      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('findByAction', () => {
    it('should return logs filtered by action', async () => {
      const mockLogs = {
        data: [],
        total: 0,
      };

      mockLogsService.findByAction.mockResolvedValue(mockLogs);

      const result = await controller.findByAction('CREATE', 1, 20);

      expect(result).toEqual(mockLogs);
      expect(service.findByAction).toHaveBeenCalledWith('CREATE', 1, 20);
    });
  });

  describe('findByUserId', () => {
    it('should return logs filtered by user ID', async () => {
      const mockLogs = {
        data: [],
        total: 0,
      };

      mockLogsService.findByUserId.mockResolvedValue(mockLogs);

      const result = await controller.findByUserId('user-123', 1, 20);

      expect(result).toEqual(mockLogs);
      expect(service.findByUserId).toHaveBeenCalledWith('user-123', 1, 20);
    });
  });

  describe('findById', () => {
    it('should return a single log by ID', async () => {
      const mockLog = {
        id: '1',
        action: 'CREATE',
        userId: 'user-123',
      };

      mockLogsService.findById.mockResolvedValue(mockLog);

      const result = await controller.findById('1');

      expect(result).toEqual(mockLog);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });
});
