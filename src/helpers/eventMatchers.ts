import { APIGatewayEvent } from "aws-lambda";
import { $APIGatewayEventConfig } from "../types/eventConfigs";
import { MatcherError } from "./matcher";

export function apiGatewayEventMatcher(
  record: APIGatewayEvent,
  config: $APIGatewayEventConfig
): MatcherError {
  // Logic to check if the record matches the configuration
  const conditions: boolean[] = [];

  if (config.method) {
    if (record.httpMethod !== config.method) {
      return {
        match: false,
        error: `Expected method ${config.method}, but got ${record.httpMethod}`,
      };
    }
  }

  if (config.path) {
    if (record.path !== config.path) {
      return {
        match: false,
        error: `Expected path ${config.path}, but got ${record.path}`,
      };
    }
  }

  if (config.headers) {
    if (
      !Object.entries(config.headers).every(
        ([key, value]) => record.headers[key] === value
      )
    ) {
      return {
        match: false,
        error: `Headers do not match expected values`,
      };
    }
  }

  if (config.queryStringParameters) {
    if (
      Object.entries(config.queryStringParameters).every(
        ([key, value]) => record.queryStringParameters?.[key] === value
      )
    ) {
      return {
        match: false,
        error: `Query string parameters do not match expected values`,
      };
    }
  }

  if (config.body) {
    if (!record.body?.includes(config.body as string)) {
      return {
        match: false,
        error: `Body does not include expected value ${config.body}`,
      };
    }
  }

  return {
    match: true,
    error: undefined,
  };
}
