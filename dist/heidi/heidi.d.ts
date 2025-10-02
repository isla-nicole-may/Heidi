import { Context } from "aws-lambda";
import { heidi } from "./namespace";
/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export declare function heidi<T = any, R = any, C extends Context = Context>(handler: (event: T) => Promise<R> | R): heidi.Heidi<T, R, C>;
//# sourceMappingURL=heidi.d.ts.map