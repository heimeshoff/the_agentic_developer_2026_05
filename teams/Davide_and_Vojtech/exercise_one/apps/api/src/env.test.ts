import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

const validUrl = "postgres://postgres:postgres@localhost:5432/finance";

describe("loadEnv", () => {
  it("parses a valid environment", () => {
    const env = loadEnv({ DATABASE_URL: validUrl, API_PORT: "4321" });
    expect(env.DATABASE_URL).toBe(validUrl);
    expect(env.API_PORT).toBe(4321);
    expect(env.API_HOST).toBe("0.0.0.0");
  });

  it("applies defaults for optional vars", () => {
    const env = loadEnv({ DATABASE_URL: validUrl });
    expect(env.API_PORT).toBe(4000);
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });

  it("throws when DATABASE_URL is not a url", () => {
    expect(() => loadEnv({ DATABASE_URL: "not-a-url" })).toThrow(/valid connection URL/);
  });

  it("throws when API_PORT is not numeric", () => {
    expect(() => loadEnv({ DATABASE_URL: validUrl, API_PORT: "abc" })).toThrow();
  });
});
