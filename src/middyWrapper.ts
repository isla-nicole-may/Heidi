import { Context } from "aws-lambda";
import middy, { MiddlewareObject, Middy } from "middy";
import { HeidiMetadata, RenameKeys } from "./types";
import { HeidiTemplate } from "./template";
import { $MAP_CONFIG_TO_EVENT } from "./recordConfigs";
import { HeidiMatcher } from "./helpers";

/**
 * TO DO:
 * * we have extended use but not onError, before, or After hooks,
 * need to extend those as well.
 *
 */

declare namespace heidi {
  // Heidi interface extends Middy, allowing for middleware and handler logic.
  interface Heidi<T /*event*/, R, X, C extends Context = Context>
    extends RenameKeys<
      Pick<Middy<T, R, C>, "after" | "before" | "onError" | "use">,
      {
        ["use"]: "super_use";
        ["after"]: "super_after";
        ["before"]: "super_before";
        ["onError"]: "super_onError";
      }
    > {
    config: $MAP_CONFIG_TO_EVENT<T>; // Configuration for the Heidi instance, maps to the event type.
    metaData: HeidiMetadata; // Metadata for the router, useful in configuration.
    templates?: Array<HeidiTemplate<T, R, X, C>>; // Optional template for the route, allows for shared middleware and validation.
    // use, before, after, onError methods are inherited from Middy
    configure(config: T extends never ? X : $MAP_CONFIG_TO_EVENT<T>): this; // implement mapping logic
    setMetaData(metaData: HeidiMetadata): this;
    setCustomMatcher(matchers: Array<HeidiMatcher>): this; // allows us to set custom matchers for the route, useful for routing logic.
    // Assign reusable templates to the route, allows for shared middleware and validation, easier faster production.
    useTemplate(template: Array<HeidiTemplate<T, R, X, C>>): this;
    // Match event to the route, useful for routing logic.
    matchRoute(record: T): this | undefined;

    // Make custom wrapper of use functionality that allows us to still return the heidi instance, not the middy instance;
    // make use of the super_use cast attribute.
    use: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    after: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    before: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    onError: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
  }

  // Used to assemble similar heidi routes into a router.
  interface HeidiRouter<T, R, X = never, C extends Context = Context>
    // able to assign middleware at the router level, runs before and after any handler logic, wraps handler logic.
    extends RenameKeys<
      Pick<Middy<T, R, C>, "after" | "before" | "onError" | "use">,
      {
        ["use"]: "super_use";
        ["after"]: "super_after";
        ["before"]: "super_before";
        ["onError"]: "super_onError";
      }
    > {
    routes: Array<{ name: string; route: Heidi<T, R, X, C> }>; // Array of routes
    metaData?: HeidiMetadata; // Metadata for the router, useful in configuration.

    getRoute(name: string): Heidi<T, R, X, C> | undefined; // Get a specific route by name
    getAllRoutes(): Array<Heidi<T, R, X, C>>; // Get all routes
    matchRoute(record: T): Heidi<T, R, X, C> | undefined; // Match a record to a route
    addRoute(name: string, route: Heidi<T, R, X, C>): void; // Add a new route
    // Metadata for the router, useful in configuration.
    setMetaData(metaData: HeidiMetadata): this;

    use: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    after: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    before: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    onError: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
  }

  // template is just Heidi with the static attributes of heidi, not the wrapper functionality.
  // This is used to create a template that can be used to create new Heidi instances easily and repeatably.
  interface $HEIDI_TEMPLATE_INTERNAL<T, R, X, C extends Context>
    extends RenameKeys<
      Pick<
        Heidi<T, R, X, C>, // only contains the static attributes of heidi, not the wrapper functionality.
        | "config"
        | "configure"
        | "metaData"
        | "setMetaData"
        | "useTemplate"
        | "setCustomMatcher"
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
    > {
    setMetaData(metaData: HeidiMetadata): this; // allows us to set metadata on the template
    configure(config: T extends never ? X : $MAP_CONFIG_TO_EVENT<T>): this; // implement mapping logic
    useTemplate(template: Array<HeidiTemplate<T, R, X, C>>): this;
    setCustomMatcher(matchers: Array<HeidiMatcher>): this; // allows us to set custom matchers for the template, useful for routing logic.
    // allows us to extract template attributes to assign to new Heidi instances.
    getConfig: () => T extends never ? X : $MAP_CONFIG_TO_EVENT<T>; // returns the config of the template
    getMetadata: () => HeidiMetadata | undefined; // returns the metadata of the template
    getMiddleware: () => Array<MiddlewareObject<any, any, Context>>; // need to resolve type from middy package

    use: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    after: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    before: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
    onError: (middleware: Array<MiddlewareObject<T, R, C>>) => this; // allows us to use middleware on the route, useful for shared middleware
  }

  export type HeidiTemplate<T /** event */, R, X, C extends Context> = Pick<
    $HEIDI_TEMPLATE_INTERNAL<T, R, X, C>,
    | "setMetaData"
    | "getMetadata"
    | "configure"
    | "getConfig"
    | "getMiddleware"
    | "use"
    | "after"
    | "before"
    | "onError"
    | "useTemplate"
    | "setCustomMatcher"
  >;
}

function heidiWrapper<T, R, X, C extends Context>(
  handler: middy.Middy<T, R, C>
): heidi.Heidi<T, R, X, C> {
  // This function is a factory for creating a Heidi instance.
  // It returns an instance of Middy with the Heidi interface.
  return undefined as unknown as heidi.Heidi<T, R, X, C>;
}

function heidiTemplateWrapper<
  T,
  R,
  X,
  C extends Context
