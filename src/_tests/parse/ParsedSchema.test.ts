import {describe, expect, test} from "vitest";
import {deepClone} from "../../parse/ParsedSchema";

describe("ParseSchema", () => {
  test("Able to deep clone a proxied object", () => {

    const source = { a: 1, b: { c : 2 }};
    const proxy = new Proxy(source, {});
    const clone = deepClone(proxy);

    expect(clone).toMatchObject(source);
  });
});