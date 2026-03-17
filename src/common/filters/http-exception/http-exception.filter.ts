import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter for handling all HTTP exceptions
 * Provides consistent error response format following ExceptionResponse interface
 * Automatically extracts statusCode, error name, message, and additional data
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Log the error
    this.logger.error(
      `HTTP ${status} Error: ${exception.message}`,
      exception.stack,
    );

    this.logger.error('Exception response:', exceptionResponse);

    // Build the standardized error response
    const errorResponse: any = {
      statusCode: status,
      error: this.getErrorName(status),
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Handle different response formats from thrown exceptions
    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      // If message is an array, set it as messages
      if (Array.isArray(responseObj.message)) {
        errorResponse.messages = responseObj.message;
        errorResponse.message = responseObj.message[0] || exception.message;
      } else if (responseObj.message) {
        errorResponse.message = responseObj.message;
      }

      // Include additional data if provided
      if (responseObj.data) {
        errorResponse.data = responseObj.data;
      }

      // Include any other custom fields
      Object.keys(responseObj).forEach((key) => {
        if (
          !['statusCode', 'error', 'message', 'data'].includes(key) &&
          responseObj[key] !== undefined
        ) {
          errorResponse[key] = responseObj[key];
        }
      });
    }

    // Remove timestamp and path in production if desired (optional)
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.timestamp;
      delete errorResponse.path;
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Converts HTTP status code to human-readable error name
   */
  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad_Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not_Found';
      case HttpStatus.METHOD_NOT_ALLOWED:
        return 'Method_Not_Allowed';
      case HttpStatus.NOT_ACCEPTABLE:
        return 'Not_Acceptable';
      case HttpStatus.REQUEST_TIMEOUT:
        return 'Request_Timeout';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.GONE:
        return 'Gone';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable_Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too_Many_Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal_Server_Error';
      case HttpStatus.NOT_IMPLEMENTED:
        return 'Not_Implemented';
      case HttpStatus.BAD_GATEWAY:
        return 'Bad_Gateway';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service_Unavailable';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'Gateway_Timeout';
      default:
        return 'Error';
    }
  }
}
