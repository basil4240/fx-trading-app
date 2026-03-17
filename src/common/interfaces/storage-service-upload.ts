export interface StorageServiceUploadArg {
  path: string;
  file: Express.Multer.File;
}

export interface StorageServiceUploadResponse {
  filename: string;
  url: string;
}
