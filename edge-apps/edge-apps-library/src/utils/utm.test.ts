import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getDefaultUTMParams, addUTMParams, addUTMParamsIf } from "./utm";
import { setupScreenlyMock, resetScreenlyMock } from "../test/mock";

describe("utm utilities", () => {
  beforeEach(() => {
    setupScreenlyMock({
      location: "Test Location",
      hostname: "test-hostname",
    });
  });

  afterEach(() => {
    resetScreenlyMock();
  });

  describe("getDefaultUTMParams", () => {
    test("should return default UTM parameters", () => {
      const params = getDefaultUTMParams();

      expect(params).toEqual({
        utm_source: "screenly",
        utm_medium: "digital-signage",
        utm_location: "Test Location",
        utm_placement: "test-hostname",
      });
    });
  });

  describe("addUTMParams", () => {
    test("should add UTM parameters to URL", () => {
      const url = "https://example.com/page";
      const result = addUTMParams(url);

      expect(result).toContain("utm_source=screenly");
      expect(result).toContain("utm_medium=digital-signage");
    });

    test("should merge custom parameters", () => {
      const url = "https://example.com/page";
      const result = addUTMParams(url, {
        utm_campaign: "test-campaign",
      });

      expect(result).toContain("utm_campaign=test-campaign");
    });
  });

  describe("addUTMParamsIf", () => {
    test("should add parameters when enabled", () => {
      const url = "https://example.com/page";
      const result = addUTMParamsIf(url, true);

      expect(result).toContain("utm_source=screenly");
    });

    test("should not add parameters when disabled", () => {
      const url = "https://example.com/page";
      const result = addUTMParamsIf(url, false);

      expect(result).toBe(url);
    });
  });
});
