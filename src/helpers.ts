import {
  APIGatewayEvent,
  DynamoDBRecord,
  S3Event,
  SQSRecord,
} from "aws-lambda";
import {
  $APIGatewayRecordConfig,
  $DyanamoDBRecordConfig,
  $S3ObjectRecordConfig,
  $SQSRecordConfig,
  HandleableEvents,
  PassableRecordConfigs,
} from "./recordConfigs";

export interface HeidiMatcher {
  identifier: (record) => boolean;
  matcher: (record, config) => boolean;
}

export function matchRecordToConfig(
  record: HandleableEvents,
  routeConfig: PassableRecordConfigs,
  customMatchers?: Array<HeidiMatcher>
) {
  if (isDynamoDBRecord(record))
    return dynamoDBMatcher(
      record as DynamoDBRecord,
      routeConfig as $DyanamoDBRecordConfig
    );

  if (isSQSRecord(record))
    return sqsMatcher(record as SQSRecord, routeConfig as $SQSRecordConfig);

  if (isAPIGatewayRecord(record))
    return apiGatewayMatcher(
      record as APIGatewayEvent,
      routeConfig as $APIGatewayRecordConfig
    );

  if (isS3ObjectRecord(record))
    return s3ObjectMatcher(
      record as S3Event,
      routeConfig as $S3ObjectRecordConfig
    );

  for (const matcher of customMatchers || []) {
    if (matcher.identifier(record)) {
      return matcher.matcher(record, routeConfig);
    }
  }

  // Add more record type matchers here as needed
  throw new Error("Unsupported record type");
}

function isDynamoDBRecord(record: unknown) {
  return (
    typeof record === "object" &&
    record !== null &&
    "eventName" in record &&
    "eventSource" in record &&
    "dynamodb" in record &&
    typeof (record as DynamoDBRecord).eventName === "string" &&
    typeof (record as DynamoDBRecord).eventSource === "string"
  );
}

function isSQSRecord(record: unknown) {
  return (
    typeof record === "object" &&
    record !== null &&
    "eventSource" in record &&
    "body" in record &&
    typeof (record as any).eventSource === "string" &&
    typeof (record as any).body === "string"
  );
}

function isAPIGatewayRecord(record: unknown) {
  return (
    typeof record === "object" &&
    record !== null &&
    "httpMethod" in record &&
    "path" in record &&
    typeof (record as any).httpMethod === "string" &&
    typeof (record as any).path === "string"
  );
}

function isS3ObjectRecord(record: unknown) {
  return (
    typeof record === "object" &&
    record !== null &&
    "eventSource" in record &&
    "s3" in record &&
    typeof (record as any).eventSource === "string" &&
    typeof (record as any).s3 === "object"
  );
}

function s3ObjectMatcher(
  record: S3Event,
  config: $S3ObjectRecordConfig
): boolean {
  // Logic to check if the record matches the configuration
  const conditions: boolean[] = [];

  if (config.bucket) {
    conditions.push(record.Records[0].s3.bucket.name === config.bucket);
  }

  if (config.key) {
    conditions.push(record.Records[0].s3.object.key === config.key);
  }

  if (config.eventName) {
    conditions.push(record.Records[0].eventName === config.eventName);
  }

  if (config.eventSource) {
    conditions.push(record.Records[0].eventSource === config.eventSource);
  }

  return conditions.every(Boolean);
}

function apiGatewayMatcher(
  record: APIGatewayEvent,
  config: $APIGatewayRecordConfig
): boolean {
  // Logic to check if the record matches the configuration
  const conditions: boolean[] = [];

  if (config.method) {
    conditions.push(record.httpMethod === config.method);
  }

  if (config.path) {
    conditions.push(record.path === config.path);
  }

  if (config.headers) {
    conditions.push(
      Object.entries(config.headers).every(
        ([key, value]) => record.headers[key] === value
      )
    );
  }

  if (config.queryStringParameters) {
    conditions.push(
      Object.entries(config.queryStringParameters).every(
        ([key, value]) => record.queryStringParameters?.[key] === value
      )
    );
  }

  if (config.body) {
    conditions.push(record.body?.includes(config.body) ?? false);
  }

  return conditions.every(Boolean);
}

function sqsMatcher(record: SQSRecord, config: $SQSRecordConfig): boolean {
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
    conditions.push(record.body.includes(config.messageBody));
  }

  if (config.eventSource) {
    conditions.push(record.eventSource === config.eventSource);
  }

  return conditions.every(Boolean);
}

function dynamoDBMatcher(
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
          (p.prefix ? image.partitionKey.S?.startsWith(p.prefix) : true) &&
          (p.suffix ? image.partitionKey.S?.endsWith(p.suffix) : true) &&
          (p.equals ? image.partitionKey.S?.endsWith(p.equals) : true)
      )
    );
  }

  if (config.sKey) {
    conditions.push(
      config.sKey.some(
        (s) =>
          (s.prefix ? image.partitionKey.S?.startsWith(s.prefix) : true) &&
          (s.suffix ? image.partitionKey.S?.endsWith(s.suffix) : true) &&
          (s.equals ? image.partitionKey.S?.endsWith(s.equals) : true)
      )
    );
  }

  if (config.eventName) {
    conditions.push(config.eventName.includes(record.eventName));
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
    conditions.push(config.eventSource.includes(record.eventSource));
  }

  // return true if all conditions are met.
  if (conditions.every(Boolean)) {
    return true;
  }
  return false;
}
