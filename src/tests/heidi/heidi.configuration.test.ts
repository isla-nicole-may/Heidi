import { heidi } from "../../heidi/heidi";
import { APIGatewayEvent } from "aws-lambda";

// Mock the eventTools module to avoid Typia issues
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: jest.fn().mockReturnValue(true),
  matchEventToConfig: jest.fn().mockReturnValue(true)
}));

// Mock handler for testing
const mockHandler = jest.fn().mockResolvedValue({ statusCode: 200, body: "success" });

describe("Heidi Wrapper - Configuration Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test("should handle invalid configuration gracefully", () => {
    const instance = heidi<APIGatewayEvent>(mockHandler);
    
    // This should not throw since it's just setting the config
    expect(() => {
      instance.configure({ invalidProperty: { type: "string" } } as any);
    }).not.toThrow();
  });
});
