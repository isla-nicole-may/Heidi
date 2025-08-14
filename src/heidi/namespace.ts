import { Middy, MiddlewareObject, MiddlewareFunction } from "middy";
import { Context } from "aws-lambda";
import { RenameKeys } from "../types/tools";
import { $MAP_CONFIG_TO_RECORD } from "../types/handlable";
import { EventMatcherType, RecordMatcherType } from "../helpers/matcher";

export declare namespace heidi {
  interface HeidiMetadata {
    name: string;
    description: string;
    version: string;
  }
  type ExtendableMiddyHandler<T, R, C extends Context> = RenameKeys<
    Pick<Middy<T, R, C>, "after" | "before" | "onError" | "use">,
    {
      ["use"]: "super_use";
      ["after"]: "super_after";
      ["before"]: "super_before";
      ["onError"]: "super_onError";
    }
  >;
  // Heidi interface extends Middy, allowing for middleware and handler logic.
  interface Heidi<T, R, C extends Context = Context>
    extends ExtendableMiddyHandler<T, R, C> {
    config: $MAP_CONFIG_TO_RECORD<T>; // Configuration for the Heidi instance, maps to the event type.
    metaData: HeidiMetadata; // Metadata for the router, useful in configuration.
    templates?: Array<HeidiTemplate<T, R, C>>; // Optional template for the route, allows for shared middleware and validation.
    // use, before, after, onError methods are inherited from Middy
    configure(config: $MAP_CONFIG_TO_RECORD<T>): this; // implement mapping logic
    setMetaData(metaData: HeidiMetadata): this;
    // Assign reusable templates to the route, allows for shared middleware and validation, easier faster production.
    useTemplate(template: Array<HeidiTemplate<T, R, C>>): this;
    // Match event to the route, useful for routing logic.
    matchRoute(record: T): EventMatcherType | RecordMatcherType | undefined;

    // Make custom wrapper of use functionality that allows us to still return the heidi instance, not the middy instance;
    // make use of the super_use cast attribute.
    use: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    after: (middleware: Array<MiddlewareFunction<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    before: (middleware: Array<MiddlewareFunction<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    onError: (middleware: Array<MiddlewareFunction<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
  }

  // Used to assemble similar heidi routes into a router.
  interface HeidiRouter<T, R, C extends Context = Context>
    // able to assign middleware at the router level, runs before and after any handler logic, wraps handler logic.
    extends ExtendableMiddyHandler<T, R, C> {
    routes: Array<{ name: string; route: Heidi<T, R, C> }>; // Array of routes
    metaData?: HeidiMetadata; // Metadata for the router, useful in configuration.

    getRoute(name: string): Heidi<T, R, C> | undefined; // Get a specific route by name
    getAllRoutes(): Array<Heidi<T, R, C>>; // Get all routes
    matchRoute(recordOrEvent: T): Heidi<T, R, C> | undefined; // Match a record to a route
    addRoute(name: string, route: Heidi<T, R, C>): void; // Add a new route
    // Metadata for the router, useful in configuration.
    setMetaData(metaData: HeidiMetadata): this;

    use: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    after: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    before: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    onError: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
  }

  type ExtendableHeidi<T, R, C extends Context> = RenameKeys<
    Pick<
      Heidi<T, R, C>, // only contains the static attributes of heidi, not the wrapper functionality.
      | "config"
      | "configure"
      | "metaData"
      | "setMetaData"
      | "templates"
      | "useTemplate"
      | "use" // useTemplate makes the template inheritable
      | "after"
      | "before"
      | "onError"
    >,
    {
      // rename these super attributes to avoid conflicts with the Heidi interface.
      // allows the template to be used the same as a heidi instance to the end user, while allowing for
      // different implementations of these methods.
      ["setMetaData"]: "super_setMetaData";
      ["useTemplate"]: "super_useTemplate";
      ["configure"]: "super_configure";
      ["setCustomMatcher"]: "super_setCustomMatcher";
      ["use"]: "super_use";
      ["after"]: "super_after";
      ["before"]: "super_before";
      ["onError"]: "super_onError";
    }
  >;

  // template is just Heidi with the static attributes of heidi, not the wrapper functionality.
  // This is used to create a template that can be used to create new Heidi instances easily and repeatably.
  interface HeidiTemplate<T, R, C extends Context>
    extends ExtendableHeidi<T, R, C> {
    uses: Array<MiddlewareObject<T, R, C>>;
    afters: Array<MiddlewareFunction<T, R, C>>;
    befores: Array<MiddlewareFunction<T, R, C>>;
    onErrors: Array<MiddlewareFunction<T, R, C>>;
    templates: Array<HeidiTemplate<T, R, C>>; // allows for nested templates

    setMetaData(metaData: HeidiMetadata): this; // allows us to set metadata on the template
    configure(config: $MAP_CONFIG_TO_RECORD<T>): this; // implement mapping logic
    useTemplate(template: Array<HeidiTemplate<T, R, C>>): this;

    use: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    after: (middleware: Array<MiddlewareFunction<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    before: (middleware: Array<MiddlewareFunction<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    onError: (middleware: Array<MiddlewareFunction<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
  }
}
