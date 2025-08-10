# Heidi - a high level wrapper for middy

## DEVELOPMENT NOTICE BOARD
- [] Need to implement tests for internal functionality.
- [] Need to implement the functionality inside useTemplate. 
- [] Need to test functionality against AWS event types.

## What is Heidi
Heidi is an opinionated, high level abstraction of middy that provides declarative, reusable route handling configuration.

Heidi implements a Domain-Specific Language (DSL) for AWS Lambda handlers that:
- Makes AWS event processing more declarative
- Reduces boilerplate across handlers
- Provides a consistent structure for complex routing scenarios
- Enables heirarchial composition of route configuration for better seperation of concerns.

## Why use heidi in your project?

Heidi can improve your project via: 
- *Improves speed* = Scalable, rapid deployment of serverless AWS products.
- *Reduces cognitive load* = developers think in terms of templates and composition.
- *Improves maintainability* = changes to shared logic happen in one place.
- *Allows conscistent patterns* = all handlers follow the same architectural approach.

## The seperation of concerns 

```
Template(s)
   \/
Heidi Route(s)
   \/
Heidi Router(s)

```
- Templates are used in Heidi routes to inherit middleware and configuration. 
- Templates are heirarchial and can inherit from other templates. 
- Heidi routes are polymorphic and can inherit from multiple templates. 
- Heidi routers are groups of related Heidi routes.
- Heidi routers can declare router level middleware that runs before all associated routes. 

## Usage 

### Heidi Route

```typescript
const heidiHandler = heidi<DynamoDBStreamEvent, any, never, Context>(
  handlerFunc
)
  .configure({
    docType: ["exampleDocType"],
    eventName: ["INSERT", "MODIFY"],
    pKey: [{ prefix: "examplePrefix" }],
    sKey: [{ suffix: "exampleSuffix" }],
  })
  .setMetaData({
    name: "ExampleHandler",
    version: "1.0.0",
    description: "A dummy example handler for testing purposes",
  })
  .useTemplate([template])
  .use([middlewareFunc1]) // wrapped version of middy use function
  .before([middlewareFunc2]) // wrapped version of middy before function
  .after([middlewareFunc1]) // wrapped version of middy after function
  .onError([middlewareFunc2]); // wrapped version of middy onError function

```

### Heidi Template

```typescript
const template = heidiTemplate<DynamoDBStreamEvent, any, never, Context>() 
  .configure({
    docType: ["exampleDocType"],
    eventName: ["INSERT", "MODIFY"],
    pKey: [{ prefix: "examplePrefix" }],
    sKey: [{ suffix: "exampleSuffix" }],
  })
  .setMetaData({
    name: "ExampleTemplate",
    version: "1.0.0",
    description: "A dummy example template for testing purposes",
  })
  .setCustomMatcher([])
  .useTemplate([baseTemplate]) // Use the base template
  .use([middlewareFunc1, middlewareFunc2]) // wrapped version of middy use function
  .after([middlewareFunc1]); // wrapped version of middy after function

```

### Heidi Router 
```typescript
// easily assemble routes into a named list
const routes = [{ name: "staffHandler", route: heidiHandler }];

// assemble the router from the named route list.
const router = heidiRouter<DynamoDBStreamEvent, any, Context>(routes)
  .use([middlewareFunc1, middlewareFunc2]) // wrapped version of middy use function
  .after([middlewareFunc1]) // wrapped version of middy after function
  .before([middlewareFunc2]) // wrapped version of middy before function
  .onError([middlewareFunc2]); // wrapped version of middy onError function
```

### Heidi Routes with custom matchers

```typescript
type SNSEventConfig = {
  attribute: string[];
};

const SNSEventMatcher: HeidiMatcher = {
  matcher: (record, config) => true,
  identifier: (record) => record.eventSource === "aws:sns", // Example identifier, replace with actual logic
}

const customHeidiHandler = heidi<never, any, SNSEventConfig, Context>(handlerFunc)
  .configure({
    attribute: ["exampleDocType"],
  })
  .setMetaData({
    name: "ExampleHandler",
    version: "1.0.0",
    description: "A dummy example handler for testing purposes",
  })
  .use([middlewareFunc1]) // wrapped version of middy use function
  .before([middlewareFunc2]) // wrapped version of middy before function
  .after([middlewareFunc1]) // wrapped version of middy after function
  .onError([middlewareFunc2]); // wrapped version of middy onError function
```


