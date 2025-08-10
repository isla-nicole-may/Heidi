import { APIGatewayEvent, S3Event, SNSEvent } from "aws-lambda";

/**
 * APIGateway configuration for matching records.
 * This configuration is used to filter API Gateway records based on various attributes.
 */

export const APIGatewayEventAttributes: {
  [key: string]: keyof APIGatewayEvent;
} = {
  ["HTTP_METHOD"]: "httpMethod",
  ["PATH"]: "path",
  ["HEADERS"]: "headers",
  ["QUERY_STRING_PARAMETERS"]: "queryStringParameters",
  ["BODY"]: "body",
  ["STAGE_VARIABLES"]: "stageVariables",
  ["REQUEST_CONTEXT"]: "requestContext",
  ["RESOURCE"]: "resource",
  ["MULTI_VALUE_HEADERS"]: "multiValueHeaders",
  ["MULTI_VALUE_QUERY_STRING_PARAMETERS"]: "multiValueQueryStringParameters",
  ["PATH_PARAMETERS"]: "pathParameters",
  ["IS_BASE64_ENCODED"]: "isBase64Encoded",
};

export type $APIGatewayEventConfig = {
  // base attributes that are matchable from the record type.
  [APIGatewayEventAttributes.HTTP_METHOD]?: string;
  [APIGatewayEventAttributes.PATH]?: string;
  [APIGatewayEventAttributes.HEADERS]?: Record<string, string>;
  [APIGatewayEventAttributes.QUERY_STRING_PARAMETERS]?: Record<
    string,
    string
  > | null;
  [APIGatewayEventAttributes.BODY]?: string | null;
  [APIGatewayEventAttributes.STAGE_VARIABLES]?: Record<string, string> | null;
  [APIGatewayEventAttributes.REQUEST_CONTEXT]?: Partial<
    APIGatewayEvent["requestContext"]
  > | null;
  [APIGatewayEventAttributes.RESOURCE]?: string;
  [APIGatewayEventAttributes.MULTI_VALUE_HEADERS]?: Record<
    string,
    string[]
  > | null;
  [APIGatewayEventAttributes.MULTI_VALUE_QUERY_STRING_PARAMETERS]?: Record<
    string,
    string[]
  > | null;
  [APIGatewayEventAttributes.PATH_PARAMETERS]?: Record<string, string> | null;
  [APIGatewayEventAttributes.IS_BASE64_ENCODED]?: boolean;
};

export type PassableEventConfigs = $APIGatewayEventConfig;
