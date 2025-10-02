import { Context } from "aws-lambda";
import { heidi as heidiTypes } from "./namespace";
/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export declare function heidiTemplate<T = any, R = any, C extends Context = Context>(): heidiTypes.HeidiTemplate<T, R, C>;
//# sourceMappingURL=template.d.ts.map