import { Context } from "aws-lambda";
import { MiddlewareFunction, Middy } from "middy";
import { heidi } from "./namespace";
import middy from "middy";
import { deQueueEvent, ProcessableEvents } from "./eventTools";

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

export function heidiRouter<
  T extends ProcessableEvents = any,
  R = any,
  C extends Context = Context
>(
  routes: Array<heidi.Heidi<T, R, C>>
): heidi.HeidiRouter<T, R, C> {
  let heidiRouterInstance = heidiRouterWrapper<T, R, C>();

  heidiRouterInstance.routes = routes;

  heidiRouterInstance.getAllRoutes = () => {
    return heidiRouterInstance.routes;
  };

  heidiRouterInstance.handleRequest = async (recordOrEvent: T) => {
    const records = deQueueEvent(recordOrEvent);
    for (const record of records) {
      const matchedRoute = heidiRouterInstance.matchRoute(record as T);
      if (matchedRoute) {
        return await matchedRoute.handleRequest(record as T);
      }
    }
  };

  heidiRouterInstance.matchRoute = (recordOrEvent: T) => {
    return heidiRouterInstance.routes.find((route) =>
      route.matchRoute(recordOrEvent)
    );
  };

  heidiRouterInstance.addRoute = (
    route: heidi.Heidi<T, R, C>
  ) => {
    heidiRouterInstance.routes.push(route);
  };

  heidiRouterInstance.setMetaData = (metaData: heidi.HeidiMetadata) => {
    const newHeidiRouterInstance = Object.assign(heidiRouterInstance, {
      metaData,
    });
    heidiRouterInstance = newHeidiRouterInstance; // Assuming heidiRouterInstance has a heidiMetadata property
    return heidiRouterInstance;
  };

  heidiRouterInstance.before = (
    middlewares: Array<MiddlewareFunction<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!heidiRouterInstance.super_before)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      heidiRouterInstance.super_before(middleware);
    return heidiRouterInstance;
  };

  heidiRouterInstance.after = (
    middlewares: Array<MiddlewareFunction<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!heidiRouterInstance.super_after)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      heidiRouterInstance.super_after(middleware);
    return heidiRouterInstance;
  };

  heidiRouterInstance.onError = (
    middlewares: Array<MiddlewareFunction<T, R, C>>
  ) => {
    // assign the middlewares into the super_use function of the middy instance.
    if (!heidiRouterInstance.super_onError)
      throw new Error(
        "super_use is not defined; middy instance may not be initialised correctly."
      );
    for (const middleware of middlewares)
      heidiRouterInstance.super_onError(middleware);
    return heidiRouterInstance;
  };

  return heidiRouterInstance as heidi.HeidiRouter<T, R, C>;
}
