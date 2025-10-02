import {
  APIGatewayEvent,
  DynamoDBStreamEvent,
  S3Event,
  SNSEvent,
  SQSEvent,
  EventBridgeEvent,
  CloudFrontEvent,
} from "aws-lambda";
import {
  DynamoDBRecord,
  S3EventRecord,
  SNSEventRecord,
  SQSRecord,
} from "aws-lambda";
import typia from "typia";

import Ajv, { JSONSchemaType } from "ajv";

export type RenameKeys<T, Mapping extends Record<string, string>> = {
  [K in keyof T as K extends keyof Mapping ? Mapping[K] : K]: T[K];
};

type Keys<T> = keyof T extends string ? keyof T : never;
type $GeneriEventConfigAJVSchemaType<T> = JSONSchemaType<T>;
type $GenericAllowedKeys<T> = Keys<T> extends string ? Keys<T> : never;

export type $EventConfigFull<T> = {
  [key in $GenericAllowedKeys<T>]: any;
};

export type $EventConfig<T> = Partial<$EventConfigFull<T>>;

export function matchEventToConfig<T>(
  config: $EventConfig<T>,
  event: T
): boolean {
  const ajv = new Ajv();
  const schema = generateEventConfigSchema(config);
  const validate = ajv.compile(schema);
  const valid = validate(event);
  return valid as boolean;
}

function generateEventConfigSchema<T>(
  config: $EventConfig<T>
): $GeneriEventConfigAJVSchemaType<T> {
  const schema: $GeneriEventConfigAJVSchemaType<T> = {
    type: "object",
    properties: config,
    required: Object.keys(config),
    additionalProperties: true,
  };
  return schema;
}

export type ProcessableEvents =
  | APIGatewayEvent
  | DynamoDBStreamEvent
  | EventBridgeEvent<any, any>
  | S3Event
  | SNSEvent
  | SQSEvent
  | CloudFrontEvent;

export type ProcessableRecords =
  | DynamoDBRecord
  | S3EventRecord
  | SNSEventRecord
  | SQSRecord;

type ExtrapolatedRecords =
  | DynamoDBRecord[]
  | S3EventRecord[]
  | SNSEventRecord[]
  | SQSRecord[];
type InextrapolatedEvents =
  | APIGatewayEvent
  | EventBridgeEvent<any, any>
  | CloudFrontEvent;

const isDynamoDBRecord = typia.createIs<DynamoDBRecord>();
const isS3EventRecord = typia.createIs<S3EventRecord>();
const isSNSEventRecord = typia.createIs<SNSEventRecord>();
const isSQSRecord = typia.createIs<SQSRecord>();

const isApiGatewayEvent = typia.createIs<APIGatewayEvent>();
const isDynamoDBStreamEvent = typia.createIs<DynamoDBStreamEvent>();
const isS3Event = typia.createIs<S3Event>();
const isSNSEvent = typia.createIs<SNSEvent>();
const isSQSEvent = typia.createIs<SQSEvent>();
const isEventBridgeEvent = typia.createIs<EventBridgeEvent<any, any>>();
const isCloudFrontEvent = typia.createIs<CloudFrontEvent>();

export function identifyEvent(event: unknown): string {
  if (isApiGatewayEvent(event)) return "APIGatewayEvent";
  if (isDynamoDBStreamEvent(event)) return "DynamoDBStreamEvent";
  if (isS3Event(event)) return "S3Event";
  if (isSNSEvent(event)) return "SNSEvent";
  if (isSQSEvent(event)) return "SQSEvent";
  if (isEventBridgeEvent(event)) return "EventBridgeEvent";
  if (isCloudFrontEvent(event)) return "CloudFrontEvent";
  return "UnknownEvent";
}

export function identifyRecord(record: unknown): string {
  if (isDynamoDBRecord(record)) return "DynamoDBRecord";
  if (isS3EventRecord(record)) return "S3EventRecord";
  if (isSNSEventRecord(record)) return "SNSEventRecord";
  if (isSQSRecord(record)) return "SQSRecord";
  return "UnknownRecord";
}

export function extrapolateEvent(
  event: ProcessableEvents
): ExtrapolatedRecords | InextrapolatedEvents {
  if (isApiGatewayEvent(event)) return event as APIGatewayEvent;
  if (isDynamoDBStreamEvent(event)) return event.Records as DynamoDBRecord[];
  if (isS3Event(event)) return event.Records as S3EventRecord[];
  if (isSNSEvent(event)) return event.Records as SNSEventRecord[];
  if (isSQSEvent(event)) return event.Records as SQSRecord[];
  if (isEventBridgeEvent(event)) return event as EventBridgeEvent<any, any>;
  if (isCloudFrontEvent(event)) return event as CloudFrontEvent;
  throw new Error("Unknown event type");
}

export function deQueueEvent(
  event: ProcessableEvents
): (ProcessableEvents | ProcessableRecords)[] {
  const extrapolatedEvent = extrapolateEvent(event);
  if (extrapolatedEvent instanceof Array) return extrapolatedEvent;
  return [extrapolatedEvent];
}

export function matchEvent(event: unknown) {
  const eventType = identifyEvent(event);
  const extrapolatedEvent = extrapolateEvent(event as ProcessableEvents);
  if (extrapolateEvent instanceof Array) {
    const recordTypes = (extrapolatedEvent as ExtrapolatedRecords).map(
      (record) => identifyRecord(record)
    );
    return { eventType, recordTypes };
  }
  return { eventType, recordTypes: [] };
}

export function matchEventToRoute<J, T>(
  event: J,
  config: $EventConfig<T>
): boolean {
  const { eventType, recordTypes } = matchEvent(event);
  if (eventType === typeof event)
    return matchEventToConfig(config, event as unknown as T);
  return false;
}
