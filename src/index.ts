import { generateJSONSchemaFromValue, inferJSONSchemaType, type GenerateSchemaOptions } from "./generate/generate";
import { join, type JoinOptions, type PathDescriptor } from "./join/join";
import { parseSchema } from "./parse/parse";

export { areSimilar } from "./utils/areSimilar";
export { formatSchemaType } from "./utils/formatSchemaType";
export { isValidPropertyPath } from "./utils/isValidPropertyPath";

export type { TypeSchema, JsonSchemaType } from "./types/TypeSchema";
export {
  type ParsedSchema,
  type ParsedSchemaProperties,
  type ParsedSchemaProperty,
  cleanParsedSchemaProperty,
  deepClone
} from "./parse/ParsedSchema";

export {
  inferJSONSchemaType,
  GenerateSchemaOptions,
  JoinOptions,
  PathDescriptor,
};

export const JSONSchemaUtils = {
  join: join,
  parse: parseSchema,
  generate: generateJSONSchemaFromValue,
};