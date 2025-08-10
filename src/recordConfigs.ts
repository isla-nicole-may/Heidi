import {
  APIGatewayEvent,
  DynamoDBRecord,
  DynamoDBStreamEvent,
  S3Event,
  S3EventRecord,
  SQSEvent,
  SQSRecord,
} from "aws-lambda";
import { AttributeConstruction, ConstructedAttribute } from "./attributes";

/**
 * DynamoDB configuration for matching records.
 * This configuration is used to filter DynamoDB records based on various attributes.
 */
export type $DyanamoDBRecordConfig = {
  docType?: Array<string>;
  pKey?: Array<{ suffix?: string; prefix?: string; equals?: string }>;
  sKey?: Array<{ suffix?: string; prefix?: string; equals?: string }>;
  eventName?: Array<DynamoDBRecord["eventName"]>;
  eventSource?: Array<DynamoDBRecord["eventSource"]>;
  oldImageAttribute?: ConstructedAttribute | AttributeConstruction;
  newImageAttribute?: ConstructedAttribute | AttributeConstruction;
};

/**
 * APIGateway configuration for matching records.
 * This configuration is used to filter API Gateway records based on various attributes.
 */
export type $APIGatewayRecordConfig = {
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
};

/**
 * S3Object configuration for matching records.
 * This configuration is used to filter S3 object records based on various attributes.
 */
export type $S3ObjectRecordConfig = {
  bucket?: string;
  key?: string;
  eventName?: string;
  eventSource?: string;
  objectSize?: number;
  objectType?: string;
};

/**
 * SQS message configuration for matching records.
 * This configuration is used to filter SQS records based on various attributes.
 */
export type $SQSRecordConfig = {
  queueUrl?: string;
  messageAttributes?: Record<string, string>;
  messageBody?: string;
  eventSource?: string;
};

export type PassableRecordConfigs =
  | $DyanamoDBRecordConfig
  | $APIGatewayRecordConfig
  | $S3ObjectRecordConfig
  | $SQSRecordConfig;

export type HandleableEvents = 
  | DynamoDBRecord
  | SQSRecord
  | APIGatewayEvent
  | S3EventRecord;

// Find the appropriate config for a given event.
export type $MAP_CONFIG_TO_EVENT<T> = T extends DynamoDBStreamEvent
  ? $DyanamoDBRecordConfig
  : T extends SQSEvent
  ? $SQSRecordConfig
  : T extends APIGatewayEvent
  ? $APIGatewayRecordConfig
  : T extends S3Event
  ? $S3ObjectRecordConfig
  : never; // Extend later
