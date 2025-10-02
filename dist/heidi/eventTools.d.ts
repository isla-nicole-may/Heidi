import { APIGatewayEvent, DynamoDBStreamEvent, S3Event, SNSEvent, SQSEvent, EventBridgeEvent, CloudFrontEvent } from "aws-lambda";
import { DynamoDBRecord, S3EventRecord, SNSEventRecord, SQSRecord } from "aws-lambda";
export type RenameKeys<T, Mapping extends Record<string, string>> = {
    [K in keyof T as K extends keyof Mapping ? Mapping[K] : K]: T[K];
};
type Keys<T> = keyof T extends string ? keyof T : never;
type $GenericAllowedKeys<T> = Keys<T> extends string ? Keys<T> : never;
export type $EventConfigFull<T> = {
    [key in $GenericAllowedKeys<T>]: any;
};
export type $EventConfig<T> = Partial<$EventConfigFull<T>>;
export declare function matchEventToConfig<T>(config: $EventConfig<T>, event: T): boolean;
export type ProcessableEvents = APIGatewayEvent | DynamoDBStreamEvent | EventBridgeEvent<any, any> | S3Event | SNSEvent | SQSEvent | CloudFrontEvent;
export type ProcessableRecords = DynamoDBRecord | S3EventRecord | SNSEventRecord | SQSRecord;
export declare function deQueueEvent(event: ProcessableEvents): (ProcessableEvents | ProcessableRecords)[];
export declare function matchEventToRoute<J, T>(event: unknown, config: $EventConfig<T>): boolean;
export {};
//# sourceMappingURL=eventTools.d.ts.map