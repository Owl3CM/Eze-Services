import { describe, it, expect } from "vitest";
import { Validator, ValidatorMessagesEnglish } from "../Validator/Validator";

describe("Validator", () => {
  describe("required", () => {
    const validate = Validator.Create("Name").required().build();

    it("rejects null", () => {
      expect(validate(null)).toBeDefined();
    });

    it("rejects undefined", () => {
      expect(validate(undefined)).toBeDefined();
    });

    it("rejects empty string", () => {
      expect(validate("")).toBeDefined();
    });

    it("rejects whitespace-only string", () => {
      expect(validate("   ")).toBeDefined();
    });

    it("accepts valid string", () => {
      expect(validate("hello")).toBeUndefined();
    });

    it("accepts zero", () => {
      expect(validate(0)).toBeUndefined();
    });

    it("accepts false", () => {
      expect(validate(false)).toBeUndefined();
    });
  });

  describe("string", () => {
    const validate = Validator.Create("Field").string().build();

    it("accepts string", () => {
      expect(validate("hello")).toBeUndefined();
    });

    it("rejects number", () => {
      expect(validate(123)).toBeDefined();
    });

    it("rejects boolean", () => {
      expect(validate(true)).toBeDefined();
    });
  });

  describe("number", () => {
    const validate = Validator.Create("Field").number().build();

    it("accepts number", () => {
      expect(validate(42)).toBeUndefined();
    });

    it("accepts numeric string", () => {
      expect(validate("42")).toBeUndefined();
    });

    it("rejects non-numeric string", () => {
      expect(validate("abc")).toBeDefined();
    });

    it("rejects boolean", () => {
      expect(validate(true)).toBeDefined();
    });
  });

  describe("boolean", () => {
    const validate = Validator.Create("Field").boolean().build();

    it("accepts true", () => {
      expect(validate(true)).toBeUndefined();
    });

    it("accepts false", () => {
      expect(validate(false)).toBeUndefined();
    });

    it("rejects string", () => {
      expect(validate("true")).toBeDefined();
    });
  });

  describe("min / max (string length)", () => {
    it("min rejects short string", () => {
      const validate = Validator.Create("Name").min(3).build();
      expect(validate("ab")).toBeDefined();
    });

    it("min accepts sufficient string", () => {
      const validate = Validator.Create("Name").min(3).build();
      expect(validate("abc")).toBeUndefined();
    });

    it("max rejects long string", () => {
      const validate = Validator.Create("Name").max(5).build();
      expect(validate("abcdef")).toBeDefined();
    });

    it("max accepts within limit", () => {
      const validate = Validator.Create("Name").max(5).build();
      expect(validate("abc")).toBeUndefined();
    });
  });

  describe("gt / lt (number bounds)", () => {
    it("gt rejects value at boundary", () => {
      const validate = Validator.Create("Age").gt(18).build();
      expect(validate(18)).toBeDefined();
    });

    it("gt accepts value above", () => {
      const validate = Validator.Create("Age").gt(18).build();
      expect(validate(19)).toBeUndefined();
    });

    it("lt rejects value at boundary", () => {
      const validate = Validator.Create("Age").lt(100).build();
      expect(validate(100)).toBeDefined();
    });

    it("lt accepts value below", () => {
      const validate = Validator.Create("Age").lt(100).build();
      expect(validate(99)).toBeUndefined();
    });
  });

  describe("integer / positive / negative", () => {
    it("integer accepts whole number", () => {
      const validate = Validator.Create().integer().build();
      expect(validate(5)).toBeUndefined();
    });

    it("integer rejects float", () => {
      const validate = Validator.Create().integer().build();
      expect(validate(5.5)).toBeDefined();
    });

    it("positive rejects zero", () => {
      const validate = Validator.Create().positive().build();
      expect(validate(0)).toBeDefined();
    });

    it("positive accepts positive", () => {
      const validate = Validator.Create().positive().build();
      expect(validate(1)).toBeUndefined();
    });

    it("negative rejects zero", () => {
      const validate = Validator.Create().negative().build();
      expect(validate(0)).toBeDefined();
    });

    it("negative accepts negative", () => {
      const validate = Validator.Create().negative().build();
      expect(validate(-1)).toBeUndefined();
    });
  });

  describe("email", () => {
    const validate = Validator.Create("Email").email().build();

    it("accepts valid email", () => {
      expect(validate("user@example.com")).toBeUndefined();
    });

    it("rejects missing @", () => {
      expect(validate("userexample.com")).toBeDefined();
    });

    it("rejects missing domain", () => {
      expect(validate("user@")).toBeDefined();
    });

    it("skips validation for falsy value (allows empty)", () => {
      expect(validate("")).toBeUndefined();
      expect(validate(null)).toBeUndefined();
    });
  });

  describe("url", () => {
    const validate = Validator.Create("URL").url().build();

    it("accepts https url", () => {
      expect(validate("https://example.com")).toBeUndefined();
    });

    it("accepts http url", () => {
      expect(validate("http://example.com/path")).toBeUndefined();
    });

    it("rejects plain string", () => {
      expect(validate("example.com")).toBeDefined();
    });
  });

  describe("uuid", () => {
    const validate = Validator.Create("ID").uuid().build();

    it("accepts valid uuid", () => {
      expect(validate("550e8400-e29b-41d4-a716-446655440000")).toBeUndefined();
    });

    it("rejects invalid uuid", () => {
      expect(validate("not-a-uuid")).toBeDefined();
    });
  });

  describe("regex", () => {
    const validate = Validator.Create("Code")
      .regex(/^[A-Z]{3}$/)
      .build();

    it("accepts matching pattern", () => {
      expect(validate("ABC")).toBeUndefined();
    });

    it("rejects non-matching", () => {
      expect(validate("abc")).toBeDefined();
    });
  });

  describe("oneOf / notOneOf", () => {
    it("oneOf accepts included value", () => {
      const validate = Validator.Create().oneOf(["a", "b", "c"]).build();
      expect(validate("b")).toBeUndefined();
    });

    it("oneOf rejects excluded value", () => {
      const validate = Validator.Create().oneOf(["a", "b", "c"]).build();
      expect(validate("d")).toBeDefined();
    });

    it("notOneOf rejects included value", () => {
      const validate = Validator.Create().notOneOf(["x", "y"]).build();
      expect(validate("x")).toBeDefined();
    });

    it("notOneOf accepts excluded value", () => {
      const validate = Validator.Create().notOneOf(["x", "y"]).build();
      expect(validate("z")).toBeUndefined();
    });
  });

  describe("array validators", () => {
    it("array rejects non-array", () => {
      const validate = Validator.Create().array().build();
      expect(validate("string")).toBeDefined();
    });

    it("array accepts array", () => {
      const validate = Validator.Create().array().build();
      expect(validate([1, 2])).toBeUndefined();
    });

    it("nonEmptyArray rejects empty", () => {
      const validate = Validator.Create().nonEmptyArray().build();
      expect(validate([])).toBeDefined();
    });

    it("nonEmptyArray accepts non-empty", () => {
      const validate = Validator.Create().nonEmptyArray().build();
      expect(validate([1])).toBeUndefined();
    });

    it("arrayLength checks exact length", () => {
      const validate = Validator.Create().arrayLength(3).build();
      expect(validate([1, 2])).toBeDefined();
      expect(validate([1, 2, 3])).toBeUndefined();
    });
  });

  describe("date validators", () => {
    it("date accepts valid date string", () => {
      const validate = Validator.Create().date().build();
      expect(validate("2024-01-01")).toBeUndefined();
    });

    it("date rejects invalid date", () => {
      const validate = Validator.Create().date().build();
      expect(validate("not-a-date")).toBeDefined();
    });

    it("before rejects future date", () => {
      const validate = Validator.Create().before("2024-06-01").build();
      expect(validate("2024-07-01")).toBeDefined();
    });

    it("before accepts past date", () => {
      const validate = Validator.Create().before("2024-06-01").build();
      expect(validate("2024-01-01")).toBeUndefined();
    });

    it("after rejects past date", () => {
      const validate = Validator.Create().after("2024-01-01").build();
      expect(validate("2023-12-31")).toBeDefined();
    });

    it("after accepts future date", () => {
      const validate = Validator.Create().after("2024-01-01").build();
      expect(validate("2024-06-01")).toBeUndefined();
    });
  });

  describe("length", () => {
    const validate = Validator.Create().length(5).build();

    it("accepts exact length", () => {
      expect(validate("hello")).toBeUndefined();
    });

    it("rejects different length", () => {
      expect(validate("hi")).toBeDefined();
    });
  });

  describe("hex / ip / time / json", () => {
    it("hex accepts valid hex", () => {
      const validate = Validator.Create().hex().build();
      expect(validate("ff00ab")).toBeUndefined();
    });

    it("hex rejects invalid hex", () => {
      const validate = Validator.Create().hex().build();
      expect(validate("gggg")).toBeDefined();
    });

    it("ip accepts valid IPv4", () => {
      const validate = Validator.Create().ip().build();
      expect(validate("192.168.1.1")).toBeUndefined();
    });

    it("ip rejects invalid IPv4", () => {
      const validate = Validator.Create().ip().build();
      expect(validate("999.999.999.999")).toBeDefined();
    });

    it("time accepts valid time", () => {
      const validate = Validator.Create().time().build();
      expect(validate("14:30")).toBeUndefined();
    });

    it("time rejects invalid time", () => {
      const validate = Validator.Create().time().build();
      expect(validate("25:00")).toBeDefined();
    });

    it("json accepts valid JSON", () => {
      const validate = Validator.Create().json().build();
      expect(validate('{"key": "value"}')).toBeUndefined();
    });

    it("json rejects invalid JSON", () => {
      const validate = Validator.Create().json().build();
      expect(validate("{invalid}")).toBeDefined();
    });
  });

  describe("case validators", () => {
    it("lowercase accepts lowercase", () => {
      const validate = Validator.Create().lowercase().build();
      expect(validate("hello")).toBeUndefined();
    });

    it("lowercase rejects mixed case", () => {
      const validate = Validator.Create().lowercase().build();
      expect(validate("Hello")).toBeDefined();
    });

    it("uppercase accepts uppercase", () => {
      const validate = Validator.Create().uppercase().build();
      expect(validate("HELLO")).toBeUndefined();
    });

    it("uppercase rejects mixed case", () => {
      const validate = Validator.Create().uppercase().build();
      expect(validate("Hello")).toBeDefined();
    });
  });

  describe("password strength", () => {
    const validate = Validator.Create().passwordStrength().build();

    it("accepts strong password", () => {
      expect(validate("Abcdef1!")).toBeUndefined();
    });

    it("rejects weak password", () => {
      expect(validate("abc")).toBeDefined();
    });

    it("rejects no special char", () => {
      expect(validate("Abcdefg1")).toBeDefined();
    });
  });

  describe("chaining", () => {
    it("runs rules in order, stops at first error", () => {
      const validate = Validator.Create("Name").required().string().min(3).max(20).build();

      expect(validate(null)).toContain("Name");
      expect(validate("ab")).toContain("3"); // min error should mention 3
      expect(validate("hello")).toBeUndefined();
    });
  });

  describe("custom", () => {
    it("integrates custom sync rule", () => {
      const validate = Validator.Create("Field")
        .custom((value) => (value === "bad" ? "not allowed" : undefined))
        .build();

      expect(validate("bad")).toBe("not allowed");
      expect(validate("good")).toBeUndefined();
    });
  });

  describe("build vs buildAsync", () => {
    it("build returns sync function", () => {
      const validate = Validator.Create().required().build();
      const result = validate(null);
      expect(typeof result).toBe("string");
    });

    it("buildAsync returns async function", async () => {
      const validate = Validator.Create().required().buildAsync();
      // buildAsync now returns the function directly (not wrapped in Promise)
      expect(typeof validate).toBe("function");
      const result = await validate(null);
      expect(typeof result).toBe("string");
    });

    it("buildAsync handles custom async rules", async () => {
      const validate = Validator.Create()
        .custom(async (value) => {
          // Simulate async check
          return value === "taken" ? "already taken" : undefined;
        })
        .buildAsync();

      expect(await validate("taken")).toBe("already taken");
      expect(await validate("free")).toBeUndefined();
    });
  });

  describe("Validator.Init (global config)", () => {
    it("overrides default messages globally", () => {
      Validator.Init({ required: "CUSTOM REQUIRED" });
      const validate = Validator.Create().required().build();
      expect(validate(null)).toBe("CUSTOM REQUIRED");

      // Reset to English defaults
      Validator.Init(ValidatorMessagesEnglish);
    });
  });

  describe("field name interpolation", () => {
    it("includes field name in error message", () => {
      const validate = Validator.Create("Username").required().build();
      const error = validate(null);
      expect(error).toContain("Username");
    });
  });

  describe("custom message override", () => {
    it("uses custom message when provided", () => {
      const validate = Validator.Create("Email").email("Invalid email!").build();
      expect(validate("bad")).toBe("Invalid email!");
    });
  });
});
