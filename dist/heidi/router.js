import middy from "middy";
import { deQueueEvent } from "./eventTools";
function heidiRouterWrapper() {
    // the handler fuctionality is of limited consequence here, we just need to return a middy instance.
    // the router's functionality is to assemble routes and apply global middleware to them.
    // as well as perform route matching.
    const handler = () => true;
    const middyHandler = middy(handler);
    // minise middy to its extendable handler functionality.
    const extendableMiddyHandler = {
        super_after: middyHandler.after,
        super_before: middyHandler.before,
        super_onError: middyHandler.onError,
        super_use: middyHandler.use,
    };
    return extendableMiddyHandler;
}
export function heidiRouter(routes) {
    let heidiRouterInstance = heidiRouterWrapper();
    heidiRouterInstance.routes = routes;
    heidiRouterInstance.getAllRoutes = () => {
        return heidiRouterInstance.routes;
    };
    heidiRouterInstance.handleRequest = async (recordOrEvent) => {
        const records = deQueueEvent(recordOrEvent);
        for (const record of records) {
            const matchedRoute = heidiRouterInstance.matchRoute(record);
            if (matchedRoute) {
                return await matchedRoute.handleRequest(record);
            }
        }
    };
    heidiRouterInstance.matchRoute = (recordOrEvent) => {
        return heidiRouterInstance.routes.find((route) => route.matchRoute(recordOrEvent));
    };
    heidiRouterInstance.addRoute = (route) => {
        heidiRouterInstance.routes.push(route);
    };
    heidiRouterInstance.setMetaData = (metaData) => {
        const newHeidiRouterInstance = Object.assign(heidiRouterInstance, {
            metaData,
        });
        heidiRouterInstance = newHeidiRouterInstance; // Assuming heidiRouterInstance has a heidiMetadata property
        return heidiRouterInstance;
    };
    heidiRouterInstance.before = (middlewares) => {
        // assign the middlewares into the super_use function of the middy instance.
        if (!heidiRouterInstance.super_before)
            throw new Error("super_use is not defined; middy instance may not be initialised correctly.");
        for (const middleware of middlewares)
            heidiRouterInstance.super_before(middleware);
        return heidiRouterInstance;
    };
    heidiRouterInstance.after = (middlewares) => {
        // assign the middlewares into the super_use function of the middy instance.
        if (!heidiRouterInstance.super_after)
            throw new Error("super_use is not defined; middy instance may not be initialised correctly.");
        for (const middleware of middlewares)
            heidiRouterInstance.super_after(middleware);
        return heidiRouterInstance;
    };
    heidiRouterInstance.onError = (middlewares) => {
        // assign the middlewares into the super_use function of the middy instance.
        if (!heidiRouterInstance.super_onError)
            throw new Error("super_use is not defined; middy instance may not be initialised correctly.");
        for (const middleware of middlewares)
            heidiRouterInstance.super_onError(middleware);
        return heidiRouterInstance;
    };
    return heidiRouterInstance;
}
//# sourceMappingURL=router.js.map