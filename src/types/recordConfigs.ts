import {
  DynamoDBRecord,
  S3EventRecord,
  SNSEventRecord,
  SQSRecord,
} from "aws-lambda";
import { ConstructedAttribute, AttributeConstruction } from "../helpers/attributes";

/**
 * DynamoDB configuration for matching records.
 * This configuration is used to filter DynamoDB records based on various attributes.
 */

// define the attributes for DyanamoDBRecordConfig that are matchable
export const DynamoDBRecordAttributes: { [key: string]: keyof DynamoDBRecord } =
  {
    ["EVENT_VERSION"]: "eventVersion",
    ["AWS_REGION"]: "awsRegion",
    ["DYNAMODB"]: "dynamodb",
    ["EVENT_ID"]: "eventID",
    ["EVENT_NAME"]: "eventName",
    ["EVENT_SOURCE"]: "eventSource",
    ["EVENT_SOURCE_ARN"]: "eventSourceARN",
    ["USER_IDENTITY"]: "userIdentity",
  };

export type $DyanamoDBRecordConfig = {
  // custom attributes that we process for good UX
  docType?: Array<string>;
  pKey?: Array<{ suffix?: string; prefix?: string; equals?: string }>;
  sKey?: Array<{ suffix?: string; prefix?: string; equals?: string }>;
  oldImageAttribute?: ConstructedAttribute | AttributeConstruction;
  newImageAttribute?: ConstructedAttribute | AttributeConstruction;

  // base attributes that are matchable from the record type.
  [DynamoDBRecordAttributes.EVENT_NAME]?: Array<DynamoDBRecord["eventName"]>;
  [DynamoDBRecordAttributes.EVENT_SOURCE]?: Array<
    DynamoDBRecord["eventSource"]
  >;
  [DynamoDBRecordAttributes.EVENT_VERSION]?: string;
  [DynamoDBRecordAttributes.AWS_REGION]?: string;
  [DynamoDBRecordAttributes.EVENT_ID]?: string;
  [DynamoDBRecordAttributes.EVENT_SOURCE_ARN]?: string;
  [DynamoDBRecordAttributes.USER_IDENTITY]?: Partial<
    DynamoDBRecord["userIdentity"]
  >;
  [DynamoDBRecordAttributes.DYNAMODB]?: Partial<DynamoDBRecord["dynamodb"]>;
};


/**
 * S3Object configuration for matching records.
 * This configuration is used to filter S3 object records based on various attributes.
 */

// define the attributes for S3ObjectRecordConfig that are matchable
export const S3EventRecordAttributes: { [key: string]: keyof S3EventRecord } = {
  // base attributes that are matchable from the record type.
  ["S3"]: "s3",
  ["AWS_REGION"]: "awsRegion",
  ["USER_ID"]: "userIdentity",
  ["REQUEST_PARAM"]: "requestParameters",
  ["EVENT_NAME"]: "eventName",
  ["EVENT_TIME"]: "eventTime",
  ["EVENT_SOURCE"]: "eventSource",
};

// define the S3ObjectRecordConfig type
export type $S3EventRecordConfig = {
  // base attributes that are matchable from the record type.
  [S3EventRecordAttributes.S3]?: Partial<S3EventRecord["s3"]>;
  [S3EventRecordAttributes.AWS_REGION]?: string;
  [S3EventRecordAttributes.USER_ID]?: Partial<S3EventRecord["userIdentity"]>;
  [S3EventRecordAttributes.REQUEST_PARAM]?: Partial<
    S3EventRecord["requestParameters"]
  >;
  [S3EventRecordAttributes.EVENT_NAME]?: string;
  [S3EventRecordAttributes.EVENT_TIME]?: string;
  [S3EventRecordAttributes.EVENT_SOURCE]?: string;
};

/**
 * SQS message configuration for matching records.
 * This configuration is used to filter SQS records based on various attributes.
 */

// define the attributes for SQSRecordConfig that are matchable
export const SQSEventRecordAttributes: { [key: string]: keyof SQSRecord } = {
  // base attributes that are matchable from the record type.
  ["MESSAGE_ID"]: "messageId",
  ["RECEIPT_HANDLE"]: "receiptHandle",
  ["BODY"]: "body",
  ["ATTRIBUTES"]: "attributes",
  ["MESSAGE_ATTRIBUTES"]: "messageAttributes",
  ["MD5_OF_BODY"]: "md5OfBody",
  ["MD5_OF_MESSAGE_ATTRIBUTES"]: "md5OfMessageAttributes",
  ["EVENT_SOURCE"]: "eventSource",
  ["EVENT_SOURCE_ARN"]: "eventSourceARN",
  ["AWS_REGION"]: "awsRegion",
};

// define the SQSRecordConfig type
export type $SQSEventRecordConfig = {
  [SQSEventRecordAttributes.MESSAGE_ID]?: string;
  [SQSEventRecordAttributes.RECEIPT_HANDLE]?: string;
  [SQSEventRecordAttributes.BODY]?: string;
  [SQSEventRecordAttributes.ATTRIBUTES]?: Partial<SQSRecord["attributes"]>;
  [SQSEventRecordAttributes.MESSAGE_ATTRIBUTES]?: Partial<
    SQSRecord["messageAttributes"]
  >;
  [SQSEventRecordAttributes.MD5_OF_BODY]?: string;
  [SQSEventRecordAttributes.MD5_OF_MESSAGE_ATTRIBUTES]?: string;
  [SQSEventRecordAttributes.EVENT_SOURCE]?: string;
  [SQSEventRecordAttributes.EVENT_SOURCE_ARN]?: string;
  [SQSEventRecordAttributes.AWS_REGION]?: string;
};

/**
 * SNS event configuration for matching records.
 */

// define the attributes for SNSEventRecordConfig that are matchable
export const SNSEventRecordAttributes: { [key: string]: keyof SNSEventRecord } =
  {
    // base attributes that are matchable from the record type.
    ["EVENT_VERSION"]: "EventVersion",
    ["EVENT_SUBSCRIPTION_ARN"]: "EventSubscriptionArn",
    ["EVENT_SOURCE"]: "EventSource",
    ["SNS"]: "Sns",
  };

// define the SNSEventRecordConfig type
export type $SNSEventRecordConfig = {
  [SNSEventRecordAttributes.EVENT_VERSION]?: string;
  [SNSEventRecordAttributes.EVENT_SUBSCRIPTION_ARN]?: string;
  [SNSEventRecordAttributes.EVENT_SOURCE]?: string;
  [SNSEventRecordAttributes.SNS]?: Partial<SNSEventRecord["Sns"]>;
};

// Generic type for passable record configurations
export type PassableRecordConfigs =
  | $DyanamoDBRecordConfig
  | $S3EventRecordConfig
  | $SQSEventRecordConfig
  | $SNSEventRecordConfig;
