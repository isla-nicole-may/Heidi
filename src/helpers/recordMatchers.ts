import {
  SQSRecord,
  DynamoDBRecord,
  S3EventRecord,
  SNSEventRecord,
} from "aws-lambda";
import {
  $DyanamoDBRecordConfig,
  $S3EventRecordConfig,
  $SNSEventRecordConfig,
  $SQSEventRecordConfig,
} from "../types/recordConfigs";

export function s3RecordMatcher(
  record: S3EventRecord,
  config: $S3EventRecordConfig
): boolean {
  // Logic to check if the record matches the configuration
  const conditions: boolean[] = [];

  if (config.bucket) {
    conditions.push(record.s3.bucket.name === config.bucket);
  }

  if (config.key) {
    conditions.push(record.s3.object.key === config.key);
  }

  if (config.eventName) {
    conditions.push(record.eventName === config.eventName);
  }

  if (config.eventSource) {
    conditions.push(record.eventSource === config.eventSource);
  }

  return conditions.every(Boolean);
}

export function sqsRecordMatcher(
  record: SQSRecord,
  config: $SQSEventRecordConfig
): boolean {
  // Logic to check if the record matches the configuration
  const conditions: boolean[] = [];

  if (config.queueUrl) {
    conditions.push(record.eventSource === config.queueUrl);
  }

  if (config.messageAttributes) {
    conditions.push(
      Object.entries(config.messageAttributes).every(
        ([key, value]) => record.messageAttributes[key]?.stringValue === value
      )
    );
  }

  if (config.messageBody) {
    conditions.push(record.body.includes(config.messageBody as string));
  }

  if (config.eventSource) {
    conditions.push(record.eventSource === config.eventSource);
  }

  return conditions.every(Boolean);
}

export function dynamoDBRecordMatcher(
  record: DynamoDBRecord,
  config: $DyanamoDBRecordConfig
): boolean {
  const newImage = record.dynamodb?.NewImage;
  const oldImage = record.dynamodb?.OldImage;
  const image = newImage || oldImage;
  if (!image) throw new Error("No image found in record");
  // Logic to check if the record matches the configuration

  const conditions: boolean[] = [];

  if (config.pKey) {
    conditions.push(
      config.pKey.some(
        (p) =>
          (p.prefix
            ? record.dynamodb?.Keys?.partitionKey?.S?.startsWith(p.prefix)
            : true) &&
          (p.suffix
            ? record.dynamodb?.Keys?.partitionKey?.S?.endsWith(p.suffix)
            : true) &&
          (p.equals
            ? record.dynamodb?.Keys?.partitionKey?.S?.endsWith(p.equals)
            : true)
      )
    );
  }

  if (config.sKey) {
    conditions.push(
      config.sKey.some(
        (s) =>
          (s.prefix
            ? record.dynamodb?.Keys?.partitionKey?.S?.startsWith(s.prefix)
            : true) &&
          (s.suffix
            ? record.dynamodb?.Keys?.partitionKey?.S?.endsWith(s.suffix)
            : true) &&
          (s.equals
            ? record.dynamodb?.Keys?.partitionKey?.S?.endsWith(s.equals)
            : true)
      )
    );
  }

  if (config.eventName) {
    conditions.push(
      (config.eventName as string[]).includes(record.eventName ?? "")
    );
  }

  if (config.docType) {
    conditions.push(config.docType.includes(image.docType.S || ""));
  }

  if (config.newImageAttribute) {
    const newImageAttr = config.newImageAttribute as any;
    conditions.push(
      Object.entries(newImageAttr).every(
        ([key, value]) => image[key]?.S === value
      )
    );
  }

  if (config.oldImageAttribute) {
    const newImageAttr = config.oldImageAttribute as any;
    conditions.push(
      Object.entries(newImageAttr).every(
        ([key, value]) => image[key]?.S === value
      )
    );
  }

  if (config.eventSource) {
    conditions.push(
      (config.eventSource as string[]).includes(record.eventSource ?? "")
    );
  }

  // return true if all conditions are met.
  if (conditions.every(Boolean)) {
    return true;
  }
  return false;
}

export function snsRecordMatcher(
  record: SNSEventRecord,
  config: $SNSEventRecordConfig
): boolean {
  // Logic to check if the record matches the configuration
  const conditions: boolean[] = [];

  if (config.eventSource) {
    conditions.push(record.EventSource === config.eventSource);
  }

  if (config.topicArn) {
    conditions.push(record.Sns.TopicArn === config.topicArn);
  }

  return conditions.every(Boolean);
}
