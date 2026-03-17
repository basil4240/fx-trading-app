import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly options: {
      maxSize?: number;
      allowedMimeTypes?: string[];
      required?: boolean;
    } = {},
  ) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    const { maxSize, allowedMimeTypes, required = true } = this.options;

    if (!file && required) {
      throw new BadRequestException('File is required');
    }

    if (!file) {
      return file;
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize} bytes`,
      );
    }

    // Check MIME type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
