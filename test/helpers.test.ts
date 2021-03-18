import {
  buildUrl,
  getUrlByPath,
  getUrlByRouteName,
  joinPaths,
  removeLastCharFromString,
} from "../src/api/helpers";

describe("removeLastCharFromString", () => {
  it("should be defined", () => {
    expect(removeLastCharFromString).toBeDefined();
  });

  it("should not remove last character if string === lastChar", () => {
    const entry = "/";
    const result = removeLastCharFromString("/", "/", true);
    expect(result).toEqual(entry);
  });

  it("should remove last character if string is not lastChar", () => {
    const entry = "/";
    const result = removeLastCharFromString(entry, "/", false);
    expect(result).toEqual("");
  });

  it("should remove last charater from string", () => {
    const entry = "/master/";
    const result = removeLastCharFromString(entry, "/");
    expect(result).toEqual("/master");
  });
});

describe("helpers", () => {
  describe("joinPaths", () => {
    it("should be defined", () => {
      expect(joinPaths).toBeDefined();
    });
  });

  describe("buildUrl", () => {
    it("should be defined", () => {
      expect(buildUrl).toBeDefined();
    });
  });

  describe("getUrlByPath", () => {
    it("should be defined", () => {
      expect(getUrlByPath).toBeDefined();
    });
  });

  describe("getUrlByRouteName", () => {
    it("should be defined", () => {
      expect(getUrlByRouteName).toBeDefined();
    });
  });
});
