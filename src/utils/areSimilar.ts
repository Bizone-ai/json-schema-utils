/*!
 *---------------------------------------------------------------------------------------------
 *  Taken from: @azure-tools/object-comparison v3.0.253
 *  Modified by Eli Sherer
 *
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

function isPrimitive(object: any) {
  switch (typeof object) {
    case "undefined":
    case "boolean":
    case "number":
    case "bigint":
    case "string":
    case "symbol":
      return true;
    default:
      return false;
  }
}

export function areSimilar(a: any, b: any): boolean {
  // 100% similar things, including primitives
  if (a === b) {
    return true;
  }

  // typeof null is object, but if both were null that would have been already detected.
  if (
    a === null ||
    b === null || // either is null?
    isPrimitive(a) ||
    isPrimitive(b) || // either is primitive
    typeof a !== typeof b || // types not the same?
    (Array.isArray(a) && !Array.isArray(b)) || // one an array and not the other?
    (!Array.isArray(a) && Array.isArray(b))
  ) {
    return false;
  }

  // the same set of keys, but not necessarily same order
  let keysA = Object.keys(a);
  let keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  keysA.sort();
  keysB.sort();

  // key test
  for (let i = keysA.length - 1; i >= 0; i--) {
    if (keysA[i] !== keysB[i]) {
      return false;
    }
  }

  // value test
  return !keysA.find(key => !areSimilar(a[key], b[key]));
}
