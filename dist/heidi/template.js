function heidiTemplateWrapper() {
    // return an empty HeidiTemplate instance
    return {};
}
/**
 * Middy factory function. Use it to wrap your existing handler to enable middlewares on it.
 * @param  {function} handler - your original AWS Lambda function
 * @return {middy} - a `middy` instance
 */
export function heidiTemplate() {
    const heidiInstance = heidiTemplateWrapper();
    heidiInstance.befores = []; // Initialize befores
    heidiInstance.afters = []; // Initialize afters
    heidiInstance.onErrors = []; // Initialize onErrors
    heidiInstance.templates = []; // Initialize templates
    heidiInstance.config = {}; // Initialize config
    heidiInstance.metaData = {}; // Initialize metadata
    heidiInstance.configure = (config) => {
        heidiInstance.config = config;
        return heidiInstance;
    };
    heidiInstance.setMetaData = (metaData) => {
        heidiInstance.metaData = metaData;
        return heidiInstance;
    };
    heidiInstance.useTemplate = (templates) => {
        for (const template of templates) {
            heidiInstance.templates.push(template);
            heidiInstance.before([...heidiInstance.befores, ...template.befores]);
            heidiInstance.after([...heidiInstance.afters, ...template.afters]);
            heidiInstance.onError([...heidiInstance.onErrors, ...template.onErrors]);
            const metaData = template.metaData;
            heidiInstance.configure({ ...template.config, ...heidiInstance.config }); // type needs to change
            if (metaData)
                heidiInstance.setMetaData({ ...heidiInstance.metaData, ...metaData });
        }
        return heidiInstance;
    };
    heidiInstance.before = (middlewares) => {
        heidiInstance.befores.push(...middlewares);
        return heidiInstance;
    };
    heidiInstance.after = (middlewares) => {
        heidiInstance.afters.push(...middlewares);
        return heidiInstance;
    };
    heidiInstance.onError = (middlewares) => {
        heidiInstance.onErrors.push(...middlewares);
        return heidiInstance;
    };
    return heidiInstance;
}
//# sourceMappingURL=template.js.map