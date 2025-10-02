import { heidi } from "../../heidi/heidi";
import { Context } from "aws-lambda";
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

describe("Heidi Wrapper - Middleware Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
