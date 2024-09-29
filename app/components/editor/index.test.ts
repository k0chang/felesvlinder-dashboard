import { describe, expect, it } from "vitest";
import { isUrl } from ".";

describe("Editor", () => {
  it("url", () => {
    expect(isUrl("mailto:felesvlinder.com")).toBe(true);
    expect(isUrl("https://felesvlinder.com")).toBe(true);
    expect(isUrl("felesvlinder.com")).toBe(false);
  });
});
