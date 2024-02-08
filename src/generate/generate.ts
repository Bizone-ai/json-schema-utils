import { JsonSchemaType, TypeSchema } from "../types/TypeSchema";
import { areSimilar } from "../utils/areSimilar";

export type GenerateSchemaOptions = {
  /** Determine if an object property is required (always by true or a function for conditional, default is not required) */
  required?: true | ((path: string) => boolean);
};

type AvailableMapTypeSources =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

const TypeMapping: Record<AvailableMapTypeSources, JsonSchemaType | "" | ((value: string) => JsonSchemaType)> = {
  bigint: "integer",
  boolean: "boolean",
  number: (value: string) => (/[.e]/.test(value.toString()) ? "number" : "integer"),
  string: "string",
  symbol: "",
  undefined: "",
  object: "",
  function: "",
};

export const inferJSONSchemaType = (value: any): TypeSchema => {
  const type = typeof value;
  if (type === "string") {
    const typeResult: TypeSchema = { type };
    if (value === "^.*$") {
      typeResult.format = "regex";
    } else if (value === "8.8.8.8") {
      typeResult.format = "ipv4";
    } else if (value === "::1") {
      typeResult.format = "ipv6";
    } else if (value === "https://example.com/path") {
      typeResult.format = "uri";
    } else if (value === "example.com") {
      typeResult.format = "hostname";
    } else if (/^\w+@\w+\.com$/.test(value)) {
      typeResult.format = "email";
    } else if (/^[A-Z\d]{8}-[A-Z\d]{4}-[A-Z\d]{4}-[A-Z\d]{4}-[A-Z\d]{12}$/i.test(value)) {
      typeResult.format = "uuid";
    } else if (/^\d{4}-\d\d-\d\d$/.test(value)) {
      typeResult.format = "date";
    } else if (/^\d\d:\d\d(:\d\d)?(([-+]\d\d:?(\d\d)?)|Z)?$/.test(value)) {
      typeResult.format = "time";
    } else if (/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d\d\d)?)?(([-+]\d\d:?(\d\d)?)|Z)?$/.test(value)) {
      typeResult.format = "date-time";
    }
    if (value.length > 2 && value[0] === "/" && value.at(-1) === "/") {
      typeResult.pattern = value.slice(1, -1);
    }
    return typeResult;
  }
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) return { type: "array" };
  const result = TypeMapping[type];
  if (result) return { type: typeof result === "function" ? (result(value) as JsonSchemaType) : result };
  return { type: "object", additionalProperties: false };
};

/**
 * Generate a JSON Schema from a sample value
 * @param value value to create the schema by
 * @param options schema generation options
 * @param _level internal use (recursion; starts from 0)
 * @param _pointer internal use (recursion; starts from '/')
 */
export const generateJSONSchemaFromValue = (
  value: any,
  options: GenerateSchemaOptions = {},
  _level: number = 0,
  _pointer: string = "",
): TypeSchema => {
  const inferred = inferJSONSchemaType(value);
  const schema: TypeSchema = { type: inferred.type };
  if (!_level) {
    schema.$schema = "http://json-schema.org/draft-07/schema#";
  }
  if (inferred.format) schema.format = inferred.format;

  if (schema.type === "array") {
    // try to understand if all array cells have the same type (if so, define items as that type)
    const firstType = value.length > 0 && inferJSONSchemaType(value[0]);
    const singleType = firstType && value.every((x: any) => areSimilar(inferJSONSchemaType(x), firstType));
    if (singleType) {
      schema.items = generateJSONSchemaFromValue(value[0], options, _level + 1, _pointer + "/" + 0);
    } else if (value.length > 0) {
      schema.items = value.map((x: any, i: number) =>
        generateJSONSchemaFromValue(x, options, _level + 1, _pointer + "/" + i),
      );
    }
  } else if (schema.type === "object") {
    const required: string[] = [],
      properties: Record<string, any> = {};
    let hasProperties = false;
    Object.keys(value).forEach(key => {
      hasProperties = true;
      if (
        (typeof options.required === "function" && options.required((_pointer ? "/" + _pointer : "") + "/" + key)) ||
        typeof options.required === "boolean"
      ) {
        required.push(key);
      }
      properties[key] = generateJSONSchemaFromValue(value[key], options, _level + 1, _pointer + "/" + key);
    });
    if (hasProperties) schema.properties = properties;
    if (required.length) schema.required = required;
  }
  return schema;
};
