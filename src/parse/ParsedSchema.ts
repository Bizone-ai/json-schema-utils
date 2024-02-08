import { TypeSchema } from "../types/TypeSchema";

export type ParsedSchemaProperty = {
  // special
  $path: string;
  $pointer: string;
  $required?: boolean;
} & TypeSchema;
export type ParsedSchemaProperties = ParsedSchemaProperty[];

export const cleanParsedSchemaProperty = (ps: ParsedSchemaProperty): TypeSchema => {
  const clone: TypeSchema = structuredClone(ps);
  delete (clone as any).$path;
  delete (clone as any).$pointer;
  delete (clone as any).$required;
  return clone;
};

export type ParsedSchema = {
  /** The unparsed schema object */
  schema: TypeSchema;
  /** The parsed schema object */
  workSchema: TypeSchema;
  /** Paths to type map entries */
  paths: ParsedSchemaProperties;
  /** Pointers to type map */
  pointers: Record<string, ParsedSchemaProperty>;
  /** A sample JSON object according to the sceham */
  sample: any;
  /** Possible warnings from the parsing process */
  warnings?: any[];
};
