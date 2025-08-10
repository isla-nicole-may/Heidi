import { Context } from "aws-lambda";
import { MiddlewareObject, Middy } from "middy";
import { heidi } from "./namespace";
import middy from "middy";

function heidiRouterWrapper<T, R, C extends Context>(): heidi.HeidiRouter<
  T,
  R,
  C
> {
  // the handler fuctionality is of limited consequence here, we just need to return a middy instance.
  // the router's functionality is to assemble routes and apply global middleware to them.
  // as well as perform route matching.
  const handler = () => true;
  const middyHandler = middy(handler) as Middy<T, R, C>;
  // minise middy to its extendable handler functionality.
  const extendableMiddyHandler: heidi.ExtendableMiddyHandler<T, R, C> = {
    super_after: middyHandler.after,
    super_before: middyHandler.before,
    super_onError: middyHandler.onError,
    super_use: middyHandler.use,
  };

  return extendableMiddyHandler as heidi.HeidiRouter<T, R, C>;
}

export function heidiRouter<T = any, R = any, C extends Context = Context>(
  routes: Array<{ name: string; route: heidi.Heidi<T, R, C> }>
): heidi.HeidiRouter<T, R, C> {
  const heidiRouterInstance = heidiRouterWrapper<T, R, C>();

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
    route: heidi.Heidi<T, R, C>
  ) => {
    heidiRouterInstance.routes.push({ name, route });
  };

  heidiRouterInstance.setMetaData = (metaData: heidi.HeidiMetadata) => {
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

  heidiRouterInstance.before = (
    middlewares: Array<MiddlewareObject<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_before)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      this.instance.super_before(middleware);
    return this;
  };

  heidiRouterInstance.after = (
    middlewares: Array<MiddlewareObject<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_after)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares) this.instance.super_after(middleware);
    return this;
  };

  heidiRouterInstance.onError = (
    middlewares: Array<MiddlewareObject<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!this.instance.super_onError)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      this.instance.super_onError(middleware);
    return this;
  };

  return heidiRouterInstance as heidi.HeidiRouter<T, R, C>;
}
