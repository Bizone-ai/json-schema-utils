import { TypeSchema } from "../types/TypeSchema";

export const formatSchemaType = (type?: TypeSchema | TypeSchema[]): string => {
  if (!type) return "";
  if (Array.isArray(type)) {
    return formatSchemaType(
      type.length === 0 || (type[0] && type.some(x => x?.type !== type[0].type)) ? { type: "object" } : type[0],
    );
  }
  if (type.const) {
    return typeof type.const === "object" ? JSON.stringify(type.const) : type.const;
  }
  if (type.type === "string") {
    return type.pattern ? `string:/${type.pattern}/` : type.format ? `string:${type.format}` : type.type;
  } else if (type.type === "array") {
    const itemsType = formatSchemaType(type.items);
    return itemsType ? `${itemsType}[]` : "array";
  }
  return Array.isArray(type.type) ? type.type.join("|") : type.type || "";
};
