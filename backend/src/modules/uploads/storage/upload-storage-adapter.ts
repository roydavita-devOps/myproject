import { ReadStream } from 'fs';

export type StoredObject = {
  fileName: string;
  objectKey?: string;
  url: string;
};

export type ReadObject = {
  stream: ReadStream;
  contentType: string;
};

export type PutObjectInput = {
  tenantId: string;
  websiteId?: string | null;
  assetType: string;
  assetId?: string;
  directory: string;
  fileName: string;
  contentType: string;
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
  objectKey?: string;
};

export type ParsedStoredObject = {
  tenantId: string;
  assetType: string;
  fileName: string;
  objectKey?: string;
};

export interface UploadStorageAdapter {
  readonly driver: string;
  putObject(input: PutObjectInput): Promise<StoredObject>;
  readObject(input: ReadObjectInput): Promise<ReadObject>;
  deleteObject(input: DeleteObjectInput): Promise<void>;
  parseUrl?(url: string): ParsedStoredObject | null;
  health(): Promise<Record<string, unknown>>;
}
