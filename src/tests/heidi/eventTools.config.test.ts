import { matchEventToConfig, $EventConfig } from "../../heidi/eventTools";
import { 
  APIGatewayEvent, 
  DynamoDBRecord, 
  S3EventRecord,
  SNSEventRecord,
  SQSRecord,
  EventBridgeEvent,
  CloudFrontEvent
} from "aws-lambda";

// Helper function to create complete mock events
const createMockAPIGatewayEvent = (overrides: Partial<APIGatewayEvent> = {}): APIGatewayEvent => ({
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
  isBase64Encoded: false,
  ...overrides
});

const createMockSQSRecord = (overrides: Partial<SQSRecord> = {}): SQSRecord => ({
  messageId: "msg-123",
  receiptHandle: "receipt-456",
  body: '{"test": true}',
  attributes: {
    ApproximateReceiveCount: "1",
    SentTimestamp: "1640995200000",
    ApproximateFirstReceiveTimestamp: "1640995200000",
    SenderId: "sender123"
  },
  messageAttributes: {},
  md5OfBody: "abc123",
  eventSource: "aws:sqs",
  eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:test-queue",
  awsRegion: "us-east-1",
  ...overrides
});

const createMockSNSEventRecord = (overrides: Partial<SNSEventRecord> = {}): SNSEventRecord => ({
  EventVersion: "1.0",
  EventSubscriptionArn: "arn:aws:sns:us-east-1:123456789012:test-topic",
  EventSource: "aws:sns",
  Sns: {
    Type: "Notification",
    MessageId: "msg-123",
    TopicArn: "arn:aws:sns:us-east-1:123456789012:test-topic",
    Subject: "Test Subject",
    Message: "Test message",
    Timestamp: "2023-01-01T00:00:00.000Z",
    SignatureVersion: "1",
    Signature: "test-signature",
    SigningCertUrl: "https://sns.us-east-1.amazonaws.com/cert.pem",
    UnsubscribeUrl: "https://sns.us-east-1.amazonaws.com/unsubscribe",
    MessageAttributes: {},
    ...overrides.Sns && { Sns: { ...createMockSNSEventRecord().Sns, ...overrides.Sns } }
  },
  ...overrides
});

