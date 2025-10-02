# @heidi/core

A flexible TypeScript-first extension of [Middy](https://middy.js.org/) that adds configurable routing, configuration, and templating capabilities to AWS Lambda handlers. Built for type safety and developer experience.

## 🚀 Features

- **Type-Safe Routing**: Route AWS events with full TypeScript inference
- **Event Configuration**: Configure handlers based on event properties using JSON Schema validation with AJV
- **Template System**: Reusable middleware and configuration templates
- **Router Pattern**: Group multiple handlers with shared middleware
- **Middy Integration**: Full compatibility with existing Middy middleware
- **Zero Runtime Dependencies**: Compile-time type checking with runtime efficiency

## 📦 Installation

```bash
npm install @heidi/core
# or
pnpm add @heidi/core
# or
yarn add @heidi/core
```

**Peer Dependencies:**

- `middy`: ^0.36.0
- `typia`: ^9.7.2

## 🎯 Quick Start

### Basic Handler

```typescript
import { heidi } from "@heidi/core";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

// Create a typed handler
const handler = heidi<APIGatewayEvent, APIGatewayProxyResult>((event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World!" }),
  };
});

// Configure event matching using JSON Schema
handler.configure({
  httpMethod: { type: "string", enum: ["GET"] },
  path: { type: "string", enum: ["/hello"] },
});

export { handler };
```

### With Middleware

```typescript
import { heidi } from "@heidi/core";
import { cors } from "@middy/http-cors";
import { jsonBodyParser } from "@middy/http-json-body-parser";

const handler = heidi<APIGatewayEvent, APIGatewayProxyResult>((event) => {
  const { name } = event.body as { name: string };
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Hello ${name}!` }),
  };
});

// Add middleware
handler
  .before([jsonBodyParser()])
  .after([cors()])
  .configure({
    httpMethod: { type: "string", enum: ["POST"] },
    path: { type: "string", enum: ["/greet"] },
  });
```

## 📚 API Reference

### Core Functions

#### `heidi<T, R, C>(handler)`

Creates a new Heidi handler instance.

**Type Parameters:**

- `T` - Event type (e.g., `APIGatewayEvent`)
- `R` - Response type (e.g., `APIGatewayProxyResult`)
- `C` - Context type (extends `Context`, defaults to `Context`)

**Parameters:**

- `handler: (event: T) => Promise<R> | R` - Your Lambda function

**Returns:** `heidi.Heidi<T, R, C>`

```typescript
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const handler = heidi<APIGatewayEvent, APIGatewayProxyResult, Context>(
  async (event) => {
    // Your handler logic
    return { statusCode: 200, body: "OK" };
  }
);
```

#### `heidiTemplate<T, R, C>()`

Creates a reusable template for middleware and configuration.

**Returns:** `heidi.HeidiTemplate<T, R, C>`

```typescript
const authTemplate = heidiTemplate<APIGatewayEvent, APIGatewayProxyResult>()
  .before([authMiddleware])
  .configure({
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
  });
```

#### `heidiRouter<T, R, C>(routes)`

Creates a router to manage multiple handlers.

**Parameters:**

- `routes: Array<heidi.Heidi<T, R, C>>` - Array of Heidi handlers

**Returns:** `heidi.HeidiRouter<T, R, C>`

```typescript
const router = heidiRouter([
  getUserHandler,
  createUserHandler,
  updateUserHandler,
]);
```

### Heidi Instance Methods

#### `.configure(config)`

Configure event matching criteria using JSON Schema validation with AJV. The configuration uses JSON Schema format to define the structure and validation rules for matching events.

**Parameters:**

- `config: $EventConfig<T>` - JSON Schema configuration object matching event properties

**Returns:** `this`

```typescript
// API Gateway configuration using JSON Schema
handler.configure({
  httpMethod: { type: "string", enum: ["POST"] },
  path: { type: "string", enum: ["/users"] },
  headers: {
    type: "object",
    properties: {
      "content-type": { type: "string", enum: ["application/json"] },
    },
  },
});

