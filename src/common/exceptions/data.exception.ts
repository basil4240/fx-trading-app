import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception class for errors that include additional data
 * Follows DataExceptionResponse interface
 */
export class DataException<T = any> extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    data: T,
    messages?: string[],
  ) {
    super(
      {
        message,
        data,
        messages,
      },
      statusCode,
    );
  }
}

// Convenience methods for common status codes with data
export class DataBadRequestException<T = any> extends DataException<T> {
  constructor(message: string, data: T, messages?: string[]) {
    super(message, HttpStatus.BAD_REQUEST, data, messages);
  }
}

export class DataNotFoundException<T = any> extends DataException<T> {
  constructor(message: string, data: T, messages?: string[]) {
    super(message, HttpStatus.NOT_FOUND, data, messages);
  }
}

export class DataConflictException<T = any> extends DataException<T> {
  constructor(message: string, data: T, messages?: string[]) {
    super(message, HttpStatus.CONFLICT, data, messages);
  }
}

export class DataUnauthorizedException<T = any> extends DataException<T> {
  constructor(message: string, data: T, messages?: string[]) {
    super(message, HttpStatus.UNAUTHORIZED, data, messages);
  }
}

export class DataForbiddenException<T = any> extends DataException<T> {
  constructor(message: string, data: T, messages?: string[]) {
    super(message, HttpStatus.FORBIDDEN, data, messages);
  }
}

export class DataUnprocessableEntityException<
  T = any,
> extends DataException<T> {
  constructor(message: string, data: T, messages?: string[]) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, data, messages);
  }
}
