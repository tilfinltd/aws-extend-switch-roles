import * as externalTest from "./external.test.js";
import * as updateProfileTableTest from "./update_profiles.test.js";

self.assert = function (actual, expected, message = '') {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (expectedStr !== actualStr) {
    throw new Error(`${message} expected ${expectedStr} but got ${actualStr}`);
  }
}

self.assertNever = function () {
  throw new Error('fail');
}

self.assertTrue = function (actual) {
  if (!actual) throw new Error(`${actual} is falsy`);
}

self.assertUndefined = function (actual) {
  if (actual !== undefined) throw new Error(`${actual} is not undefined`);
}

self.__tests__ = {
  ...externalTest,
  ...updateProfileTableTest,
};
