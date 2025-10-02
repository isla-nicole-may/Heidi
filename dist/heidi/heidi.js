import middy from "middy";
import { matchEventToRoute } from "./eventTools";
/**
 * Minimises the middy handler and casts it's type as the extendable
 * heidi interface.
 */
function heidiWrapper(handler) {
    // minise middy to its extendable handler functionality.
    const extendableMiddyHandler = {
        super_after: handler.after,
        super_before: handler.before,
        super_onError: handler.onError,
        super_use: handler.use,
    };
    return extendableMiddyHandler;
}
/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export function heidi(handler) {
    const instance = middy(handler);
    const wrappedInstance = heidiWrapper(instance);
    wrappedInstance.metaData = {}; // Initialize metadata};
    wrappedInstance.templates = []; // Initialize templates
    wrappedInstance.config = {}; // Initialize config
    //let heidiObj = new CHeidi<T, R, C>(handler, wrappedInstance);
    wrappedInstance.handleRequest = async (event) => {
        return instance(event, wrappedInstance.metaData, () => { });
    };
    wrappedInstance.configure = (config) => {
        wrappedInstance.config = config; // Assuming heidiInstance has a config property
        return wrappedInstance;
    };
    wrappedInstance.matchRoute = (recordOrEvent) => {
        return matchEventToRoute(recordOrEvent, wrappedInstance.config);
    };
    wrappedInstance.setMetaData = (metaData) => {
        const defaultMetaData = {
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
            done: metaData.done || ((error, result) => { }),
            fail: metaData.fail || ((error) => { }),
            succeed: metaData.succeed || ((messageOrObject) => { })
        };
        wrappedInstance.metaData = { ...defaultMetaData, ...metaData };
        return wrappedInstance;
    };
    wrappedInstance.useTemplate = (templates) => {
        for (const template of templates) {
            wrappedInstance.before(template.befores);
            wrappedInstance.after(template.afters);
            wrappedInstance.onError(template.onErrors);
            // merge config and metadata
            wrappedInstance.configure({ ...wrappedInstance.config, ...template.config }); // type needs to change
            if (template.metaData)
                wrappedInstance.setMetaData({ ...wrappedInstance.metaData, ...template.metaData });
        }
        return wrappedInstance;
    };
    wrappedInstance.before = (middlewares) => {
        // assign the middlewares into the super_use function of the middy instance.
        if (!wrappedInstance.super_before)
            throw new Error("super_use is not defined; middy instance may not be initialised correctly.");
        for (const middleware of middlewares)
            wrappedInstance.super_before(middleware);
        return wrappedInstance;
    };
    wrappedInstance.after = (middlewares) => {
        // assign the middlewares into the super_use function of the middy instance.
        if (!wrappedInstance.super_after)
            throw new Error("super_use is not defined; middy instance may not be initialised correctly.");
        for (const middleware of middlewares)
            wrappedInstance.super_after(middleware);
        return wrappedInstance;
    };
    wrappedInstance.onError = (middlewares) => {
        // assign the middlewares into the super_use function of the middy instance.
        if (!wrappedInstance.super_onError)
            throw new Error("super_use is not defined; middy instance may not be initialised correctly.");
        for (const middleware of middlewares)
            wrappedInstance.super_onError(middleware);
        return wrappedInstance;
    };
    return wrappedInstance;
}
//# sourceMappingURL=heidi.js.map