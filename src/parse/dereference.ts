import ParseContext from "./ParseContext";
import { TypeSchema } from "../types/TypeSchema";

const unescape = (str: string) => {
  return str.replace(/~1/g, "/").replace(/~0/g, "~");
};

const parseRef = (ref: string) => {
  if (!ref || ref[0] !== "#" || ref[1] !== "/") {
    throw new Error(`Invalid ref pointer: ${ref}`);
  }
  return ref.substring(2).split(/\//).map(unescape);
};

const queryByRef = (obj: any, ref: string) => {
  const tokens = parseRef(ref);

  for (let i = 0; i < tokens.length; ++i) {
    const token = tokens[i];
    if (!(typeof obj == "object" && token in obj)) {
      throw new Error("Invalid reference token: " + token);
    }
    obj = obj[token];
  }
  return obj;
};

/**
 * Will add $comment with definitions extracted (if no $comment)
 * @param context
 * @param schema
 */
const dereference = (context: ParseContext, schema: TypeSchema): TypeSchema => {
  const definitionNames: string[] = [];
  if (Array.isArray(schema.allOf)) {
    // combine all of 'allOf' one by one
    Object.assign(
      schema,
      Object.assign(
        schema.allOf.reduce((a: any, c: any) => Object.assign(a, c), {}),
        schema,
      ),
    );
    delete schema.allOf;
  }
  while (schema?.$ref?.startsWith("#/")) {
    const $ref = schema.$ref;
    delete schema.$ref;
    try {
      let definition: any = context.definitions[$ref];
      if (!definition) {
        definition = queryByRef(context.rootSchema, $ref); // load $ref properties
      }
      // prevent recursion of definitions (if X doesn't reference X)
      if (!context.definitionsPartOf.includes($ref)) {
        context.definitionsPartOf.push($ref);
        definitionNames.push($ref.substring($ref.lastIndexOf("/") + 1));
        Object.assign(schema, { ...definition, ...schema }); // schema has precedence
      } else {
        // already defined in this context (circular reference)
        // extract it but only with type to prevent further recursion
        if (!schema.type) {
          schema.type = definition.type;
        }
      }
      if (Array.isArray(schema.allOf)) {
        // combine all of 'allOf' one by one
        Object.assign(
          schema,
          Object.assign(
            (schema as any).allOf.reduce((a: any, c: any) => Object.assign(a, c), {}),
            schema,
          ),
        );
        delete schema.allOf;
      }
    } catch (e) {
      const errorMessage = `Error fetching definition at ${$ref}`;
      if (context.options?.collectWarnings) {
        context.warn({
          id: (context.options.origin ?? "") + "/" + $ref,
          message: errorMessage,
          origin: context.options?.origin,
        });
      } else {
        console.error(errorMessage, context.options?.origin, e);
      }
    }
  }
  if (!schema.$comment && definitionNames.length > 0) schema.$comment = definitionNames?.join(", ");
  return schema;
};

export default dereference;
