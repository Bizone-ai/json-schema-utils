import { TypeSchema, JsonSchemaType } from "../types/TypeSchema";
import { ParsedSchema, ParsedSchemaProperties, ParsedSchemaProperty } from "./ParsedSchema";
import ParseContext from "./ParseContext";
import dereference from "./dereference";
import { ParsingOptions } from "./ParsingOptions";

const getSampleValue = (context: ParseContext, def: TypeSchema): any => {
  if (Array.isArray(def.oneOf) && def.oneOf.length > 0) {
    return getSampleValue(context, def.oneOf[0]);
  }
  const _defaultValue = def.example ?? def.default ?? def.const;
  if (typeof _defaultValue !== "undefined") {
    return _defaultValue;
  }
  switch (extractSimplifiedType(context, def)) {
    case "number":
      return 0.5;
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "string":
      if (def.enum) return def.enum[0];
      if (def.format === "date") return new Date().toISOString().substring(0, 10);
      if (def.format === "time") return new Date().toISOString().substring(11);
      if (def.format === "date-time") return new Date().toISOString();
      if (def.format === "email") return "user@example.com";
      if (def.format === "hostname") return "example.com";
      if (def.format === "ipv4") return "8.8.8.8";
      if (def.format === "ipv6") return "::1";
      if (def.format === "uri") return "https://example.com/path";
      if (def.format === "uuid") return "00000000-0000-0000-0000-000000000000";
      if (def.format === "regex") return "^.*$";
      if (def.pattern) return `/${def.pattern}/`;
      return "";
    case "null":
      return null;
    case "object":
      return {};
    case "array":
      if (Array.isArray(def.items)) {
        // match size of items array
        return Array.from({ length: def.items.length });
      }
      return [];
  }
  if (def.properties) return {}; // type is missing, but properties existence means object
  return undefined;
};

const isNonStringPrimitiveType = (type: JsonSchemaType | JsonSchemaType[]) =>
  type === "number" || type === "integer" || type === "boolean";

const extractSimplifiedType = (context: ParseContext, field: TypeSchema) => {
  let type = field?.type;
  // any of primitive type and string (or also nullable) then choose the primitive type
  if (
    Array.isArray(field?.anyOf) &&
    (field.anyOf.length === 2 || (field.anyOf.length === 3 && field.anyOf[2].type === "null"))
  ) {
    const type0 = dereference(context, field.anyOf[0]);
    const type1 = dereference(context, field.anyOf[1]);
    if (type0.type === "string" && isNonStringPrimitiveType(type1.type)) type = type1.type;
    else if (type1.type === "string" && isNonStringPrimitiveType(type0.type)) type = type0.type;
  } else if (Array.isArray(type) && type.length === 2 && type.includes("null")) {
    return type.find((x: string) => x !== "null");
  }
  return type;
};

const _internalParseSchema = (
  context: ParseContext,
  key: string | number | null,
  schema: TypeSchema,
  is_required?: boolean,
): ParsedSchemaProperties => {
  if (context.recursion > 15) {
    console.warn(
      `_internalParseSchema - Recursion depth has passed 15 < ${context.recursion}`,
      context.options?.origin,
    );
  }
  // combine with $ref chain (recursive)
  dereference(context, schema);

  let sampleValue: any;
  if (context.options?.outputSample) {
    sampleValue = getSampleValue(context, schema);
    if (key != null) {
      if (!Object.hasOwn(context.sample, key)) {
        context.sample[key] = sampleValue;
      }
    } else {
      context.sample = sampleValue;
    }
  }

  const simplifiedType = extractSimplifiedType(context, schema);

  const prop: ParsedSchemaProperty = {
    $path: context.path,
    $pointer: context.pointer || "/",

    ...schema,
    type: simplifiedType as any, // might stay empty, don't assume type
  };
  if (is_required) {
    prop.$required = is_required;
  }

  if (schema.type === "array") {
    if (Array.isArray(schema.items)) {
      return [prop].concat(
        schema.items
          .map((itemSchema, i) =>
            _internalParseSchema(
              context.next(context.pointer + "/" + i, context.path + `[${i}]`, sampleValue),
              i,
              itemSchema,
            ),
          )
          .flat(),
      );
    } else if (schema.items) {
      dereference(context, schema.items);
      return [prop].concat(
        _internalParseSchema(context.next(context.pointer + "/*", context.path + `[]`, sampleValue), 0, schema.items),
      );
    }
  } else if (schema.properties || typeof schema.additionalProperties !== "undefined" || schema.type === "object") {
    /*
    if (schema.type !== "object") {
      console.warn("Schema with properties missing type 'object'", context.rootSchema);
    }*/
    if (schema.additionalProperties && typeof schema.additionalProperties !== "boolean") {
      dereference(context, schema.additionalProperties);
    }
    return schema.properties
      ? Object.keys(schema.properties).reduce(
          (paths, field) => {
            return !schema.properties?.[field]
              ? paths
              : paths.concat(
                  _internalParseSchema(
                    context.next(
                      context.pointer + "/" + field,
                      (context.path ? context.path + "." : "") + field,
                      sampleValue,
                    ),
                    field,
                    schema.properties[field],
                    schema.required?.includes(field) || undefined,
                  ),
                );
          },
          [prop] as ParsedSchemaProperties,
        )
      : [prop];
  }
  return [prop]; // no paths
};

export const parseSchema = (schema: TypeSchema, options: ParsingOptions = {}): ParsedSchema => {
  if (!schema) return { schema, workSchema: schema, paths: [], pointers: {}, sample: undefined };
  const workSchema = structuredClone(schema);
  const context = new ParseContext(workSchema, {}, options);
  const paths = _internalParseSchema(context, null, workSchema, true);
  delete workSchema.$defs; // should be de-referenced
  delete workSchema.definitions; // should be de-referenced
  return {
    schema,
    workSchema,
    paths,
    pointers: paths.reduce(
      (a, c) => {
        a[c.$pointer] = c;
        return a;
      },
      {} as Record<string, ParsedSchemaProperty>,
    ),
    sample: context.sample,
    warnings: context.warnings,
  };
};