// DynamoDB Stream configuration
handler.configure({
  eventName: { type: "string", enum: ["INSERT"] },
  dynamodb: {
    type: "object",
    properties: {
      Keys: {
        type: "object",
        properties: {
          userId: {
            type: "object",
            properties: {
              S: { type: "string" },
            },
          },
        },
      },
    },
  },
});

// S3 Event configuration
handler.configure({
  eventName: { type: "string", pattern: "^s3:ObjectCreated:" },
  s3: {
    type: "object",
    properties: {
      bucket: {
        type: "object",
        properties: {
          name: { type: "string", enum: ["my-bucket"] },
        },
      },
    },
  },
});
```

#### `.setMetaData(metaData)`

Set metadata for the handler instance.

**Parameters:**

- `metaData: Partial<heidi.HeidiMetadata>` - Metadata object

**Returns:** `this`

```typescript
handler.setMetaData({
  name: "UserAPI",
  description: "Handles user-related operations",
  version: "1.0.0",
  functionName: "user-api-handler",
});
```

#### `.before(middlewares)`

Add middleware to run before the handler.

**Parameters:**

- `middlewares: Array<MiddlewareFunction<T, R, C>>` - Array of Middy middleware

**Returns:** `this`

```typescript
import { jsonBodyParser } from "@middy/http-json-body-parser";
import { validator } from "@middy/validator";

handler.before([jsonBodyParser(), validator({ inputSchema: userSchema })]);
```

#### `.after(middlewares)`

Add middleware to run after the handler.

**Parameters:**

- `middlewares: Array<MiddlewareFunction<T, R, C>>` - Array of Middy middleware

**Returns:** `this`

```typescript
import { cors } from "@middy/http-cors";
import { httpHeaderNormalizer } from "@middy/http-header-normalizer";

handler.after([cors(), httpHeaderNormalizer()]);
```

#### `.onError(middlewares)`

Add error handling middleware.

**Parameters:**

- `middlewares: Array<MiddlewareFunction<T, R, C>>` - Array of Middy middleware

**Returns:** `this`

```typescript
import { httpErrorHandler } from "@middy/http-error-handler";

handler.onError([httpErrorHandler()]);
```

#### `.useTemplate(templates)`

Apply reusable templates to the handler.

**Parameters:**

- `templates: Array<heidi.HeidiTemplate<T, R, C>>` - Array of templates

**Returns:** `this`

```typescript
const authTemplate = heidiTemplate()
  .before([authMiddleware])
  .configure({
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
  });

const corsTemplate = heidiTemplate().after([cors()]);

handler.useTemplate([authTemplate, corsTemplate]);
```

#### `.matchRoute(event)`

Check if an event matches this handler's configuration.

**Parameters:**

- `event: T` - Event to test

**Returns:** `boolean`

```typescript
const isMatch = handler.matchRoute(event);
if (isMatch) {
  // This handler can process the event
}
```

#### `.handleRequest(event)`

Process an event with this handler.

**Parameters:**

- `event: T` - Event to process

**Returns:** `Promise<any>`

```typescript
const result = await handler.handleRequest(event);
```

### HeidiTemplate Methods

Templates support the same methods as handlers but store configuration for reuse:

```typescript
const template = heidiTemplate<APIGatewayEvent, APIGatewayProxyResult>()
  .configure({ httpMethod: "GET" })
  .before([authMiddleware])
  .after([cors()])
  .setMetaData({ version: "1.0.0" });

// Apply to multiple handlers
handler1.useTemplate([template]);
handler2.useTemplate([template]);
```

### HeidiRouter Methods

#### `.addRoute(route)`

Add a handler to the router.

**Parameters:**

- `route: heidi.Heidi<T, R, C>` - Handler to add

```typescript
router.addRoute(newHandler);
```

#### `.getAllRoutes()`

Get all handlers in the router.

**Returns:** `Array<heidi.Heidi<T, R, C>>`

```typescript
const allRoutes = router.getAllRoutes();
```

#### `.matchRoute(event)`

Find the first handler that matches an event.

**Parameters:**

- `event: T` - Event to match

**Returns:** `heidi.Heidi<T, R, C> | undefined`

```typescript
const matchedHandler = router.matchRoute(event);
```

#### `.handleRequest(event)`

Process an event by finding and executing the matching handler.

**Parameters:**

- `event: T` - Event to process

**Returns:** `Promise<any>`

```typescript
const result = await router.handleRequest(event);
```

#### Router Middleware

Routers support the same middleware methods as handlers, applying globally:

```typescript
router
  .before([globalAuthMiddleware])
  .after([globalLoggingMiddleware])
  .onError([globalErrorHandler]);
