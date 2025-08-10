import { Context } from "aws-lambda";
import { MiddlewareObject } from "middy";
import { heidi } from "./namespace";

function heidiTemplateWrapper<T, R, C extends Context>(): heidi.HeidiTemplate<
  T,
  R,
  C
> {
  // return an empty HeidiTemplate instance
  return {} as heidi.HeidiTemplate<T, R, C>;
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
>(): heidi.HeidiTemplate<T, R, C> {
  const heidiInstance = heidiTemplateWrapper<T, R, C>();

  heidiInstance.configure = (config) => {
    const newHeidiInstance = Object.assign(heidiInstance, { config });
    this.heidiInstance = newHeidiInstance; // Assuming heidiInstance has a config property
    return this;
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

  return this.heidiInstance as heidi.HeidiTemplate<T, R, C>; // does not include heidi handler functionality, only the template functionality.
}
