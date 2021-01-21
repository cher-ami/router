import {
  buildUrl,
  getUrlByPath,
  getUrlByRouteName,
  joinPaths,
} from "../src/api/helpers";

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
