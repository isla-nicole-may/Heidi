import { Context } from "aws-lambda";
import { heidi } from "./namespace";
import { ProcessableEvents } from "./eventTools";
export declare function heidiRouter<T extends ProcessableEvents = any, R = any, C extends Context = Context>(routes: Array<heidi.Heidi<T, R, C>>): heidi.HeidiRouter<T, R, C>;
//# sourceMappingURL=router.d.ts.map