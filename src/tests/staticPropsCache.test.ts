import { staticPropsCache } from "../core/staticPropsCache";
import { expect, describe, it } from "vitest";

describe("staticPropsCache", () => {
  const store = {};
  const cache = staticPropsCache(store);

  const key = "/test";
  const data = { data: [] };
  const key2 = "/test2";
  const data2 = { data2: [] };

  it("should set in cache", () => {
    cache.set(key, data);
    expect(store).toEqual({ [key]: data });

    cache.set(key2, data2);
    expect(store).toEqual({ [key]: data, [key2]: data2 });
  });

  it("should  get from cache", () => {
    expect(cache.get(key)).toEqual(data);
    expect(cache.get(key2)).toEqual(data2);
  });
});