```

## 🔧 Advanced Examples

### Multi-Event Handler with Router

```typescript
import { heidi, heidiRouter } from "@heidi/core";
import { APIGatewayEvent, DynamoDBStreamEvent, S3Event } from "aws-lambda";

// API Gateway handler
const apiHandler = heidi<APIGatewayEvent>((event) => {
  return { statusCode: 200, body: "API Response" };
}).configure({
  httpMethod: { type: "string", enum: ["POST"] },
  path: { type: "string", enum: ["/webhook"] },
});

// DynamoDB Stream handler
const dbHandler = heidi<DynamoDBStreamEvent>((event) => {
  console.log("Processing DB changes:", event.Records);
}).configure({
  eventName: { type: "string", enum: ["INSERT"] },
});

// S3 Event handler
const s3Handler = heidi<S3Event>((event) => {
  console.log("Processing S3 event:", event.Records);
}).configure({
  eventName: { type: "string", pattern: "^s3:ObjectCreated:" },
});

// Create router for multiple event types
const router = heidiRouter([apiHandler, dbHandler, s3Handler]);

export const handler = router.handleRequest;
```

### Template-Based Architecture

```typescript
// Base template with common middleware
const baseTemplate = heidiTemplate()
  .before([jsonBodyParser(), httpHeaderNormalizer()])
  .after([cors(), httpSecurityHeaders()])
  .onError([httpErrorHandler()]);

// Auth template
const authTemplate = heidiTemplate()
  .before([authMiddleware])
  .configure({
    headers: {
      Authorization: { type: "string" },
    },
  });

// Public endpoints
const publicHandler = heidi<APIGatewayEvent>((event) => {
  return { statusCode: 200, body: "Public data" };
})
  .useTemplate([baseTemplate])
  .configure({
    path: { type: "string", enum: ["/public"] },
  });

// Protected endpoints
const protectedHandler = heidi<APIGatewayEvent>((event) => {
  return { statusCode: 200, body: "Protected data" };
})
  .useTemplate([baseTemplate, authTemplate])
  .configure({
    path: { type: "string", enum: ["/protected"] },
  });
```

### Complex Event Configuration

```typescript
// DynamoDB Stream with complex filtering
const dbHandler = heidi<DynamoDBStreamEvent>((event) => {
  // Process user updates
}).configure({
  eventName: { type: "string", enum: ["MODIFY"] },
  dynamodb: {
    type: "object",
    properties: {
      Keys: {
        type: "object",
        properties: {
          userId: {
            type: "object",
            properties: {
              S: { type: "string" },
            },
          },
        },
      },
      NewImage: {
        type: "object",
        properties: {
          email: {
            type: "object",
            properties: {
              S: { type: "string" },
            },
          },
        },
      },
    },
  },
});

// SQS with message attributes
const sqsHandler = heidi<SQSEvent>((event) => {
  // Process orders
}).configure({
  messageAttributes: {
    type: "object",
    properties: {
      orderType: {
        type: "object",
        properties: {
          stringValue: { type: "string", enum: ["premium"] },
        },
      },
    },
  },
});
```

## 🧪 Testing

Heidi handlers are easy to test since they're just functions:

```typescript
import { handler } from "./my-handler";

