import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            signIn: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return user info and set httpOnly cookies', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      const serviceResult = {
        message: 'Signed in successfully',
        user: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'user',
        },
      };

      jest.spyOn(service, 'signIn').mockResolvedValue(serviceResult);

      await controller.signIn(signInDto, mockResponse as Response);

      expect(service.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
        mockResponse,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResult);
    });
  });

  describe('refreshToken', () => {
    it('should return new user info and refresh httpOnly cookies', async () => {
      const refreshTokenDto = { token: 'refresh_token' };
      const serviceResult = {
        message: 'Token refreshed successfully',
        user: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'user',
        },
      };

      jest.spyOn(service, 'refreshToken').mockResolvedValue(serviceResult);

      await controller.refreshToken(refreshTokenDto, mockResponse as Response);

      expect(service.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.token,
        mockResponse,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResult);
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      const refreshTokenDto = { token: '' };

      await expect(
        controller.refreshToken(refreshTokenDto, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear httpOnly cookies', () => {
      const serviceResult = { message: 'Logged out successfully' };
      jest.spyOn(service, 'logout').mockReturnValue(serviceResult);

      controller.logout(mockResponse as Response);

      expect(service.logout).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResult);
    });
  });
});
