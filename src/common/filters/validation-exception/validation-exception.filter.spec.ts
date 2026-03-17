import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ValidationExceptionFilter } from './validation-exception.filter';

describe('ValidationExceptionFilter', () => {
  let filter: ValidationExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationExceptionFilter],
    }).compile();

    filter = module.get<ValidationExceptionFilter>(ValidationExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: jest.fn(),
        getNext: jest.fn(),
      }),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch BadRequestException and format a single error message', () => {
    const exception = new BadRequestException('Single validation error message');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Single validation error message',
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      messages: ['Single validation error message'],
    });
  });

  it('should catch BadRequestException and format multiple error messages', () => {
    const validationErrors = [
      'Property name should not be empty',
      'Property age must be a number',
    ];
    const exception = new BadRequestException(validationErrors);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Validation failed', // Default message for array of errors
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      messages: validationErrors,
    });
  });

  it('should handle non-string messages in BadRequestException', () => {
    const exceptionResponse = {
      statusCode: 400,
      message: 'Invalid input',
      error: 'Bad Request',
    };
    const exception = new BadRequestException(exceptionResponse);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid input',
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      messages: ['Invalid input'],
    });
  });

  it('should pass through exception status code', () => {
    const exception = new BadRequestException('Access Denied'); // Simplified to a standard BadRequestException
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      }),
    );
  });
});