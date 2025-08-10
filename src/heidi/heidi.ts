import { Context } from "aws-lambda";
import middy, { Middy, MiddlewareObject } from "middy";
import { $MAP_CONFIG_TO_RECORD } from "../types/handlable";
import { heidi } from "./namespace";

function heidiWrapper<T, R, C extends Context>(
  handler: middy.Middy<T, R, C>
): heidi.Heidi<T, R, C> {
  // minise middy to its extendable handler functionality.
  const extendableMiddyHandler: heidi.ExtendableMiddyHandler<T, R, C> = {
    super_after: handler.after,
    super_before: handler.before,
    super_onError: handler.onError,
    super_use: handler.use,
  };

  return extendableMiddyHandler as heidi.Heidi<T, R, C>;
}

/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export function heidi<T = any, R = any, C extends Context = Context>(
  handler
): heidi.Heidi<T, R, C> {
  const instance = middy<typeof handler, C>(handler);
  const heidiInstance = heidiWrapper<T, R, C>(instance as Middy<T, R, C>);

  heidiInstance.configure = (config: $MAP_CONFIG_TO_RECORD<T>) => {
    const newHeidiInstance = Object.assign(heidiInstance, { config });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a config property
    return this;
  };

  heidiInstance.matchRoute = (record: T) => {
    // TODO: Logic to match the record to the route, useful for routing logic.
    return heidiInstance; // Placeholder, needs actual matching logic
  };

  heidiInstance.setMetaData = (metaData: heidi.HeidiMetadata) => {
    const newHeidiInstance = Object.assign(heidiInstance, { metaData });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a heidiMetadata property
    return this;
  };

  heidiInstance.useTemplate = (
    templates: Array<heidi.HeidiTemplate<T, R, C>>
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
  return this.heidiInstance as heidi.Heidi<T, R, C>;
}
