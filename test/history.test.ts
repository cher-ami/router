import { ROUTERS } from "../src/api/routers";

describe("history", () => {
  it("should be defined", () => {
    expect(ROUTERS.history).toBeDefined();
  });
});