describe("matchEventToConfig", () => {
  // Your existing tests
  test("APIGatewayEvent: http method mathes event correctly", () => {
    const event = createMockAPIGatewayEvent({
      httpMethod: "GET",
      path: "/test"
    });

    const config: $EventConfig<APIGatewayEvent> = {
      httpMethod: { type: "string", enum: ["GET"] },
    };

    const result = matchEventToConfig(config, event);
    expect(result).toBe(true);
  });

  test("APIGatewayEvent: http method matches event but path does not match", () => {
    const event = createMockAPIGatewayEvent({
      httpMethod: "GET",
      path: "/test"
    });

    const config: $EventConfig<APIGatewayEvent> = {
      httpMethod: { type: "string", enum: ["GET"] },
      path: { type: "string", enum: ["/debug"] },
    };

    const result = matchEventToConfig(config, event);
    expect(result).toBe(false);
  });

  test("DynamoDBRecord: matching correctly", () => {
    const event: DynamoDBRecord = {
      eventName: "INSERT",
      dynamodb: {
        Keys: {
          pKey: { S: "USER#APPLICANT" },
          docType: { S: "CONFIG" },
        },
      },
    } as DynamoDBRecord;

    const config: $EventConfig<DynamoDBRecord> = {
      eventName: { type: "string", enum: ["INSERT"] },
      dynamodb: {
        type: "object",
        properties: {
          Keys: {
            type: "object",
            properties: {
              pKey: {
                type: "object",
                properties: {
                  S: { type: "string", pattern: "APPLICANT$" }, // match ends with APPLICANT
                },
              },
              docType: {
                type: "object",
                properties: {
                  S: { type: "string", pattern: "^CONFIG$" }, // match CONFIG exactly
                },
              },
            },
          },
        },
      },
    };

    const result = matchEventToConfig(config, event);
    expect(result).toBe(true);
  });

  // === API Gateway Event Tests ===
  describe("APIGatewayEvent comprehensive tests", () => {
    test("should match path with regex pattern", () => {
      const event = createMockAPIGatewayEvent({
        httpMethod: "GET",
        path: "/api/v1/users/123",
        headers: { "content-type": "application/json" }
      });

      const config: $EventConfig<APIGatewayEvent> = {
        path: { type: "string", pattern: "^/api/v[0-9]+/users/[0-9]+$" },
        headers: {
          type: "object",
          properties: {
            "content-type": { type: "string", enum: ["application/json"] }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate nested requestContext", () => {
      const event = createMockAPIGatewayEvent({
        httpMethod: "POST",
        path: "/api/data",
        requestContext: {
          ...createMockAPIGatewayEvent().requestContext,
          identity: {
            ...createMockAPIGatewayEvent().requestContext.identity,
            sourceIp: "192.168.1.1",
            userAgent: "test-agent"
          },
          stage: "prod"
        }
      });

      const config: $EventConfig<APIGatewayEvent> = {
        httpMethod: { type: "string", enum: ["POST"] },
        requestContext: {
          type: "object",
          properties: {
            identity: {
              type: "object",
              properties: {
                sourceIp: { type: "string", pattern: "^192\\.168\\." },
                userAgent: { type: "string", minLength: 1 }
              },
              required: ["sourceIp"]
            },
            stage: { type: "string", enum: ["dev", "staging", "prod"] }
          },
          required: ["identity", "stage"]
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should handle optional fields correctly", () => {
      const event = createMockAPIGatewayEvent({
        httpMethod: "GET",
        path: "/test",
        body: null
      });

      const config: $EventConfig<APIGatewayEvent> = {
        httpMethod: { type: "string", enum: ["GET"] },
        body: { type: ["string", "null"] }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === DynamoDB Record Tests ===
  describe("DynamoDBRecord comprehensive tests", () => {
    test("should match different event types", () => {
      const event: DynamoDBRecord = {
        eventName: "MODIFY",
        eventSource: "aws:dynamodb",
        awsRegion: "us-east-1",
        dynamodb: {
          Keys: {
            id: { S: "user-123" }
          },
          NewImage: {
            id: { S: "user-123" },
            name: { S: "John Doe" },
            status: { S: "active" }
          }
        }
      } as DynamoDBRecord;

      const config: $EventConfig<DynamoDBRecord> = {
        eventName: { type: "string", enum: ["INSERT", "MODIFY", "REMOVE"] },
        eventSource: { type: "string", const: "aws:dynamodb" },
        awsRegion: { type: "string", pattern: "^us-" },
        dynamodb: {
          type: "object",
          properties: {
            NewImage: {
              type: "object",
              properties: {
                status: {
                  type: "object",
                  properties: {
                    S: { type: "string", enum: ["active", "inactive", "pending"] }
                  }
                }
              }
            }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate complex key patterns", () => {
      const event: DynamoDBRecord = {
        eventName: "INSERT",
        dynamodb: {
          Keys: {
            PK: { S: "ORG#123" },
            SK: { S: "USER#456#PROFILE" }
          }
        }
      } as DynamoDBRecord;

      const config: $EventConfig<DynamoDBRecord> = {
        dynamodb: {
          type: "object",
          properties: {
            Keys: {
              type: "object",
              properties: {
                PK: {
                  type: "object",
                  properties: {
                    S: { type: "string", pattern: "^ORG#[0-9]+$" }
                  }
                },
                SK: {
                  type: "object",
                  properties: {
                    S: { type: "string", pattern: "^USER#[0-9]+#" }
                  }
                }
              },
              required: ["PK", "SK"]
            }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === S3 Event Record Tests ===
  describe("S3EventRecord comprehensive tests", () => {
    test("should match S3 object operations", () => {
      const event: S3EventRecord = {
        eventVersion: "2.1",
        eventSource: "aws:s3",
        awsRegion: "us-west-2",
        eventTime: "2023-01-01T00:00:00.000Z",
        eventName: "s3:ObjectCreated:Put",
        s3: {
          bucket: {
            name: "my-upload-bucket",
            arn: "arn:aws:s3:::my-upload-bucket"
          },
          object: {
            key: "uploads/images/photo.jpg",
            size: 1024000,
            eTag: "abc123"
          }
        }
      } as S3EventRecord;

      const config: $EventConfig<S3EventRecord> = {
        eventName: { type: "string", pattern: "^s3:ObjectCreated:" },
        s3: {
          type: "object",
          properties: {
            bucket: {
              type: "object",
              properties: {
                name: { type: "string", pattern: "-upload-bucket$" }
              }
            },
            object: {
              type: "object",
              properties: {
                key: { type: "string", pattern: "^uploads/images/" },
                size: { type: "number", minimum: 1000 }
              }
            }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate file type restrictions", () => {
      const event: S3EventRecord = {
        eventName: "s3:ObjectCreated:Put",
        s3: {
          object: {
            key: "documents/report.pdf",
            size: 500000
          }
        }
      } as S3EventRecord;

      const config: $EventConfig<S3EventRecord> = {
        s3: {
          type: "object",
          properties: {
            object: {
              type: "object",
              properties: {
                key: { type: "string", pattern: "\\.(pdf|doc|docx)$" },
                size: { type: "number", maximum: 10000000 } // 10MB limit
              }
            }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === SQS Record Tests ===
  describe("SQSRecord comprehensive tests", () => {
    test("should match SQS message attributes", () => {
      const event = createMockSQSRecord({
        body: JSON.stringify({ type: "user-signup", userId: "123" }),
        messageAttributes: {
          messageType: {
            stringValue: "user-signup",
            dataType: "String"
          }
        },
        eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:my-queue"
      });

      const config: $EventConfig<SQSRecord> = {
        eventSource: { type: "string", const: "aws:sqs" },
        eventSourceARN: { type: "string", pattern: ":my-queue$" },
        messageAttributes: {
          type: "object",
          properties: {
            messageType: {
              type: "object",
              properties: {
                stringValue: { type: "string", enum: ["user-signup", "user-login", "user-logout"] }
              }
            }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate JSON body content", () => {
      const event = createMockSQSRecord({
        body: JSON.stringify({ 
          action: "process-payment", 
          amount: 100, 
          currency: "USD" 
        })
      });

      // Note: This tests the string representation, not parsed JSON
      const config: $EventConfig<SQSRecord> = {
        body: { 
          type: "string", 
          pattern: "\"action\"\\s*:\\s*\"process-payment\"" 
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === SNS Event Record Tests ===
  describe("SNSEventRecord comprehensive tests", () => {
    test("should match SNS message properties", () => {
      const event = createMockSNSEventRecord({
        EventSubscriptionArn: "arn:aws:sns:us-east-1:123456789012:my-topic",
        Sns: {
          Type: "Notification",
          MessageId: "msg-123",
          TopicArn: "arn:aws:sns:us-east-1:123456789012:my-topic",
          Subject: "Alert: System Status",
          Message: JSON.stringify({ level: "warning", system: "auth" }),
          Timestamp: "2023-01-01T00:00:00.000Z",
          SignatureVersion: "1",
          Signature: "test-signature",
          SigningCertUrl: "https://sns.us-east-1.amazonaws.com/cert.pem",
          UnsubscribeUrl: "https://sns.us-east-1.amazonaws.com/unsubscribe",
          MessageAttributes: {
            priority: {
              Type: "String",
              Value: "high"
            }
          }
        }
      });

      const config: $EventConfig<SNSEventRecord> = {
        EventSource: { type: "string", const: "aws:sns" },
        Sns: {
          type: "object",
          properties: {
            Type: { type: "string", enum: ["Notification", "SubscriptionConfirmation"] },
            Subject: { type: "string", pattern: "^Alert:" },
            MessageAttributes: {
              type: "object",
              properties: {
                priority: {
                  type: "object",
                  properties: {
                    Value: { type: "string", enum: ["low", "medium", "high", "critical"] }
                  }
                }
              }
            }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === EventBridge Event Tests ===
  describe("EventBridgeEvent comprehensive tests", () => {
    test("should match custom EventBridge events", () => {
      const event: EventBridgeEvent<"Order Placed", any> = {
        version: "0",
        id: "event-123",
        "detail-type": "Order Placed",
        source: "ecommerce.orders",
        account: "123456789012",
        time: "2023-01-01T00:00:00Z",
        region: "us-east-1",
        detail: {
          orderId: "order-456",
          customerId: "customer-789",
          amount: 99.99,
          items: ["item1", "item2"]
        },
        resources: []
      };

      const config: $EventConfig<EventBridgeEvent<"Order Placed", any>> = {
        source: { type: "string", pattern: "^ecommerce\\." },
        "detail-type": { type: "string", const: "Order Placed" },
        detail: {
          type: "object",
          properties: {
            orderId: { type: "string", pattern: "^order-" },
            amount: { type: "number", minimum: 0 },
            items: {
              type: "array",
              minItems: 1,
              items: { type: "string" }
            }
          },
          required: ["orderId", "amount"]
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate AWS service events", () => {
      const event: EventBridgeEvent<"EC2 Instance State-change Notification", any> = {
        version: "0",
        id: "aws-event-123",
        "detail-type": "EC2 Instance State-change Notification",
        source: "aws.ec2",
        account: "123456789012",
        time: "2023-01-01T00:00:00Z",
        region: "us-east-1",
        detail: {
          "instance-id": "i-0123456789abcdef0",
          state: "running"
        },
        resources: ["arn:aws:ec2:us-east-1:123456789012:instance/i-0123456789abcdef0"]
      };

      const config: $EventConfig<EventBridgeEvent<"EC2 Instance State-change Notification", any>> = {
        source: { type: "string", pattern: "^aws\\." },
        detail: {
          type: "object",
          properties: {
            "instance-id": { type: "string", pattern: "^i-[0-9a-f]{17}$" },
            state: { type: "string", enum: ["pending", "running", "stopping", "stopped", "terminated"] }
          }
        },
        resources: {
          type: "array",
          items: {
            type: "string",
            pattern: "arn:aws:ec2:"
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === CloudFront Event Tests ===
  describe("CloudFrontEvent comprehensive tests", () => {
    test("should match CloudFront request events", () => {
      const event: CloudFrontEvent = {
        config: {
          distributionDomainName: "d123456abcdef8.cloudfront.net",
          distributionId: "EDFDVBD632BHDS5",
          eventType: "origin-request" as any,
          requestId: "request-123"
        }
      } as CloudFrontEvent;

      // Test with simpler validation first
      const config: $EventConfig<CloudFrontEvent> = {
        config: {
          type: "object",
          properties: {
            distributionId: { type: "string" } // Simplified validation
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should match CloudFront with more specific validation", () => {
      const event: CloudFrontEvent = {
        config: {
          distributionDomainName: "d123456abcdef8.cloudfront.net",
          distributionId: "EDFDVBD632BHDS5",
          eventType: "origin-request" as any,
          requestId: "request-123"
        }
      } as CloudFrontEvent;

      const config: $EventConfig<CloudFrontEvent> = {
        config: {
          type: "object",
          properties: {
            eventType: { type: "string", const: "origin-request" },
            distributionId: { type: "string", minLength: 1 }
          }
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });
  });

  // === Edge Cases and Error Handling ===
  describe("Edge cases and validation", () => {
    test("should handle empty config", () => {
      const event = createMockAPIGatewayEvent({
        httpMethod: "GET",
        path: "/test"
      });

      const config: $EventConfig<APIGatewayEvent> = {};

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should fail validation with wrong types", () => {
      const event = createMockAPIGatewayEvent({
        httpMethod: "GET",
        path: "/test"
      });

      const config: $EventConfig<APIGatewayEvent> = {
        httpMethod: { type: "number" } // Wrong type
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(false);
    });

    test("should handle missing required fields", () => {
      const event: DynamoDBRecord = {
        eventName: "INSERT"
      } as DynamoDBRecord;

      const config: $EventConfig<DynamoDBRecord> = {
        eventName: { type: "string" },
        dynamodb: { type: "object" }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(false);
    });

    test("should validate array properties", () => {
      const event = {
        tags: ["tag1", "tag2", "tag3"],
        metadata: { version: "1.0" }
      };

      const config = {
        tags: {
          type: "array",
          minItems: 2,
          maxItems: 5,
          items: { type: "string", minLength: 3 }
        },
        metadata: {
          type: "object",
          properties: {
            version: { type: "string", pattern: "^[0-9]+\\.[0-9]+$" }
          },
          required: ["version"]
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should handle boolean and numeric validations", () => {
      const event = {
        isActive: true,
        count: 42,
        score: 85.5
      };

      const config = {
        isActive: { type: "boolean", const: true },
        count: { type: "integer", minimum: 1, maximum: 100 },
        score: { type: "number", multipleOf: 0.5 }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate string formats and patterns", () => {
      const event = {
        email: "user@example.com",
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        timestamp: "2023-01-01T00:00:00Z"
      };

      const config = {
        email: { type: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" }, // Email pattern instead of format
        uuid: { type: "string", pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$" },
        timestamp: { type: "string", pattern: "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z" }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should handle nullable and optional fields", () => {
      const event = {
        optional: null,
        required: "value",
        nested: {
          optional: undefined,
          required: 42
        }
      };

      const config = {
        optional: { type: ["string", "null"] },
        required: { type: "string", minLength: 1 },
        nested: {
          type: "object",
          properties: {
            required: { type: "number" }
          },
          required: ["required"]
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should validate complex nested structures", () => {
      const event = {
        metadata: {
          version: "2.0",
          features: {
            auth: { enabled: true, methods: ["oauth", "apikey"] },
            logging: { level: "info", destinations: ["cloudwatch", "s3"] }
          },
          stats: {
            users: 1250,
            requests: 50000
          }
        }
      };

      const config = {
        metadata: {
          type: "object",
          properties: {
            version: { type: "string", pattern: "^[0-9]+\\.[0-9]+$" },
            features: {
              type: "object",
              properties: {
                auth: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean" },
                    methods: {
                      type: "array",
                      items: { type: "string", enum: ["oauth", "apikey", "basic"] }
                    }
                  }
                },
                logging: {
                  type: "object",
                  properties: {
                    level: { type: "string", enum: ["debug", "info", "warn", "error"] }
                  }
                }
              }
            },
            stats: {
              type: "object",
              properties: {
                users: { type: "integer", minimum: 0 },
                requests: { type: "integer", minimum: 0 }
              }
            }
          },
          required: ["version", "features"]
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(true);
    });

    test("should fail validation for complex mismatches", () => {
      const event = {
        data: {
          status: "invalid-status",
          count: -5,
          tags: ["short", "a", "very-long-tag-name"]
        }
      };

      const config = {
        data: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["active", "inactive", "pending"] },
            count: { type: "integer", minimum: 0 },
            tags: {
              type: "array",
              items: { type: "string", minLength: 3, maxLength: 10 }
            }
          },
          required: ["status", "count"]
        }
      };

      const result = matchEventToConfig(config, event);
      expect(result).toBe(false);
    });
  });
});
