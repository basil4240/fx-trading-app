/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ArgumentMetadata,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
export class CustomValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
      validationError: {
        target: true,
        value: true,
      },
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !value) {
      return super.transform(value, metadata);
    }

    // Parse JSON string fields
    Object.keys(value).forEach((key) => {
      const val = value[key];

      // TODO: probaly restrict these to only certain dtos
      if (val === 'true') value[key] = true;
      if (val === 'false') value[key] = false;

      // handle json string
      if (
        typeof val === 'string' &&
        ((val.startsWith('[') && val.endsWith(']')) ||
          (val.startsWith('{') && val.endsWith('}')))
      ) {
        try {
          value[key] = JSON.parse(val);
        } catch (e) {
          // Keep original value if parse fails
        }
      }
    });

    return super.transform(value, metadata);
  }
}
