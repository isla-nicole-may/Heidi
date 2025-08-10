import { DynamoDBRecord } from "aws-lambda";
import { $DyanamoDBRecordConfig } from "./recordConfigs";

export type $MAP_CONFIG_TO_RECORD<T> = T extends $DyanamoDBRecordConfig
  ? DynamoDBRecord
  : never; // extend later

export type $MAP_RECORD_TO_CONFIG<T> = T extends DynamoDBRecord
  ? $DyanamoDBRecordConfig
  : never; // extend later

export interface HeidiMetadata {
  name: string;
  description: string;
  version: string;
}

export type RenameKeys<T, Mapping extends Record<string, string>> = {
  [K in keyof T as K extends keyof Mapping ? Mapping[K] : K]: T[K];
};
