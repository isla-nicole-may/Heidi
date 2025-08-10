import {
  APIGatewayEvent,
  DynamoDBStreamEvent,
  S3Event,
  SNSEvent,
  SQSEvent,
} from "aws-lambda";
import {
  isDynamoDBRecord,
  isS3EventRecord,
  isSNSEventRecord,
  isSQSRecord,
} from "./recordIdentifiers";

export function isAPIGatewayEvent(event: unknown) {
  const apiGatewayEvent_httpMethod: keyof APIGatewayEvent = "httpMethod";
  const apiGatewayEvent_path: keyof APIGatewayEvent = "path";
  return (
    typeof event === "object" &&
    event !== null &&
    apiGatewayEvent_httpMethod in event &&
    apiGatewayEvent_path in event &&
    typeof (event as any).httpMethod === "string" &&
    typeof (event as any).path === "string"
  );
}

export function isS3Event(event: unknown) {
  const apiGatewayEvent_records: keyof S3Event = "Records";
  const holdsRecords =
    typeof event === "object" &&
    event !== null &&
    apiGatewayEvent_records in event;

  if (!holdsRecords) return false;

  const hasRecords = (event as S3Event).Records?.length > 0;

  if (!hasRecords) return false;

  const recordIsS3Record = isS3EventRecord((event as S3Event).Records[0]);

  return recordIsS3Record;
}

export function isDynamoDBStreamEvent(event: unknown) {
  const apiGatewayEvent_records: keyof DynamoDBStreamEvent = "Records";
  const holdsRecords =
    typeof event === "object" &&
    event !== null &&
    apiGatewayEvent_records in event;

  if (!holdsRecords) return false;

  const hasRecords = (event as S3Event).Records?.length > 0;

  if (!hasRecords) return false;

  const recordIsDynamoDBRecord = isDynamoDBRecord(
    (event as DynamoDBStreamEvent).Records[0]
  );

  return recordIsDynamoDBRecord;
}

export function isSQSEvent(event: unknown) {
  const apiGatewayEvent_records: keyof SQSEvent = "Records";
  const holdsRecords =
    typeof event === "object" &&
    event !== null &&
    apiGatewayEvent_records in event;

  if (!holdsRecords) return false;

  const hasRecords = (event as S3Event).Records?.length > 0;

  if (!hasRecords) return false;

  const recordIsSQSRecord = isSQSRecord((event as SQSEvent).Records[0]);

  return recordIsSQSRecord;
}

export function isSNSEvent(event: unknown) {
  const apiGatewayEvent_records: keyof SNSEvent = "Records";
  const holdsRecords =
    typeof event === "object" &&
    event !== null &&
    apiGatewayEvent_records in event;

  if (!holdsRecords) return false;

  const hasRecords = (event as S3Event).Records?.length > 0;

  if (!hasRecords) return false;

  const recordIsSNSRecord = isSNSEventRecord((event as SNSEvent).Records[0]);

  return recordIsSNSRecord;
}
