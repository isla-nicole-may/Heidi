import { Context } from "aws-lambda";
import middy, { Middy, MiddlewareFunction } from "middy";
import { heidi } from "./namespace";
import { $EventConfig, matchEventToRoute } from "./eventTools";

/**
 * Minimises the middy handler and casts it's type as the extendable
 * heidi interface.
 */
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
export function heidi<T = any , R = any, C extends Context = Context>(
  handler: (event: T) => Promise<R> | R
): heidi.Heidi<T, R, C> {
  const instance = middy(handler);
  const wrappedInstance = heidiWrapper<T, R, C>(instance as Middy<T, R, C>);

  wrappedInstance.metaData = {} as heidi.HeidiMetadata; // Initialize metadata};
  wrappedInstance.templates = []; // Initialize templates
  wrappedInstance.config = {} as $EventConfig<T>; // Initialize config

  //let heidiObj = new CHeidi<T, R, C>(handler, wrappedInstance);

  wrappedInstance.handleRequest = async (event: T) => {
    return instance(event, wrappedInstance.metaData, () => {});
  }

  wrappedInstance.configure = (config: $EventConfig<T>) => {
    wrappedInstance.config = config; // Assuming heidiInstance has a config property
    return wrappedInstance;
  };

  wrappedInstance.matchRoute = (recordOrEvent: T) => {
    return matchEventToRoute(recordOrEvent, wrappedInstance.config);
  };

  wrappedInstance.setMetaData = (metaData: Partial<heidi.HeidiMetadata>) => {

    const defaultMetaData: heidi.HeidiMetadata = {
      name: "",
      description: "",
      version: "",
      functionName: metaData.functionName || "",
      functionVersion: metaData.functionVersion || "",
      invokedFunctionArn: metaData.invokedFunctionArn || "",
      memoryLimitInMB: metaData.memoryLimitInMB || "",
      awsRequestId: metaData.awsRequestId || "",
      logGroupName: metaData.logGroupName || "",
      logStreamName: metaData.logStreamName || "",
      getRemainingTimeInMillis: metaData.getRemainingTimeInMillis || (() => 0),
      callbackWaitsForEmptyEventLoop: metaData.callbackWaitsForEmptyEventLoop ?? true,
      done: metaData.done || ((error?: Error, result?: any) => {}),
      fail: metaData.fail || ((error: Error | string) => {}),
      succeed: metaData.succeed || ((messageOrObject: any) => {})
    };

    wrappedInstance.metaData = { ...defaultMetaData, ...metaData };
    return wrappedInstance;
  };

  wrappedInstance.useTemplate = (
    templates: Array<heidi.HeidiTemplate<T, R, C>>
  ) => {
    for (const template of templates) {
      wrappedInstance.before(template.befores);
      wrappedInstance.after(template.afters);
      wrappedInstance.onError(template.onErrors);
      // merge config and metadata
      wrappedInstance.configure({...wrappedInstance.config, ...template.config}); // type needs to change
      if (template.metaData) wrappedInstance.setMetaData({...wrappedInstance.metaData, ...template.metaData});
    }
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
