export type JsonSchemaType = "string" | "number" | "integer" | "object" | "array" | "boolean" | "null";

export type TypeSchema = {
  // core
  $id?: string;
  $schema?: string;
  $ref?: string;
  $comment?: string;
  $defs?: Record<string, any>;
  definitions?: Record<string, any>;

  // applicator
  allOf?: TypeSchema[];
  anyOf?: TypeSchema[];
  oneOf?: TypeSchema[];
  if?: TypeSchema;
  then?: TypeSchema;
  else?: TypeSchema;
  not?: TypeSchema;
  properties?: Record<string, TypeSchema>;
  additionalProperties?: boolean | TypeSchema;
  patternProperties?: Record<string, TypeSchema>;
  items?: TypeSchema | TypeSchema[];

  // validation
  type?: JsonSchemaType | JsonSchemaType[];
  enum?: string[];
  const?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  minimum?: number;
  multipleOf?: number;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  // meta data
  title?: string;
  description?: string;
  default?: any;
  deprecated?: boolean;
  examples?: any[];
  readOnly?: boolean;
  writeOnly?: boolean;
  // format annotation
  format?: string;
};
