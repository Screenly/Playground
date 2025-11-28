import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getTimeZone, formatCoordinates } from "./locale";
import { setupScreenlyMock, resetScreenlyMock } from "../test/mock";

describe("locale utilities", () => {
  beforeEach(() => {
    setupScreenlyMock();
  });

  afterEach(() => {
    resetScreenlyMock();
  });

  describe("getTimeZone", () => {
    test("should return timezone for coordinates", () => {
      setupScreenlyMock({
        coordinates: [37.3861, -122.0839], // Mountain View, CA
      });

      const timezone = getTimeZone();
      expect(timezone).toBe("America/Los_Angeles");
    });

    test("should return timezone for London coordinates", () => {
      setupScreenlyMock({
        coordinates: [51.5074, -0.1278], // London, UK
      });

      const timezone = getTimeZone();
      expect(timezone).toBe("Europe/London");
    });

    test("should return timezone for Tokyo coordinates", () => {
      setupScreenlyMock({
        coordinates: [35.6762, 139.6503], // Tokyo, Japan
      });

      const timezone = getTimeZone();
      expect(timezone).toBe("Asia/Tokyo");
    });
  });

  describe("formatCoordinates", () => {
    test("should format positive coordinates correctly", () => {
      const formatted = formatCoordinates([37.3861, -122.0839]);
      expect(formatted).toBe("37.3861° N, 122.0839° W");
    });

    test("should format negative latitude correctly", () => {
      const formatted = formatCoordinates([-33.8688, 151.2093]); // Sydney
      expect(formatted).toBe("33.8688° S, 151.2093° E");
    });

    test("should format coordinates with proper precision", () => {
      const formatted = formatCoordinates([51.5074, -0.1278]); // London
      expect(formatted).toBe("51.5074° N, 0.1278° W");
    });

    test("should handle zero coordinates", () => {
      const formatted = formatCoordinates([0, 0]);
      // Zero latitude is technically neither N nor S, but the function returns S
      // Zero longitude is technically neither E nor W, but the function returns W
      expect(formatted).toBe("0.0000° S, 0.0000° W");
    });
  });
});
