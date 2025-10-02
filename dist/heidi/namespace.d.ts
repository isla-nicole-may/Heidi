import { Middy, MiddlewareFunction } from "middy";
import { Context } from "aws-lambda";
import { $EventConfig, RenameKeys } from "./eventTools";
export declare namespace heidi {
    type HeidiMetadata = Context & {
        name: string;
        description: string;
        version: string;
    };
    type ExtendableMiddyHandler<T, R, C extends Context> = RenameKeys<Pick<Middy<T, R, C>, "after" | "before" | "onError" | "use">, {
        ["use"]: "super_use";
        ["after"]: "super_after";
        ["before"]: "super_before";
        ["onError"]: "super_onError";
    }>;
    interface Heidi<T, R, C extends Context = Context> extends ExtendableMiddyHandler<T, R, C> {
        config: $EventConfig<T>;
        metaData: HeidiMetadata;
        templates?: Array<HeidiTemplate<T, R, C>>;
        handleRequest(event: T): Promise<any>;
        configure(config: $EventConfig<T>): this;
        setMetaData(metaData: Partial<HeidiMetadata>): this;
        useTemplate(template: Array<HeidiTemplate<T, R, C>>): this;
        matchRoute(record: T): boolean;
        after: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
        before: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
        onError: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
    }
    interface HeidiRouter<T, R, C extends Context = Context> extends ExtendableMiddyHandler<T, R, C> {
        handleRequest: (recordOrEvent: T) => Promise<any>;
        routes: Array<Heidi<T, R, C>>;
        metaData?: HeidiMetadata;
        getAllRoutes(): Array<Heidi<T, R, C>>;
        matchRoute(recordOrEvent: T): Heidi<T, R, C> | undefined;
        addRoute(route: Heidi<T, R, C>): void;
        setMetaData(metaData: HeidiMetadata): this;
        after: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
        before: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
        onError: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
    }
    type ExtendableHeidi<T, R, C extends Context> = RenameKeys<Pick<Heidi<T, R, C>, // only contains the static attributes of heidi, not the wrapper functionality.
    "config" | "configure" | "metaData" | "setMetaData" | "templates" | "useTemplate" | "after" | "before" | "onError">, {
        ["setMetaData"]: "super_setMetaData";
        ["useTemplate"]: "super_useTemplate";
        ["configure"]: "super_configure";
        ["setCustomMatcher"]: "super_setCustomMatcher";
        ["use"]: "super_use";
        ["after"]: "super_after";
        ["before"]: "super_before";
        ["onError"]: "super_onError";
    }>;
    interface HeidiTemplate<T, R, C extends Context> extends ExtendableHeidi<T, R, C> {
        afters: Array<MiddlewareFunction<T, R, C>>;
        befores: Array<MiddlewareFunction<T, R, C>>;
        onErrors: Array<MiddlewareFunction<T, R, C>>;
        templates: Array<HeidiTemplate<T, R, C>>;
        setMetaData(metaData: HeidiMetadata): this;
        configure(config: $EventConfig<T>): this;
        useTemplate(template: Array<HeidiTemplate<T, R, C>>): this;
        after: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
        before: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
        onError: (middleware: Array<MiddlewareFunction<T, R, C>>) => this;
    }
}
//# sourceMappingURL=namespace.d.ts.map