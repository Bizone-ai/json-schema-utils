import { TypeSchema } from "../types/TypeSchema";
import { ParsingOptions } from "./ParsingOptions";

class ParseContext {
  recursion: number;
  rootSchema: TypeSchema;
  definitions: Record<string, TypeSchema>;
  options?: ParsingOptions;
  sample: any;
  definitionsPartOf: any[];
  path: string;
  pointer: string;
  warnings?: any[];

  constructor(
    rootSchema: TypeSchema,
    definitions: Record<string, TypeSchema>,
    options?: ParsingOptions,
    recursion?: number,
    pointer?: string,
    path?: string,
    sample?: any,
    definitionsPartOf?: any[],
    warnings?: any[],
  ) {
    this.rootSchema = rootSchema;
    this.definitions = {};
    this.options = options;
    this.pointer = pointer ?? "";
    this.path = path ?? "";
    this.recursion = recursion ?? 0;
    this.sample = sample;
    this.definitionsPartOf = definitionsPartOf ?? [];
    this.warnings = warnings ?? [];
  }
  next(nextPointer: string, nextPath: string, nextSample: any) {
    return new ParseContext(
      this.rootSchema,
      this.definitions,
      this.options,
      this.recursion + 1,
      nextPointer,
      nextPath,
      nextSample,
      this.definitionsPartOf.slice(),
      this.warnings,
    );
  }
  warn(warning: any) {
    this.warnings?.push(warning);
  }
}

export default ParseContext;
