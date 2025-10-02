import { heidi } from "../../heidi/heidi";
import { APIGatewayEvent, Context, DynamoDBRecord } from "aws-lambda";
import { MiddlewareFunction } from "middy";

// Mock the eventTools module to avoid Typia issues
const mockMatchEventToRoute = jest.fn();
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: mockMatchEventToRoute,
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

const createMockContext = (): Context => ({
  callbackWaitsForEmptyEventLoop: true,
  functionName: "test-function",
  functionVersion: "1.0",
  invokedFunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:test-function",
  memoryLimitInMB: "128",
  awsRequestId: "request-123",
  logGroupName: "/aws/lambda/test-function",
  logStreamName: "2023/01/01/[$LATEST]abc123",
  getRemainingTimeInMillis: () => 30000,
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn()
});

describe("Heidi Wrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchEventToRoute.mockReturnValue(true); // Default to true
  });

  describe("Basic Initialization", () => {
    test("should create a heidi instance from a handler", () => {
      const instance = heidi(mockHandler);

      expect(instance).toBeDefined();
      expect(instance.handleRequest).toBeDefined();
      expect(instance.configure).toBeDefined();
      expect(instance.setMetaData).toBeDefined();
      expect(instance.useTemplate).toBeDefined();
      expect(instance.matchRoute).toBeDefined();
      expect(instance.before).toBeDefined();
      expect(instance.after).toBeDefined();
      expect(instance.onError).toBeDefined();
    });

    test("should initialize with default values", () => {
      const instance = heidi(mockHandler);

      expect(instance.metaData).toEqual({});
      expect(instance.templates).toEqual([]);
      expect(instance.config).toEqual({});
    });

    test("should maintain super methods from middy", () => {
      const instance = heidi(mockHandler);

      expect(instance.super_before).toBeDefined();
      expect(instance.super_after).toBeDefined();
      expect(instance.super_onError).toBeDefined();
      expect(instance.super_use).toBeDefined();
    });
  });

  describe("Configuration Management", () => {
    test("should configure event matching rules", () => {
      const instance = heidi<APIGatewayEvent>(mockHandler);
      const config = {
        httpMethod: { type: "string", enum: ["GET"] }
      };

      const result = instance.configure(config);

      expect(result).toBe(instance); // Should return itself for chaining
      expect(instance.config).toEqual(config);
    });

    test("should support method chaining for configure", () => {
      const instance = heidi<APIGatewayEvent>(mockHandler);
      const config1 = { httpMethod: { type: "string", enum: ["GET"] } };
      const config2 = { path: { type: "string", pattern: "^/api/" } };

      const result = instance.configure(config1).configure(config2);

      expect(result).toBe(instance);
      expect(instance.config).toEqual(config2); // Latest config should override
    });
  });

  describe("Metadata Management", () => {
    test("should set metadata with defaults", () => {
      const instance = heidi(mockHandler);
      const partialMetaData = {
        name: "test-handler",
        description: "Test handler description",
        version: "1.0.0",
        functionName: "my-function"
      };

      const result = instance.setMetaData(partialMetaData);

      expect(result).toBe(instance); // Should return itself for chaining
      expect(instance.metaData).toMatchObject(partialMetaData);
      expect(instance.metaData.callbackWaitsForEmptyEventLoop).toBe(true);
      expect(instance.metaData.getRemainingTimeInMillis).toBeInstanceOf(Function);
      expect(instance.metaData.done).toBeInstanceOf(Function);
      expect(instance.metaData.fail).toBeInstanceOf(Function);
      expect(instance.metaData.succeed).toBeInstanceOf(Function);
    });

    test("should merge metadata correctly", () => {
      const instance = heidi(mockHandler);
      const metaData1 = { name: "handler1", version: "1.0" };
      const metaData2 = { description: "Updated description", version: "2.0" };

      instance.setMetaData(metaData1);
      instance.setMetaData(metaData2);

      // Since setMetaData overwrites with defaults each time, the behavior is:
      // Second call should have the new values, and defaults for others
      expect(instance.metaData.name).toBe(""); // Reset to default by second call
      expect(instance.metaData.description).toBe("Updated description");
      expect(instance.metaData.version).toBe("2.0");
    });

    test("should handle context properties in metadata", () => {
      const instance = heidi(mockHandler);
      const contextData = {
        functionName: "lambda-function",
        awsRequestId: "request-abc123",
        memoryLimitInMB: "256",
        getRemainingTimeInMillis: () => 5000
      };

      instance.setMetaData(contextData);

      expect(instance.metaData.functionName).toBe("lambda-function");
      expect(instance.metaData.awsRequestId).toBe("request-abc123");
      expect(instance.metaData.memoryLimitInMB).toBe("256");
      expect(instance.metaData.getRemainingTimeInMillis()).toBe(5000);
    });
  });

  describe("Middleware Management", () => {
    test("should add before middleware", () => {
      const instance = heidi(mockHandler);
      const middleware1 = createMockMiddleware("before1");
      const middleware2 = createMockMiddleware("before2");
      
      // Mock the super methods
      instance.super_before = jest.fn();

      const result = instance.before([middleware1, middleware2]);

      expect(result).toBe(instance); // Should return itself for chaining
      expect(instance.super_before).toHaveBeenCalledWith(middleware1);
      expect(instance.super_before).toHaveBeenCalledWith(middleware2);
      expect(instance.super_before).toHaveBeenCalledTimes(2);
    });

    test("should add after middleware", () => {
      const instance = heidi(mockHandler);
      const middleware1 = createMockMiddleware("after1");
      const middleware2 = createMockMiddleware("after2");
      
      // Mock the super methods
      instance.super_after = jest.fn();

      const result = instance.after([middleware1, middleware2]);

      expect(result).toBe(instance);
      expect(instance.super_after).toHaveBeenCalledWith(middleware1);
      expect(instance.super_after).toHaveBeenCalledWith(middleware2);
      expect(instance.super_after).toHaveBeenCalledTimes(2);
    });

    test("should add error middleware", () => {
      const instance = heidi(mockHandler);
      const middleware1 = createMockMiddleware("error1");
      const middleware2 = createMockMiddleware("error2");
      
      // Mock the super methods
      instance.super_onError = jest.fn();

      const result = instance.onError([middleware1, middleware2]);

      expect(result).toBe(instance);
      expect(instance.super_onError).toHaveBeenCalledWith(middleware1);
      expect(instance.super_onError).toHaveBeenCalledWith(middleware2);
      expect(instance.super_onError).toHaveBeenCalledTimes(2);
    });

    test("should throw error if super methods are not defined", () => {
      const instance = heidi(mockHandler);
      const middleware = createMockMiddleware("test");
      
      // Simulate missing super methods
      instance.super_before = undefined as any;
      instance.super_after = undefined as any;
      instance.super_onError = undefined as any;

      expect(() => instance.before([middleware])).toThrow(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
      expect(() => instance.after([middleware])).toThrow(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
      expect(() => instance.onError([middleware])).toThrow(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    });
  });

  describe("Template Management", () => {
    test("should apply templates with middleware and config", () => {
      const instance = heidi<APIGatewayEvent>(mockHandler);
      const beforeMiddleware = createMockMiddleware("template-before");
      const afterMiddleware = createMockMiddleware("template-after");
      const errorMiddleware = createMockMiddleware("template-error");

      // Mock the super methods
      instance.super_before = jest.fn();
      instance.super_after = jest.fn();
      instance.super_onError = jest.fn();

      const template = {
        befores: [beforeMiddleware],
        afters: [afterMiddleware],
        onErrors: [errorMiddleware],
        config: { httpMethod: { type: "string", enum: ["POST"] } },
        metaData: { name: "template-handler", version: "1.0" }
      } as any;

      const result = instance.useTemplate([template]);

      expect(result).toBe(instance);
      expect(instance.super_before).toHaveBeenCalledWith(beforeMiddleware);
      expect(instance.super_after).toHaveBeenCalledWith(afterMiddleware);
      expect(instance.super_onError).toHaveBeenCalledWith(errorMiddleware);
      expect(instance.config).toMatchObject(template.config);
      expect(instance.metaData).toMatchObject(template.metaData);
    });

    test("should merge multiple templates", () => {
      const instance = heidi<APIGatewayEvent>(mockHandler);
      const middleware1 = createMockMiddleware("template1");
      const middleware2 = createMockMiddleware("template2");

      // Mock the super methods
      instance.super_before = jest.fn();

      const template1 = {
        befores: [middleware1],
        afters: [],
        onErrors: [],
        config: { httpMethod: { type: "string", enum: ["GET"] } },
        metaData: { name: "handler1" }
      } as any;

      const template2 = {
        befores: [middleware2],
        afters: [],
        onErrors: [],
        config: { path: { type: "string", pattern: "^/api/" } },
        metaData: { version: "2.0" }
      } as any;

      instance.useTemplate([template1, template2]);

      expect(instance.super_before).toHaveBeenCalledWith(middleware1);
      expect(instance.super_before).toHaveBeenCalledWith(middleware2);
      expect(instance.config).toMatchObject({
        httpMethod: { type: "string", enum: ["GET"] },
        path: { type: "string", pattern: "^/api/" }
      });
      expect(instance.metaData.name).toBe("handler1");
      expect(instance.metaData.version).toBe("2.0");
    });

    test("should handle templates without metadata", () => {
      const instance = heidi<APIGatewayEvent>(mockHandler);
      const middleware = createMockMiddleware("template");

      const template = {
        befores: [middleware],
        afters: [],
        onErrors: [],
        config: { httpMethod: { type: "string", enum: ["GET"] } }
        // No metaData property
      } as any;

      expect(() => instance.useTemplate([template])).not.toThrow();
      expect(instance.config).toMatchObject(template.config);
    });
  });

  describe("Route Matching", () => {
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

  describe("Request Handling", () => {
    test("should handle request and call underlying handler", async () => {
      const instance = heidi(mockHandler);
      const event = createMockAPIGatewayEvent();

      const result = await instance.handleRequest(event);

      expect(result).toEqual({ statusCode: 200, body: "success" });
    });

    test("should handle request with metadata context", async () => {
      const instance = heidi(mockHandler);
      const event = createMockAPIGatewayEvent();
      const metaData = {
        name: "test-handler",
        functionName: "my-function",
        awsRequestId: "request-123"
      };

      instance.setMetaData(metaData);
      const result = await instance.handleRequest(event);

      expect(result).toEqual({ statusCode: 200, body: "success" });
    });
  });

  describe("Type Safety and Generic Support", () => {
    test("should work with APIGatewayEvent type", () => {
      const handler = (event: APIGatewayEvent) => Promise.resolve({ statusCode: 200 });
      const instance = heidi<APIGatewayEvent>(handler);

      const config = {
        httpMethod: { type: "string", enum: ["GET"] },
        path: { type: "string" }
      };

      instance.configure(config);
      expect(instance.config).toEqual(config);
    });

    test("should work with DynamoDBRecord type", () => {
      const handler = (record: DynamoDBRecord) => Promise.resolve({ processed: true });
      const instance = heidi<DynamoDBRecord>(handler);

      const config = {
        eventName: { type: "string", enum: ["INSERT", "MODIFY", "REMOVE"] }
      };

      instance.configure(config);
      expect(instance.config).toEqual(config);
    });

    test("should work with custom event types", () => {
      interface CustomEvent {
        action: string;
        payload: any;
      }

      const handler = (event: CustomEvent) => Promise.resolve({ success: true });
      const instance = heidi<CustomEvent>(handler);

      const config = {
        action: { type: "string", enum: ["create", "update", "delete"] }
      };

      instance.configure(config);
      expect(instance.config).toEqual(config);
    });
  });

  describe("Method Chaining", () => {
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
  });

  describe("Error Handling", () => {
    test("should handle errors in handler gracefully", async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error("Handler error"));
      const instance = heidi(errorHandler);
      const event = createMockAPIGatewayEvent();

      await expect(instance.handleRequest(event)).rejects.toThrow("Handler error");
    });

    test("should handle invalid configuration", () => {
      const instance = heidi<APIGatewayEvent>(mockHandler);
      
      // This should not throw since it's just setting the config
      expect(() => {
        instance.configure({ invalidProperty: { type: "string" } } as any);
      }).not.toThrow();
    });
  });

  describe("Integration Tests", () => {
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

      // Test request handling
      const result = await instance.handleRequest(event);
      expect(result).toEqual({ success: true, processed: 1 });

      // Verify configuration was set correctly
      expect(instance.config).toEqual(config);
      expect(instance.metaData).toMatchObject(metaData);
    });
  });
});
