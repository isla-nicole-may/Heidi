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

describe("Heidi Wrapper - Template Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
