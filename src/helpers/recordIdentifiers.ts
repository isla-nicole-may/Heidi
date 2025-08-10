import {
  DynamoDBRecord,
  S3EventRecord,
  SNSEventRecord,
  SQSRecord,
} from "aws-lambda";

export function isDynamoDBRecord(record: unknown) {
  const dynamoDBRecord_eventName: keyof DynamoDBRecord = "eventName";
  const dynamoDBRecord_eventSource: keyof DynamoDBRecord = "eventSource";
  const dynamoDBRecord_dynamodb: keyof DynamoDBRecord = "dynamodb";
  return (
    typeof record === "object" &&
    record !== null &&
    dynamoDBRecord_eventName in record &&
    dynamoDBRecord_eventSource in record &&
    dynamoDBRecord_dynamodb in record
  );
}

export function isSQSRecord(record: unknown) {
  const sqsRecord_eventSource: keyof SQSRecord = "eventSource";
  const sqsRecord_body: keyof SQSRecord = "body";
  return (
    typeof record === "object" &&
    record !== null &&
    sqsRecord_eventSource in record &&
    sqsRecord_body in record
  );
}

export function isS3EventRecord(record: unknown) {
  const s3Record_eventSource: keyof S3EventRecord = "eventSource";
  const s3Record_s3: keyof S3EventRecord = "s3";
  return (
    typeof record === "object" &&
    record !== null &&
    s3Record_eventSource in record &&
    s3Record_s3 in record
  );
}

export function isSNSEventRecord(record: unknown) {
  const snsRecord_eventSource: keyof SNSEventRecord = "EventSource";
  const snsRecord_arn: keyof SNSEventRecord = "EventSubscriptionArn";
  const snsRecord_sns: keyof SNSEventRecord = "Sns";
  return (
    typeof record === "object" &&
    record !== null &&
    snsRecord_eventSource in record &&
    snsRecord_arn in record &&
    snsRecord_sns in record
  );
}
