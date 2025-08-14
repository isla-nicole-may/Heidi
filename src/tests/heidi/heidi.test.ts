import { DynamoDBRecord } from "aws-lambda";
import { heidi, heidiTemplate } from "../../heidi";
import { heidi as heidiTypes } from "../../heidi/namespace";
import { RecordMatcherType } from "../../helpers/matcher";

const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};

describe("Heidi type behaviour", () => {
  beforeAll(() => {});

  test("should return Heidi instance with correct functions and attributes", () => {
    const heidiInstance = heidi<DynamoDBRecord>(handler);
    expect(heidiInstance).toHaveProperty("useTemplate");
    expect(heidiInstance).toHaveProperty("use");
    expect(heidiInstance).toHaveProperty("before");
    expect(heidiInstance).toHaveProperty("after");
    expect(heidiInstance).toHaveProperty("onError");
    expect(heidiInstance).toHaveProperty("matchRoute");
    expect(heidiInstance).toHaveProperty("setMetaData");
    expect(heidiInstance).toHaveProperty("configure");

    expect(heidiInstance).toHaveProperty("config");
    expect(heidiInstance).toHaveProperty("metaData");
    expect(heidiInstance).toHaveProperty("templates");
  });

  test("configure method should correctly set the config and return heidi", () => {
    const heidiInstance = heidi<DynamoDBRecord>(handler);
    const dynamoDBconfig = {
      eventType: ["APIGatewayEvent"],
      pKey: [{ prefix: "test", suffix: "123" }],
      sKey: [{ prefix: "test", suffix: "456" }],
      docType: ["TestDocument"],
    };
    heidiInstance.configure(dynamoDBconfig);
    expect(heidiInstance.config).toEqual(dynamoDBconfig);
  });

  test("metadata method should correctly set the metadata and return heidi", () => {
    const heidiInstance = heidi<DynamoDBRecord>(handler);
    const metadata: heidiTypes.HeidiMetadata = {
      name: "TestHeidi",
      description: "This is a test Heidi instance",
      version: "1.0.0",
    };
    heidiInstance.setMetaData(metadata);
    expect(heidiInstance.metaData).toEqual(metadata);
  });

  test("templates contain the correct, limited, function state, and expanded attributes", () => {
    const template = heidiTemplate();
    expect(template).toHaveProperty("useTemplate");
    expect(template).toHaveProperty("use");
    expect(template).toHaveProperty("before");
    expect(template).toHaveProperty("after");
    expect(template).toHaveProperty("onError");
    expect(template).toHaveProperty("setMetaData");
    expect(template).toHaveProperty("configure");

    expect(template).toHaveProperty("config");
    expect(template).toHaveProperty("metaData");
    expect(template).toHaveProperty("uses");
    expect(template).toHaveProperty("afters");
    expect(template).toHaveProperty("befores");
    expect(template).toHaveProperty("onErrors");

    expect(template).not.toHaveProperty("matchRoute");
  });

  test("Templates are able to inherit properties from other templates", () => {
    const template = heidiTemplate();
    const dynamoDBconfig = {
      eventType: "APIGatewayEvent",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "TestDocument",
    };
    template.configure(dynamoDBconfig);

    const template2 = heidiTemplate();
    template2.useTemplate([template]);

    expect(template2.config).toEqual(dynamoDBconfig);
  });

  test("Templates inheritance should be overriden by child attributes", () => {
    const dynamoDBconfig = {
      eventType: "APIGatewayEvent",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "TestDocument",
    };

    const expectedConfig = {
      eventType: "S3Event",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "TestDocument",
    };

    const template = heidiTemplate();

    template.configure(dynamoDBconfig);

    const template2 = heidiTemplate();

    template2.configure({
      eventType: "S3Event",
    });

    expect(template2.config).toEqual({
      eventType: "S3Event",
    });

    template2.useTemplate([template]);

    expect(template2.config).toEqual(expectedConfig);
  });

  test("Heidi instances should inherit from templates", () => {
    const dynamoDBconfig = {
      eventType: "APIGatewayEvent",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "TestDocument",
    };

    const expectedConfig = {
      eventType: "S3Event",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "TestDocument",
    };

    const template = heidiTemplate();

    template.configure(dynamoDBconfig);

    const heidiInstance = heidi<DynamoDBRecord>(handler);

    template.configure(expectedConfig);
    expect(template.config).toEqual(expectedConfig);

    heidiInstance.useTemplate([template]);

    expect(heidiInstance.config).toEqual(expectedConfig);
  });

  test("Heidi instances should inherit from templates in priotity order", () => {
    const templateConfig1 = {
      eventType: "S3Event",
      docType: "TestDocument",
    };

    const templateConfig2 = {
      eventType: "DynamoDBEvent",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "UserDocument",
    };

    const expectedConfig = {
      eventType: "S3Event",
      pKey: { prefix: "test", suffix: "123" },
      sKey: { prefix: "test", suffix: "456" },
      docType: "TestDocument",
    };

    const template1 = heidiTemplate();
    template1.configure(templateConfig1);

    const template2 = heidiTemplate();
    template2.configure(templateConfig2);

    const heidiInstance = heidi<DynamoDBRecord>(handler);
    heidiInstance.useTemplate([template2, template1]);

    expect(heidiInstance.config).toEqual(expectedConfig);
  });

  test("Heidi route event matching", () => {
    const heidiConfig = {
      eventType: ["INSERT"],
      pKey: [{ prefix: "test", suffix: "123" }],
      sKey: [{ prefix: "test", suffix: "456" }],
      docType: ["UserDocument"],
    };

    const heidiInstance = heidi<DynamoDBRecord>(handler);
    heidiInstance.configure(heidiConfig);
    expect(heidiInstance.config).toEqual(heidiConfig);

    const record: DynamoDBRecord = {
      eventName: "INSERT", // matches route config
      eventSource: "aws:dynamodb",
      dynamodb: {
        Keys: {
          partitionKey: { S: "test123" }, // matches route config
          sortKey: { S: "test456" }, // matches route config
        },
        NewImage: {
          docType: { S: "UserDocument" },
        },
      },
    };

    const match = heidiInstance.matchRoute(record);
    expect(match).toBeDefined();
    expect(match).toEqual(RecordMatcherType.DynamoDB);
  });
});
