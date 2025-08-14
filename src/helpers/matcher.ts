import {
  DynamoDBRecord,
  SQSRecord,
  S3EventRecord,
  SNSEventRecord,
  APIGatewayEvent,
} from "aws-lambda";
import { HandleableRecords, HandleableEvents } from "../types/handlable";
import {
  isDynamoDBRecord,
  isS3EventRecord,
  isSNSEventRecord,
  isSQSRecord,
} from "./recordIdentifiers";
import {
  dynamoDBRecordMatcher,
  s3RecordMatcher,
  snsRecordMatcher,
  sqsRecordMatcher,
} from "./recordMatchers";
import {
  isAPIGatewayEvent,
  isDynamoDBStreamEvent,
  isSQSEvent,
} from "./eventIdentifiers";
import { apiGatewayEventMatcher } from "./eventMatchers";
import {
  $DyanamoDBRecordConfig,
  $S3EventRecordConfig,
  $SNSEventRecordConfig,
  $SQSEventRecordConfig,
  PassableRecordConfigs,
} from "../types/recordConfigs";
import {
  $APIGatewayEventConfig,
  PassableEventConfigs,
} from "../types/eventConfigs";

export enum EventMatcherType {
  DynamoDB = "dynamoDBEventMatcher",
  SQS = "sqsEventMatcher",
  S3 = "s3EventMatcher",
  SNS = "snsEventMatcher",
  APIGateway = "apiGatewayEventMatcher",
}

export interface MatcherError {
  match: boolean;
  error: string | undefined;
}

export function matchRoute(
  event: HandleableEvents | HandleableRecords,
  routeConfig: PassableEventConfigs | PassableRecordConfigs
): EventMatcherType | RecordMatcherType | undefined {
  const eventMatch =
    matchEventToConfig(
      event as HandleableEvents,
      routeConfig as PassableEventConfigs
    ) ??
    matchRecordToConfig(
      event as HandleableRecords,
      routeConfig as PassableRecordConfigs
    );

  return eventMatch;
}

export function matchEventToConfig(
  event: HandleableEvents,
  routeConfig: PassableEventConfigs
): EventMatcherType | undefined {
  if (isAPIGatewayEvent(event))
    if (
      apiGatewayEventMatcher(
        event as APIGatewayEvent,
        routeConfig as $APIGatewayEventConfig // rename to event config
      )
    )
      return EventMatcherType.APIGateway;
    else return undefined;

  if (isDynamoDBStreamEvent(event)) return EventMatcherType.DynamoDB; // no matching can be performed on dynamoDBStreamEvent as it is a stream of records.

  if (isSQSEvent(event)) return EventMatcherType.SQS; // no matching can be performed on a stream of records.

  if (isS3EventRecord(event)) return EventMatcherType.S3; // no matching can be performed on a stream of records.

  if (isSNSEventRecord(event)) return EventMatcherType.SNS; // no matching can be performed on a stream of records.

  // Add more event type matchers here as needed
  return undefined;
}

export enum RecordMatcherType {
  DynamoDB = "dynamoDBRecordMatcher",
  SQS = "sqsRecordMatcher",
  S3 = "s3RecordMatcher",
  SNS = "snsRecordMatcher",
}

export function matchRecordToConfig(
  record: HandleableRecords,
  routeConfig: PassableRecordConfigs
): RecordMatcherType | undefined {
  if (isDynamoDBRecord(record))
    if (
      dynamoDBRecordMatcher(
        record as DynamoDBRecord,
        routeConfig as $DyanamoDBRecordConfig
      )
    )
      return RecordMatcherType.DynamoDB;
    else return undefined;

  if (isSQSRecord(record))
    if (
      sqsRecordMatcher(
        record as SQSRecord,
        routeConfig as $SQSEventRecordConfig
      )
    )
      return RecordMatcherType.SQS;
    else return undefined;

  if (isS3EventRecord(record))
    if (
      s3RecordMatcher(
        record as S3EventRecord,
        routeConfig as $S3EventRecordConfig
      )
    )
      return RecordMatcherType.S3;
    else return undefined;

  if (isSNSEventRecord(record))
    if (
      snsRecordMatcher(
        record as SNSEventRecord,
        routeConfig as $SNSEventRecordConfig
      )
    )
      return RecordMatcherType.SNS;
    else return undefined;

  // Add more record type matchers here as needed
  return undefined;
}
