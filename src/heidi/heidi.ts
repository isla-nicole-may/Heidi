import { Context } from "aws-lambda";
import middy, { Middy, MiddlewareObject, MiddlewareFunction } from "middy";
import { $MAP_CONFIG_TO_RECORD, HandleableEvents, HandleableRecords } from "../types/handlable";
import { heidi } from "./namespace";
import { matchRoute } from "../helpers/matcher";

/**
 * Minimises the middy handler and casts it's type as the extendable
 * heidi interface.
 */
function heidiWrapper<T extends HandleableEvents | HandleableRecords, R, C extends Context>(
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
export function heidi<T extends HandleableEvents | HandleableRecords = any , R = any, C extends Context = Context>(
  handler
): heidi.Heidi<T, R, C> {
  const instance = middy(handler) as Middy<T, R, C>;
  const wrappedInstance = heidiWrapper<T, R, C>(instance as Middy<T, R, C>);

  wrappedInstance.metaData = {} as heidi.HeidiMetadata; // Initialize metadata};
  wrappedInstance.templates = []; // Initialize templates
  wrappedInstance.config = {} as $MAP_CONFIG_TO_RECORD<T>; // Initialize config

  //let heidiObj = new CHeidi<T, R, C>(handler, wrappedInstance);

  wrappedInstance.configure = (config: $MAP_CONFIG_TO_RECORD<T>) => {
    wrappedInstance.config = config; // Assuming heidiInstance has a config property
    return wrappedInstance;
  };

  wrappedInstance.matchRoute = (recordOrEvent: T) => {
    return matchRoute(recordOrEvent, wrappedInstance.config);
  };

  wrappedInstance.setMetaData = (metaData: heidi.HeidiMetadata) => {
    wrappedInstance.metaData = metaData; // Assuming heidiInstance has a heidiMetadata property
    return wrappedInstance;
  };

  wrappedInstance.useTemplate = (
    templates: Array<heidi.HeidiTemplate<T, R, C>>
  ) => {
    for (const template of templates) {
      wrappedInstance.use(template.uses);
      wrappedInstance.configure({...wrappedInstance.config, ...template.config}); // type needs to change
      if (template.metaData) wrappedInstance.setMetaData({...wrappedInstance.metaData, ...template.metaData});
    }
    return wrappedInstance;
  };

  wrappedInstance.use = (middlewares: Array<MiddlewareObject<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!wrappedInstance.super_use)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) wrappedInstance.super_use(middleware);
    return wrappedInstance;
  };

  wrappedInstance.before = (
    middlewares: Array<MiddlewareFunction<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!wrappedInstance.super_before)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      wrappedInstance.super_before(middleware);
    return wrappedInstance;
  };

  wrappedInstance.after = (middlewares: Array<MiddlewareFunction<T, R, C>>) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!wrappedInstance.super_after)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      wrappedInstance.super_after(middleware);
    return wrappedInstance;
  };

  wrappedInstance.onError = (
    middlewares: Array<MiddlewareFunction<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!wrappedInstance.super_onError)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      wrappedInstance.super_onError(middleware);
    return wrappedInstance;
  };

  return wrappedInstance;
}
