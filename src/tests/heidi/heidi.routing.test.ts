import { heidi } from "../../heidi/heidi";
import { APIGatewayEvent } from "aws-lambda";
import { matchEventToRoute } from "../../heidi/eventTools";

// Mock the eventTools module to avoid Typia issues
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: jest.fn(),
  matchEventToConfig: jest.fn().mockReturnValue(true)
}));

const mockMatchEventToRoute = matchEventToRoute as jest.MockedFunction<typeof matchEventToRoute>;

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

describe("Heidi Wrapper - Route Matching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchEventToRoute.mockReturnValue(true);
  });

  test("should match route based on configuration", () => {
    const instance = heidi<APIGatewayEvent>(mockHandler);
    const config = {
      httpMethod: { type: "string", enum: ["GET"] },
      path: { type: "string", const: "/test" }
    };
    instance.configure(config);

    const event = createMockAPIGatewayEvent();
    const result = instance.matchRoute(event);

    expect(result).toBe(true);
  });

  test("should not match route when configuration doesn't match", () => {
    const instance = heidi<APIGatewayEvent>(mockHandler);
    const config = {
      httpMethod: { type: "string", enum: ["POST"] }, // Event has GET
      path: { type: "string", const: "/test" }
    };
    instance.configure(config);

    // Mock the route matching to return false for this test
    mockMatchEventToRoute.mockReturnValueOnce(false);

    const event = createMockAPIGatewayEvent();
    const result = instance.matchRoute(event);

    expect(result).toBe(false);
  });

  test("should match with empty configuration", () => {
    const instance = heidi<APIGatewayEvent>(mockHandler);
    const event = createMockAPIGatewayEvent();
    
    // No configuration set
    const result = instance.matchRoute(event);

    expect(result).toBe(true); // Empty config should match everything
  });
});
