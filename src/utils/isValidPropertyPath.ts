import { TypeSchema } from "../types/TypeSchema";

/**
 * Checks whether a specific property path is valid based on specified mapping of path to schema
 * @param path
 * @param paths
 */
export const isValidPropertyPath = (path: string, paths: Record<string, TypeSchema>) => {
  if (!paths) return false;
  const parts = path.split(".");
  let index = 0;
  let existing: TypeSchema;
  let partPath: string;
  do {
    partPath = parts.slice(0, index + 1).join(".");
    existing = paths[partPath];
    index++;
  } while (index < parts.length && paths[parts.slice(0, index + 1).join(".")]);
  return existing && existing.type === "object" && existing.additionalProperties !== false;
};
