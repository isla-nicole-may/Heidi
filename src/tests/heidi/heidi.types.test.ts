import { heidi } from "../../heidi/heidi";
import { APIGatewayEvent, DynamoDBRecord } from "aws-lambda";

// Mock the eventTools module to avoid Typia issues
jest.mock("../../heidi/eventTools", () => ({
  matchEventToRoute: jest.fn().mockReturnValue(true),
  matchEventToConfig: jest.fn().mockReturnValue(true)
}));

// Mock handler for testing
const mockHandler = jest.fn().mockResolvedValue({ statusCode: 200, body: "success" });

describe("Heidi Wrapper - Type Safety and Generic Support", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
