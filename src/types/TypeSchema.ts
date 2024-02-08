export type JsonSchemaType = "string" | "number" | "integer" | "object" | "array" | "boolean" | "null";

export type TypeSchema = {
  $schema?: string;

  $defs?: Record<string, any>;
  definitions?: Record<string, any>;

  type: JsonSchemaType | JsonSchemaType[];
  title?: string;
  $comment?: string;
  description?: string;
  enum?: string[];
  const?: string;
  format?: string;
  pattern?: string;
  properties?: Record<string, TypeSchema>;
  items?: TypeSchema | TypeSchema[];
  required?: string[];
  anyOf?: TypeSchema[];
  allOf?: TypeSchema[];
  oneOf?: TypeSchema[];
  example?: any;
  default?: any;
  $ref?: string;
  additionalProperties?: boolean | TypeSchema;
};
