import { describe, test, expect } from "vitest";
import { generateJSONSchemaFromValue } from "../../generate/generate";

describe("generateJSONSchemaFromValue", () => {
  test("should return the correct schema for an example (with required)", () => {
    const schema = generateJSONSchemaFromValue(
      {
        eli: 2,
        sherer: true,
        suri: {
          ben: {},
          dahan: 5.4,
        },
        cookies: [
          {
            eli: 4,
          },
        ],
      },
      { required: true },
    );

    expect(schema).toMatchSnapshot();
  });

  test("should return the correct schema for an example (without required)", () => {
    const schema = generateJSONSchemaFromValue({
      eli: 2,
      sherer: true,
      suri: {
        ben: {},
        dahan: 5.4,
      },
      null: null,
      cookies: [
        {
          eli: 4,
        },
      ],
      array_of_2_types: ["string", 0],
      array_untyped: [],
    });

    expect(schema).toMatchSnapshot();
  });

  test("array item type - single", () => {
    const schema = generateJSONSchemaFromValue({
      int_array: [1, 2, 3, 3],
    });

    expect(schema).toMatchSnapshot();
  });
  test("array item type - multiple", () => {
    const schema = generateJSONSchemaFromValue({
      int_array: [1, "two", true],
    });

    expect(schema).toMatchSnapshot();
  });
});
