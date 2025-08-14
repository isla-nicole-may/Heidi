import { DynamoDBRecord } from "aws-lambda";
import { heidi, heidiTemplate } from "../../heidi";
import { heidi as heidiTypes } from "../../heidi/namespace";

const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};


describe("Heidi type behaviour", () => {
  beforeAll(() => {
  });

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
    const metadata: heidiTypes.HeidiMetadata = {
      name: "TestHeidi",
      description: "This is a test Heidi instance",
      version: "1.0.0",
    };
    heidiInstance.setMetaData(metadata);
    expect(heidiInstance.metaData).toEqual(metadata);
  });

  test("templates contain the correct, limited, function state, and expanded attributes", () => {
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
});
