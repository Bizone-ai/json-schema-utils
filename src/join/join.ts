import { TypeSchema } from "../types/TypeSchema";
import { cleanParsedSchemaProperty, ParsedSchemaProperty } from "../parse/ParsedSchema";

export type PathDescriptor = {
  targetPath: string;
  type: TypeSchema;
};

export type JoinOptions = {
  draft?: string;
};

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * Generate a JSON Schema from a list of PathDescriptors
 * @param pathsDescriptors List of paths
 * @param options schema generation options
 */
export const join = (pathsDescriptors: PathDescriptor[], options: JoinOptions = {}): TypeSchema => {
  const schema: any = {
    $schema: options.draft ?? "http://json-schema.org/draft-07/schema#",
    type: "object",
  };
  const sorted = pathsDescriptors
    .slice()
    .filter(d => d.targetPath)
    .sort((a, b) => a.targetPath.localeCompare(b.targetPath));

  for (const pd of sorted) {
    const parts = pd.targetPath
      .replace(/^\./, "")
      .replace(/\[\d+]/g, "[]")
      .split(".");
    const type = cleanParsedSchemaProperty(pd.type as ParsedSchemaProperty);
    let container = schema;
    while (parts.length > 0 && parts[0].length > 0) {
      const parent = parts.shift() as string;
      if ((container.type === "object" || !container.type) && !container.properties) {
        // lazy create - if paths were sorted it should have been created already
        container.properties = {};
      }
      // if an *item* of an Array
      if (parent.endsWith("[]")) {
        // TODO: it might end with several [] (e.g. [][]), in that case we need to loop this behavior
        const parentArray = parent.replace(/(\[])+$/, "");
        if (parentArray) {
          if (!container.properties[parentArray]) {
            // lazy create - if paths were sorted it should have been created already
            container.properties[parentArray] = { type: "array", items: type };
          } else if (!container.properties[parentArray].items) {
            if (!Object.isExtensible(container.properties[parentArray])) {
              if (!Object.isExtensible(container.properties)) {
                container.properties = cleanParsedSchemaProperty(container.properties);
              }
              container.properties[parentArray] = cleanParsedSchemaProperty(container.properties[parentArray]);
            }
            // remove properties if created, now converted to array
            delete container.properties[parentArray].properties;
            // lazy create - if paths were sorted it should have been created already
            container.properties[parentArray].type = "array";
            container.properties[parentArray].items = type;
          }
          if (!Object.isExtensible(container.properties[parentArray].items)) {
            if (!Object.isExtensible(container.properties[parentArray])) {
              if (!Object.isExtensible(container.properties)) {
                container.properties = cleanParsedSchemaProperty(container.properties);
              }
              container.properties[parentArray] = cleanParsedSchemaProperty(container.properties[parentArray]);
            }
            container.properties[parentArray].items = cleanParsedSchemaProperty(
              container.properties[parentArray].items,
            );
          }
          container = container.properties[parentArray].items;
        } else {
          // if no parent, it means that the root schema is the parent array
          // remove properties if created, now converted to array
          if (schema.properties) {
            delete schema.properties;
          }
          // lazy create - if paths were sorted it should have been created already
          if (!container.items) {
            container.type = "array";
            container.items = type;
            if (!Object.isExtensible(container.items)) {
              container.items = cleanParsedSchemaProperty(container.items);
            }
          }
          container = container.items;
        }
      } else {
        if (!container.properties[parent]) {
          // lazy create - if paths were sorted it should have been created already
          container.properties[parent] = pd.type ? type : { type: "object", additionalProperties: false };
        }
        if (!Object.isExtensible(container.properties[parent])) {
          if (!Object.isExtensible(container.properties)) {
            container.properties = cleanParsedSchemaProperty(container.properties);
          }
          container.properties[parent] = cleanParsedSchemaProperty(container.properties[parent]);
        }
        container = container.properties[parent];
      }
    }
    if (container) {
      if (hasOwn.call(container, "path")) {
        delete container.path;
      }
      if (hasOwn.call(container, "required") && !Array.isArray(container.required)) {
        delete container.required;
      }
      container = Object.assign({}, container, { type: "object" }, type);
    }
  }
  return schema;
};
