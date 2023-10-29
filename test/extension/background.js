import * as externalTest from "./tests/external.test.js";
import * as findTargetProfilesTest from "./tests/find_target_profiles.test.js";
import * as updateProfileTableTest from "./tests/update_profiles.test.js";

self.assert = function deepEqual(actual, expected, message = '') {
  Object.entries(actual).forEach(([key, value]) => {
    if (typeof value === 'object') {
      deepEqual(value, expected[key]);
    } else if (expected[key] !== value) {
      throw new Error(`${message} expected ${expected[key]} but got ${value}`);
    }
  });
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
  ...findTargetProfilesTest,
  ...updateProfileTableTest,
};
