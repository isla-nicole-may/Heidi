import typia from "typia";
import Ajv from "ajv";
export function matchEventToConfig(config, event) {
    const ajv = new Ajv();
    const schema = generateEventConfigSchema(config);
    const validate = ajv.compile(schema);
    const valid = validate(event);
    return valid;
}
function generateEventConfigSchema(config) {
    const schema = {
        type: "object",
        properties: config,
        required: Object.keys(config),
        additionalProperties: true,
    };
    return schema;
}
function extrapolateEvent(event) {
    if ("records" in event)
        return event.records;
    return event;
}
export function deQueueEvent(event) {
    const extrapolatedEvent = extrapolateEvent(event);
    if (extrapolatedEvent instanceof Array)
        return extrapolatedEvent;
    return [extrapolatedEvent];
}
export function matchEventToRoute(event, config) {
    const testEvent = typia.createIs();
    const isEvent = testEvent(event);
    if (!isEvent)
        return false;
    return matchEventToConfig(config, event);
}
//# sourceMappingURL=eventTools.js.map