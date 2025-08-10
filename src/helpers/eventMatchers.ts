import { APIGatewayEvent } from "aws-lambda";
import { $APIGatewayEventConfig } from "../types/eventConfigs";

export function apiGatewayEventMatcher(
  record: APIGatewayEvent,
  config: $APIGatewayEventConfig
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
    conditions.push(record.body?.includes(config.body as string) ?? false);
  }

  return conditions.every(Boolean);
}
