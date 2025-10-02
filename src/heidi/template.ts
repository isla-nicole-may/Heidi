import { Context } from "aws-lambda";
import { MiddlewareFunction } from "middy";
import { heidi as heidiTypes } from "./namespace";
import { $EventConfig } from "./eventTools";

function heidiTemplateWrapper<
  T,
  R,
  C extends Context
>(): heidiTypes.HeidiTemplate<T, R, C> {
  // return an empty HeidiTemplate instance
  return {} as heidiTypes.HeidiTemplate<T, R, C>;
}

/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export function heidiTemplate<
  T = any,
  R = any,
  C extends Context = Context
>(): heidiTypes.HeidiTemplate<T, R, C> {
  const heidiInstance = heidiTemplateWrapper<T, R, C>();

  heidiInstance.befores = []; // Initialize befores
  heidiInstance.afters = []; // Initialize afters
  heidiInstance.onErrors = []; // Initialize onErrors

  heidiInstance.templates = []; // Initialize templates
  heidiInstance.config = {} as $EventConfig<T>; // Initialize config
  heidiInstance.metaData = {} as heidiTypes.HeidiMetadata; // Initialize metadata

  heidiInstance.configure = (config) => {
    heidiInstance.config = config;
    return heidiInstance;
  };

  heidiInstance.setMetaData = (metaData: heidiTypes.HeidiMetadata) => {
    heidiInstance.metaData = metaData;
    return heidiInstance;
  };

  heidiInstance.useTemplate = (
    templates: Array<heidiTypes.HeidiTemplate<T, R, C>>
  ) => {
    for (const template of templates) {
      heidiInstance.templates.push(template);
      heidiInstance.before([...heidiInstance.befores, ...template.befores]);
      heidiInstance.after([...heidiInstance.afters, ...template.afters]);
      heidiInstance.onError([...heidiInstance.onErrors, ...template.onErrors]);
      const metaData = template.metaData;
      heidiInstance.configure({ ...template.config, ...heidiInstance.config }); // type needs to change
      if (metaData)
        heidiInstance.setMetaData({ ...heidiInstance.metaData, ...metaData });
    }
    return heidiInstance;
  };

  heidiInstance.before = (middlewares: Array<MiddlewareFunction<T, R, C>>) => {
    heidiInstance.befores.push(...middlewares);
    return heidiInstance;
  };

  heidiInstance.after = (middlewares: Array<MiddlewareFunction<T, R, C>>) => {
    heidiInstance.afters.push(...middlewares);
    return heidiInstance;
  };

  heidiInstance.onError = (middlewares: Array<MiddlewareFunction<T, R, C>>) => {
    heidiInstance.onErrors.push(...middlewares);
    return heidiInstance;
  };

  return heidiInstance;
}
