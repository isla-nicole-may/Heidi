import { Context } from "aws-lambda";
import { MiddlewareObject } from "middy";
import { heidi } from "./namespace";

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

  return heidiRouterInstance as heidi.HeidiRouter<T, R, X, C>;
}