>(): heidi.HeidiTemplate<T, R, X, C> {
  // This function is a factory for creating a Heidi instance.
  // It returns an instance of Middy with the Heidi interface.
  return undefined as unknown as heidi.HeidiTemplate<T, R, X, C>;
}

function heidiRouterWrapper<T, R, X, C extends Context>(): heidi.HeidiRouter<
  T,
  R,
  X,
  C
> {
  // This function is a factory for creating a Heidi instance.
  // It returns an instance of Middy with the Heidi interface.
  return undefined as unknown as heidi.HeidiRouter<T, R, X, C>;
}

/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export function heidi<T = any, R = any, X = never, C extends Context = Context>(
  handler
): heidi.Heidi<T, R, X, C> {
  const instance = middy<typeof handler, C>(handler);
  const heidiInstance = heidiWrapper<T, R, X, C>(instance as Middy<T, R, C>);

  heidiInstance.configure = (
    config: T extends never ? X : $MAP_CONFIG_TO_EVENT<T>
  ) => {
    const newHeidiInstance = Object.assign(heidiInstance, { config });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a config property
    return this;
  };

  heidiInstance.setCustomMatcher = (matchers: Array<HeidiMatcher>) => {
    if (this.customMatchers) this.customMatchers = [];
    this.customMatchers.push(...matchers);
    return this;
  };

  heidiInstance.matchRoute = (record: T) => {
    // TODO: Logic to match the record to the route, useful for routing logic.
    return heidiInstance; // Placeholder, needs actual matching logic
  };

  heidiInstance.setMetaData = (metaData: HeidiMetadata) => {
    const newHeidiInstance = Object.assign(heidiInstance, { metaData });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a heidiMetadata property
    return this;
  };

  heidiInstance.useTemplate = (
    templates: Array<heidi.HeidiTemplate<T, R, X, C>>
  ) => {
    for (const template of templates) {
      const middlewares = template.getMiddleware();
      heidiInstance.use(middlewares);
      const metaData = template.getMetadata();
      heidiInstance.configure(template.getConfig()); // type needs to change
      if (metaData) heidiInstance.setMetaData(metaData);
    }
    return this;
  };

  heidiInstance.use = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_use)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) this.instance.super_use(middleware);
    return this;
  };

  heidiInstance.before = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_before)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      this.instance.super_before(middleware);
    return this;
  };

  heidiInstance.after = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_after)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) this.instance.super_after(middleware);
    return this;
  };

  heidiInstance.onError = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_onError)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      this.instance.super_onError(middleware);
    return this;
  };
  return this.heidiInstance as heidi.Heidi<T, R, X, C>;
}

/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export function heidiTemplate<
  T = any,
  R = any,
  X = never,
  C extends Context = Context
>(): heidi.HeidiTemplate<T, R, X, C> {
  const heidiInstance = heidiTemplateWrapper<T, R, X, C>();

  heidiInstance.configure = (config) => {
    const newHeidiInstance = Object.assign(heidiInstance, { config });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a config property
    return this;
  };

  heidiInstance.setMetaData = (metaData: HeidiMetadata) => {
    const newHeidiInstance = Object.assign(heidiInstance, { metaData });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a heidiMetadata property
    return this;
  };

  heidiInstance.useTemplate = (
    templates: Array<heidi.HeidiTemplate<T, R, X, C>>
  ) => {
    for (const template of templates) {
      const middlewares = template.getMiddleware();
      heidiInstance.use(middlewares);
      const metaData = template.getMetadata();
      heidiInstance.configure(template.getConfig()); // type needs to change
      if (metaData) heidiInstance.setMetaData(metaData);
    }
    return this;
  };

  heidiInstance.setCustomMatcher = (matchers: Array<HeidiMatcher>) => {
    this.super_setCustomMatcher(matchers);
    return this;
  };

  heidiInstance.use = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_use)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) this.instance.super_use(middleware);
    return this;
  };

  heidiInstance.before = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_before)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      this.instance.super_before(middleware);
    return this;
  };

  heidiInstance.after = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_after)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) this.instance.super_after(middleware);
    return this;
  };

  heidiInstance.onError = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_onError)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      this.instance.super_onError(middleware);
    return this;
  };

  return this.heidiInstance as heidi.HeidiTemplate<T, R, X, C>; // does not include heidi handler functionality, only the template functionality.
}

export function heidiRouter<
  T = any,
  R = any,
  X = never,
  C extends Context = Context
>(
  routes: Array<{ name: string; route: heidi.Heidi<T, R, X, C> }>
): heidi.HeidiRouter<T, R, X, C> {
  const heidiRouterInstance = heidiRouterWrapper<T, R, X, C>();

  heidiRouterInstance.routes = routes;

  heidiRouterInstance.getRoute = (name: string) => {
    return heidiRouterInstance.routes.find((route) => route.name === name)
      ?.route;
  };

  heidiRouterInstance.getAllRoutes = () => {
    return heidiRouterInstance.routes.map((route) => route.route);
  };

  heidiRouterInstance.matchRoute = (record: T) => {
    return heidiRouterInstance.routes.find((route) =>
      route.route.matchRoute(record)
    )?.route;
  };

  heidiRouterInstance.addRoute = (
    name: string,
    route: heidi.Heidi<T, R, X, C>
  ) => {
    heidiRouterInstance.routes.push({ name, route });
  };

  heidiRouterInstance.setMetaData = (metaData: HeidiMetadata) => {
    const newHeidiRouterInstance = Object.assign(heidiRouterInstance, {
      metaData,
    });
    this.heidiRouterInstance = newHeidiRouterInstance; // Assuming heidiRouterInstance has a heidiMetadata property
    return this;
  };

  heidiRouterInstance.use = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_use)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) this.instance.super_use(middleware);
    return this;
  };

  return heidiRouterInstance as heidi.HeidiRouter<T, R, X, C>;
}