describe("My Handler", () => {
  it("should process events correctly", async () => {
    const event = {
      httpMethod: "GET",
      path: "/test",
      body: null,
    } as APIGatewayEvent;

    const result = await handler.handleRequest(event);

    expect(result.statusCode).toBe(200);
  });

  it("should match correct events", () => {
    const event = { httpMethod: "GET", path: "/test" } as APIGatewayEvent;

    expect(handler.matchRoute(event)).toBe(true);
  });
});
```

## 🔗 Integration with Existing Middy Middleware

Heidi is fully compatible with the entire Middy ecosystem:

```typescript
import { heidi } from "@heidi/core";
import {
  jsonBodyParser,
  cors,
  httpErrorHandler,
  validator,
  httpHeaderNormalizer,
} from "@middy/core";

const handler = heidi<APIGatewayEvent>((event) => {
  // Your logic here
})
  .before([
    jsonBodyParser(),
    httpHeaderNormalizer(),
    validator({ inputSchema: mySchema }),
  ])
  .after([cors()])
  .onError([httpErrorHandler()]);
```

## 🏗️ Architecture

### Type System

Heidi uses advanced TypeScript features for type safety:

```typescript
// Event configuration is typed based on your event type
heidi<APIGatewayEvent>().configure({
  httpMethod: "GET", // ✅ Valid
  Records: [], // ❌ TypeScript error - not part of APIGatewayEvent
});
```

### Event Matching

Events are matched using AJV schema validation:

1. Configuration is converted to JSON Schema
2. Incoming events are validated against the schema
3. Handlers are executed if validation passes

### Template System

Templates allow sharing configuration and middleware:

```typescript
// Templates are composable
const template = heidiTemplate()
  .useTemplate([otherTemplate1, otherTemplate2])
  .before([myMiddleware]);
```

## 📝 Type Definitions

### Core Types

```typescript
namespace heidi {
  interface Heidi<T, R, C extends Context = Context> {
    config: $EventConfig<T>;
    metaData: HeidiMetadata;
    templates?: Array<HeidiTemplate<T, R, C>>;

    handleRequest(event: T): Promise<any>;
    configure(config: $EventConfig<T>): this;
    setMetaData(metaData: Partial<HeidiMetadata>): this;
    useTemplate(template: Array<HeidiTemplate<T, R, C>>): this;
    matchRoute(record: T): boolean;

    before(middleware: Array<MiddlewareFunction<T, R, C>>): this;
    after(middleware: Array<MiddlewareFunction<T, R, C>>): this;
    onError(middleware: Array<MiddlewareFunction<T, R, C>>): this;
  }

  interface HeidiTemplate<T, R, C extends Context> {
    config: $EventConfig<T>;
    metaData: HeidiMetadata;
    befores: Array<MiddlewareFunction<T, R, C>>;
    afters: Array<MiddlewareFunction<T, R, C>>;
    onErrors: Array<MiddlewareFunction<T, R, C>>;
    templates: Array<HeidiTemplate<T, R, C>>;

    configure(config: $EventConfig<T>): this;
    setMetaData(metaData: HeidiMetadata): this;
    useTemplate(template: Array<HeidiTemplate<T, R, C>>): this;
    before(middleware: Array<MiddlewareFunction<T, R, C>>): this;
    after(middleware: Array<MiddlewareFunction<T, R, C>>): this;
    onError(middleware: Array<MiddlewareFunction<T, R, C>>): this;
  }

  interface HeidiRouter<T, R, C extends Context = Context> {
    routes: Array<Heidi<T, R, C>>;
    metaData?: HeidiMetadata;

    handleRequest(recordOrEvent: T): Promise<any>;
    getAllRoutes(): Array<Heidi<T, R, C>>;
    matchRoute(recordOrEvent: T): Heidi<T, R, C> | undefined;
    addRoute(route: Heidi<T, R, C>): void;
    setMetaData(metaData: HeidiMetadata): this;

    before(middleware: Array<MiddlewareFunction<T, R, C>>): this;
    after(middleware: Array<MiddlewareFunction<T, R, C>>): this;
    onError(middleware: Array<MiddlewareFunction<T, R, C>>): this;
  }

  type HeidiMetadata = Context & {
    name: string;
    description: string;
    version: string;
  };
}
```

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Middy](https://middy.js.org/) - the stylish Node.js middleware engine
- Powered by [Typia](https://github.com/samchon/typia) for runtime type validation
- Inspired by modern web framework routing patterns
