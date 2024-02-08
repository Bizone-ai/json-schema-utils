export type ParsingOptions = {
  /** Describe the origin of the parsing process to be added to warnings and errors */
  origin?: string;
  /** Whether to log exception on warnings or collect in a list to return in output */
  collectWarnings?: boolean;
  /** Add a sample value based on schema in output */
  outputSample?: boolean;
};
