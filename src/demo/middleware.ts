import { APIGatewayEvent, Context } from "aws-lambda";
import middy from "middy";


export const authorisationMiddleware : middy.MiddlewareFunction<APIGatewayEvent, any, Context> = async (request) => {
    const { event } = request;
    if (!event.headers || event.headers.Authorization !== "Bearer mysecrettoken") {
        throw new Error("Unauthorized");
    }
    // If authorized, proceed
    return;
}

export const loggingMiddleware : middy.MiddlewareFunction<APIGatewayEvent, any, Context> = async (request) => {
    const { event } = request;
    if (!event.headers || event.headers.Authorization !== "Bearer mysecrettoken") {
        throw new Error("Unauthorized");
    }
    // If authorized, proceed
    return;
}