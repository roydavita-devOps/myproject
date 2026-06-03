import { ReadStream } from 'fs';

export type StoredObject = {
  fileName: string;
  url: string;
};

export type ReadObject = {
  stream: ReadStream;
  contentType: string;
};

export type PutObjectInput = {
  tenantId: string;
  assetType: string;
  directory: string;
  fileName: string;
  buffer: Buffer;
};

export type ReadObjectInput = {
  tenantId: string;
  assetType: string;
  directory: string;
  fileName: string;
};

export type DeleteObjectInput = {
  tenantId: string;
  assetType: string;
  directory: string;
  fileName: string;
};

export interface UploadStorageAdapter {
  readonly driver: string;
  putObject(input: PutObjectInput): Promise<StoredObject>;
  readObject(input: ReadObjectInput): Promise<ReadObject>;
  deleteObject(input: DeleteObjectInput): Promise<void>;
  health(): Promise<Record<string, unknown>>;
}
