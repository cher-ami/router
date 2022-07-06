import { getDataFromCache, setDataInCache } from "./staticPropsCache";
import { Routers } from "./Routers";

describe("staticPropsCache", () => {
  const key = "/test";
  const data = { data: [] };
  const key2 = "/test2";
  const data2 = { data2: [] };

  it("should set and get from cache", () => {
    setDataInCache(key, data);
    expect(Routers.staticPropsCache).toEqual({ [key]: data });

    setDataInCache(key2, data2);
    expect(Routers.staticPropsCache).toEqual({ [key]: data, [key2]: data2 });

    expect(getDataFromCache(key)).toEqual(data);
    expect(getDataFromCache(key2)).toEqual(data2);
  });
});
