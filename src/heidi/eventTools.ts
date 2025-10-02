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


function extrapolateEvent(
  event: ProcessableEvents
): ExtrapolatedRecords | InextrapolatedEvents {
  if ("records" in event) return event.records as ExtrapolatedRecords;
  return event as InextrapolatedEvents;
}

export function deQueueEvent(
  event: ProcessableEvents
): (ProcessableEvents | ProcessableRecords)[] {
  const extrapolatedEvent = extrapolateEvent(event);
  if (extrapolatedEvent instanceof Array) return extrapolatedEvent;
  return [extrapolatedEvent];
}

export function matchEventToRoute<J, T>(
  event: unknown,
  config: $EventConfig<T>
): boolean {
  const testEvent = typia.createIs<J>();
  const isEvent = testEvent(event);
  if (!isEvent) return false;
  return matchEventToConfig(config, event as unknown as T);
}
