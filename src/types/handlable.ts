import {
  DynamoDBStreamEvent,
  SQSEvent,
  APIGatewayEvent,
  S3Event,
  SNSEvent,
  DynamoDBRecord,
  SQSRecord,
  S3EventRecord,
  SNSEventRecord,
} from "aws-lambda";
import {
  $DyanamoDBRecordConfig,
  $S3EventRecordConfig,
  $SNSEventRecordConfig,
  $SQSEventRecordConfig,
} from "./recordConfigs";
import { $APIGatewayEventConfig } from "./eventConfigs";

export type HandleableEvents =
  | DynamoDBStreamEvent
  | SQSEvent
  | APIGatewayEvent
  | S3Event
  | SNSEvent;

export type HandleableRecords =
  | DynamoDBRecord
  | SQSRecord
  | S3EventRecord
  | SNSEventRecord;

export type HandableInvocations = HandleableEvents | HandleableRecords;

// Find the appropriate config for a given event.
export type $MAP_CONFIG_TO_RECORD<T> = T extends DynamoDBRecord
  ? $DyanamoDBRecordConfig
  : T extends SQSRecord
  ? $SQSEventRecordConfig
  : T extends APIGatewayEvent
  ? $APIGatewayEventConfig
  : T extends S3EventRecord
  ? $S3EventRecordConfig
  : T extends SNSEventRecord
  ? $SNSEventRecordConfig
  : never; // Extend later
