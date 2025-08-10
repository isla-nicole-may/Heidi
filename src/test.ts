import { Context, DynamoDBStreamEvent } from "aws-lambda";
import { heidi, heidiRouter, heidiTemplate } from "./middyWrapper";
import { MiddlewareObject } from "middy";

const handlerFunc = () => true; // Your actual handler logic here, currently no type information provided...
const middlewareFunc1 = (() => true) as unknown as MiddlewareObject<
  DynamoDBStreamEvent,
  any,
  Context
>; // Example middleware, replace with actual logic
const middlewareFunc2 = (() => true) as unknown as MiddlewareObject<
  DynamoDBStreamEvent,
  any,
  Context
>; // Example middleware, replace with actual logic

const baseTemplate = heidiTemplate<DynamoDBStreamEvent, any, never, Context>() // Create a template instance, never goes into middy instances...
  .use([middlewareFunc1]); // wrapped version of middy use function

const template = heidiTemplate<DynamoDBStreamEvent, any, never, Context>() // Create a template instance, never goes into middy instances...
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

// easily assemble routes into a named list
const routes = [{ name: "staffHandler", route: heidiHandler }];

// assemble the router from the named route list.
const router = heidiRouter<DynamoDBStreamEvent, any, Context>(routes)
  .use([middlewareFunc1, middlewareFunc2]) // wrapped version of middy use function
  .after([middlewareFunc1]) // wrapped version of middy after function
  .before([middlewareFunc2]) // wrapped version of middy before function
  .onError([middlewareFunc2]); // wrapped version of middy onError function
