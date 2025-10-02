import { heidi } from "../../heidi/heidi";
import { APIGatewayEvent, Context } from "aws-lambda";

// Mock the eventTools module to avoid Typia issues
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: jest.fn().mockReturnValue(true),
  matchEventToConfig: jest.fn().mockReturnValue(true)
}));

// Mock handler for testing
const mockHandler = jest.fn().mockResolvedValue({ statusCode: 200, body: "success" });

describe("Heidi Wrapper - Basic Initialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
