import { describe, test, expect } from "vitest";
import { parseSchema } from "../../parse/parse";
import recursiveSchema from "./schemas/recursive.schema.json";
import refSchema from "./schemas/ref.schema.json";
import {ParsedSchemaProperty} from "../../parse/ParsedSchema";

describe("parseSchema", () => {
  test("no schema", () => {
    const paths = parseSchema(null as any);

    expect(paths).toMatchSnapshot();
  });

  test("should return correct with refs", () => {
    const paths = parseSchema(refSchema as any);

    expect(paths).toMatchSnapshot();
  });

  test("should return correct recursive", () => {
    const paths = parseSchema(recursiveSchema as any);

    expect(paths).toMatchSnapshot();
  });

  test("should return correct recursive (with sample)", () => {
    const paths = parseSchema(recursiveSchema as any, { outputSample: true });

    expect(paths).toMatchSnapshot();
  });

  test("sample - test all types", () => {
    const paths = parseSchema(
      {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          age: { type: "number" },
          spouse: { type: "object", properties: { id: { type: "integer" } } },
          children: {
            type: "array",
            items: { type: "object" },
          },
          male: { type: "boolean" },
          reserved: { type: "null" },
          unknown: {} as any,
          untyped: { type: "array", items: [] },
          all: {
            allOf: [{ type: "boolean" }],
            type: "string",
          },
          obj: { type: "object" },
        },
      },
      { outputSample: true },
    );

    expect(paths.sample).toMatchSnapshot();
  });

  test("sample - array of objects", () => {
    const paths = parseSchema(
      {
        $schema: "https://json-schema.org/draft/2019-09/schema",
        type: "array",
        items: {
          type: "object",
        },
      },
      { outputSample: true },
    );

    expect(paths.sample).toMatchSnapshot();
  });

  test("sample - string enum", () => {
    const paths = parseSchema(
      {
        type: "object",
        properties: {
          name: { type: "string", enum: ["hello", "world"] },
        },
      },
      { outputSample: true },
    );

    expect(paths.sample.name).toBe("hello");
  });

  test("sample - string enum 2", () => {
    const paths = parseSchema(
      {
        type: "string",
        enum: ["hello", "world"],
      },
      { outputSample: true },
    );

    expect(paths.sample).toBe("hello");
  });

  test("sample - ignore existing $path", () => {
    const paths = parseSchema(
      {
        $path: "baaahh",
        $pointer: "/asdasd/asdasd",
        $required: false,
        type: "string",
        enum: ["hello", "world"],
      } as ParsedSchemaProperty,
      { outputSample: true },
    );

    expect(paths.paths).toEqual([
      {
        $path: "",
        $pointer: "/",
        $required: true,
        enum: [
          "hello",
            "world",
          ],
        type: "string",
      },
    ]);
  });

  test("sample - from example", () => {
    const paths = parseSchema(
      {
        "$schema": "https://json-schema.org/draft/2019-09/schema",
        "type": "object",
        "properties": {
          "num": {
            "type": "number",
            "examples": [42]
          },
          "bool": {
            "type": "boolean",
            "examples": [true]
          }
        }
      },
      { outputSample: true },
    );

    expect(paths.sample).toStrictEqual({
      num: 42,
      bool: true,
    });
  });

});
