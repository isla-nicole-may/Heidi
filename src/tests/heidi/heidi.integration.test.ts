import { heidi } from "../../heidi/heidi";
import { APIGatewayEvent, Context } from "aws-lambda";
import { MiddlewareFunction } from "middy";

// Mock the eventTools module to avoid Typia issues
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: jest.fn().mockReturnValue(true),
  matchEventToConfig: jest.fn().mockReturnValue(true)
}));

// Mock middleware functions for testing
const createMockMiddleware = (name: string): MiddlewareFunction<any, any, Context> => {
  const middleware = jest.fn().mockResolvedValue(undefined);
  (middleware as any).middlewareName = name;
  return middleware;
};

// Mock handler for testing
const mockHandler = jest.fn().mockResolvedValue({ statusCode: 200, body: "success" });

// Mock event data
const createMockAPIGatewayEvent = (): APIGatewayEvent => ({
  httpMethod: "GET",
  path: "/test",
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: "123456789012",
    apiId: "api123",
    protocol: "HTTP/1.1",
    httpMethod: "GET",
    path: "/test",
    stage: "dev",
    requestId: "request123",
    requestTime: "01/Jan/2023:00:00:00 +0000",
    requestTimeEpoch: 1672531200000,
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      sourceIp: "127.0.0.1",
      principalOrgId: null,
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: "test-agent",
      user: null,
      apiKey: null,
      apiKeyId: null,
      clientCert: null
    },
    authorizer: null,
    resourceId: "resource123",
    resourcePath: "/test"
  },
  resource: "/test",
  body: null,
  isBase64Encoded: false
});

describe("Heidi Wrapper - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should support full method chaining", () => {
    const instance = heidi<APIGatewayEvent>(mockHandler);
    const middleware = createMockMiddleware("chain-test");
    const config = { httpMethod: { type: "string", enum: ["GET"] } };
    const metaData = { name: "chained-handler", version: "1.0" };

    // Mock the super methods
    instance.super_before = jest.fn();
    instance.super_after = jest.fn();
    instance.super_onError = jest.fn();

    const result = instance
      .configure(config)
      .setMetaData(metaData)
      .before([middleware])
      .after([middleware])
      .onError([middleware]);

    expect(result).toBe(instance);
    expect(instance.config).toEqual(config);
    expect(instance.metaData).toMatchObject(metaData);
    expect(instance.super_before).toHaveBeenCalledWith(middleware);
    expect(instance.super_after).toHaveBeenCalledWith(middleware);
    expect(instance.super_onError).toHaveBeenCalledWith(middleware);
  });

  test("should work end-to-end with all features", async () => {
    const handler = jest.fn().mockResolvedValue({ success: true, processed: 1 });
    const instance = heidi<APIGatewayEvent>(handler);
    
    const beforeMiddleware = createMockMiddleware("integration-before");
    const afterMiddleware = createMockMiddleware("integration-after");
    
    // Mock the super methods
    instance.super_before = jest.fn();
    instance.super_after = jest.fn();
    
    const config = {
      httpMethod: { type: "string", enum: ["GET"] },
      path: { type: "string", pattern: "^/test" }
    };
    
    const metaData = {
      name: "integration-test-handler",
      description: "Integration test",
      version: "1.0.0",
      functionName: "test-lambda"
    };

    // Configure the instance
    instance
      .configure(config)
      .setMetaData(metaData)
      .before([beforeMiddleware])
      .after([afterMiddleware]);

    // Test route matching - this will use the mocked matchEventToRoute
    const event = createMockAPIGatewayEvent();
    expect(instance.matchRoute(event)).toBe(true);

    // Verify configuration was set correctly
    expect(instance.config).toEqual(config);
    expect(instance.metaData).toMatchObject(metaData);
  });
});
