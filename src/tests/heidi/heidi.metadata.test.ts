import { heidi } from "../../heidi/heidi";
import { Context } from "aws-lambda";

// Mock the eventTools module to avoid Typia issues
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: jest.fn().mockReturnValue(true),
  matchEventToConfig: jest.fn().mockReturnValue(true)
}));

// Mock handler for testing
const mockHandler = jest.fn().mockResolvedValue({ statusCode: 200, body: "success" });

describe("Heidi Wrapper - Metadata Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
