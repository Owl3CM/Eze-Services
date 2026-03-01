import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFormHive } from "../Hives/FormHive";

interface LoginForm {
  email: string;
  password: string;
}

function simpleValidator<K extends keyof LoginForm>(key: K, value: LoginForm[K]): string | undefined {
  if (key === "email" && (typeof value !== "string" || !value.includes("@"))) return "Invalid email";
  if (key === "password" && (typeof value !== "string" || (value as string).length < 6)) return "Too short";
  return undefined;
}

function createTestForm(opts: { validateMode?: "onChange" | "onSubmit" | "onBlur"; withValidator?: boolean } = {}) {
  const onSubmit = vi.fn();
  const form = createFormHive<LoginForm>({
    initialValue: { email: "", password: "" },
    validator: opts.withValidator !== false ? simpleValidator : undefined,
    validateMode: opts.validateMode ?? "onChange",
    onSubmit,
  });
  return { form, onSubmit };
}

describe("createFormHive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Initialization ───────────────────────────────────────────

  describe("initialization", () => {
    it("stores initial values", () => {
      const { form } = createTestForm();
      expect(form.honey.email).toBe("");
      expect(form.honey.password).toBe("");
    });

    it("creates nested hives for each key", () => {
      const { form } = createTestForm();
      const emailHive = form.getNestedHive("email");
      expect(emailHive).toBeDefined();
      expect(emailHive.honey.value).toBe("");
    });

    it("starts not dirty", () => {
      const { form } = createTestForm();
      expect(form.isDirtyHive.honey).toBe(false);
    });

    it("starts valid", () => {
      const { form } = createTestForm();
      expect(form.isValidHive.honey).toBe(true);
    });

    it("initializes errors as empty", () => {
      const { form } = createTestForm();
      expect(form.errors).toEqual({});
    });
  });

  // ─── Nested Hive Access ───────────────────────────────────────

  describe("nested hive access", () => {
    it("getNestedHoney returns current value", () => {
      const { form } = createTestForm();
      expect(form.getNestedHoney("email")).toBe("");
    });

    it("setNestedHoney updates value", () => {
      const { form } = createTestForm();
      form.setNestedHoney("email", "test@test.com");
      expect(form.getNestedHoney("email")).toBe("test@test.com");
    });

    it("setNestedHoney accepts function updater", () => {
      const { form } = createTestForm();
      form.setNestedHoney("email", () => "updated@test.com");
      expect(form.getNestedHoney("email")).toBe("updated@test.com");
    });

    it("setNestedHoney with effect updates parent honey", () => {
      const { form } = createTestForm();
      form.setNestedHoney("email", "synced@test.com", true);
      expect(form.honey.email).toBe("synced@test.com");
    });
  });

  // ─── Dirty Tracking ───────────────────────────────────────────

  describe("dirty tracking", () => {
    it("becomes dirty when value changes", () => {
      const { form } = createTestForm();
      form.getNestedHive("email").setHoney("changed");
      expect(form.isDirtyHive.honey).toBe(true);
    });

    it("becomes clean when value returns to initial", () => {
      const { form } = createTestForm();
      form.getNestedHive("email").setHoney("changed");
      expect(form.isDirtyHive.honey).toBe(true);

      form.getNestedHive("email").setHoney("");
      expect(form.isDirtyHive.honey).toBe(false);
    });
  });

  // ─── Error Management ─────────────────────────────────────────

  describe("error management", () => {
    it("setError sets error on a key", () => {
      const { form } = createTestForm();
      form.setError("email", "Required");
      expect(form.getError("email")).toBe("Required");
    });

    it("clearErrors removes all errors", () => {
      const { form } = createTestForm();
      form.setError("email", "bad");
      form.setError("password", "bad");

      form.clearErrors();
      expect(form.getError("email")).toBeUndefined();
      expect(form.getError("password")).toBeUndefined();
    });

    it("setError updates nested hive error field", () => {
      const { form } = createTestForm();
      form.setError("email", "boom");

      const nestedHive = form.getNestedHive("email");
      expect(nestedHive.honey.error).toBe("boom");
    });

    it("isValidHive reflects error state", () => {
      const { form } = createTestForm();
      form.setError("email", "bad");
      // isValidHive updates via silentSetHoney — dirty tracking runs
      // Need to trigger a value change so silentSetHoney re-evaluates
      form.getNestedHive("email").setHoney("trigger");
      expect(form.isValidHive.honey).toBe(false);
    });
  });

  // ─── Validation: onChange mode ─────────────────────────────────

  describe("onChange validation", () => {
    it("validate sets error on invalid value", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "bad");
      expect(form.getError("email")).toBe("Invalid email");
    });

    it("validate clears error on valid value (when already in error)", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      // First, get into error state
      form.validate("email", "bad");
      expect(form.getError("email")).toBe("Invalid email");

      // Then validate with good value — should clear
      form.validate("email", "good@email.com");
      expect(form.getError("email")).toBeUndefined();
    });

    it("validate updates the nested value", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "new@email.com");
      expect(form.getNestedHoney("email")).toBe("new@email.com");
    });

    it("validate with effect=true updates parent honey", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("password", "123456", true);
      expect(form.honey.password).toBe("123456");
    });
  });

  // ─── Validation: onSubmit mode ─────────────────────────────────

  describe("onSubmit validation", () => {
    it("does NOT show errors on individual field changes", () => {
      const { form } = createTestForm({ validateMode: "onSubmit" });
      form.validate("email", "bad");
      // In onSubmit mode, errors only appear on submit
      expect(form.getError("email")).toBeUndefined();
    });

    it("still updates the field value", () => {
      const { form } = createTestForm({ validateMode: "onSubmit" });
      form.validate("email", "whatever");
      expect(form.getNestedHoney("email")).toBe("whatever");
    });

    it("shows errors once field already has error (even in onSubmit mode)", () => {
      const { form } = createTestForm({ validateMode: "onSubmit" });
      // Manually set an error (simulating post-submit state)
      form.setError("email", "Invalid email");

      // Now validate — should re-validate because error already exists
      form.validate("email", "still-bad");
      expect(form.getError("email")).toBe("Invalid email");
    });
  });

  // ─── reValidate ────────────────────────────────────────────────

  describe("reValidate", () => {
    it("validates all fields and returns false if any invalid", async () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      // Both fields are empty/invalid
      const resultPromise = form.reValidate();
      vi.advanceTimersByTime(100);
      const result = await resultPromise;

      expect(result).toBe(false);
      expect(form.getError("email")).toBe("Invalid email");
      expect(form.getError("password")).toBe("Too short");
    });

    it("returns true if all fields valid", async () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "test@test.com");
      form.validate("password", "123456");

      const resultPromise = form.reValidate();
      vi.advanceTimersByTime(100);
      const result = await resultPromise;

      expect(result).toBe(true);
    });

    it("validates only specified keys", async () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "test@test.com");
      // password is still empty/invalid

      const resultPromise = form.reValidate(["email"] as any);
      vi.advanceTimersByTime(100);
      const result = await resultPromise;

      // Only validated email — which is valid
      expect(result).toBe(true);
    });

    it("clears errors before re-validating", async () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.setError("email", "old error");

      const resultPromise = form.reValidate();
      vi.advanceTimersByTime(100);
      await resultPromise;

      // Error should now be the re-validated error, not the old one
      expect(form.getError("email")).toBe("Invalid email");
    });

    it("returns true if no validator exists", async () => {
      const { form } = createTestForm({ withValidator: false });

      const resultPromise = form.reValidate();
      vi.advanceTimersByTime(100);
      const result = await resultPromise;

      expect(result).toBe(true);
    });
  });

  // ─── submit ────────────────────────────────────────────────────

  describe("submit", () => {
    it("calls onSubmit when all fields valid", async () => {
      const { form, onSubmit } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "hello@world.com");
      form.validate("password", "secret123");

      form.submit();
      vi.advanceTimersByTime(100);
      // Wait for the promise to resolve
      await vi.runAllTimersAsync();

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: "hello@world.com", password: "secret123" }));
    });

    it("does NOT call onSubmit when validation fails", async () => {
      const { form, onSubmit } = createTestForm({ validateMode: "onChange" });
      // Fields are empty — validation will fail

      form.submit();
      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("prevents default on form event", () => {
      const { form } = createTestForm();
      const event = { preventDefault: vi.fn() } as any;
      form.submit(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it("works without event argument", () => {
      const { form } = createTestForm();
      // Should not throw
      expect(() => form.submit()).not.toThrow();
    });
  });

  // ─── reset ─────────────────────────────────────────────────────

  describe("reset", () => {
    it("resets values to initial", () => {
      const { form } = createTestForm();
      form.validate("email", "changed@email.com");
      form.validate("password", "changed123");

      (form as any).reset();
      expect(form.honey.email).toBe("");
      expect(form.honey.password).toBe("");
    });

    it("clears all errors on reset", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "bad");
      expect(form.getError("email")).toBe("Invalid email");

      (form as any).reset();
      expect(form.getError("email")).toBeUndefined();
    });

    it("resets dirty state", () => {
      const { form } = createTestForm();
      form.getNestedHive("email").setHoney("changed");
      expect(form.isDirtyHive.honey).toBe(true);

      (form as any).reset();
      expect(form.isDirtyHive.honey).toBe(false);
    });

    it("accepts partial initial values override", () => {
      const { form } = createTestForm();
      (form as any).reset({ email: "new@default.com" });
      expect(form.honey.email).toBe("new@default.com");
      expect(form.honey.password).toBe(""); // untouched
    });
  });

  // ─── Nested ↔ Parent Sync ─────────────────────────────────────

  describe("nested ↔ parent sync", () => {
    it("nested hive change reflects in parent honey", () => {
      const { form } = createTestForm();
      form.getNestedHive("email").setHoney("from-nested@test.com");
      expect(form.honey.email).toBe("from-nested@test.com");
    });

    it("parent setHoney change reflects in nested hive", () => {
      const { form } = createTestForm();
      form.setHoney({ email: "from-parent@test.com", password: "abc" });
      expect(form.getNestedHoney("email")).toBe("from-parent@test.com");
    });
  });

  // ─── Without Validator ─────────────────────────────────────────

  describe("without validator", () => {
    it("validate is just setHoney (no error logic)", () => {
      const { form } = createTestForm({ withValidator: false });
      form.validate("email", "anything");
      expect(form.getNestedHoney("email")).toBe("anything");
      expect(form.getError("email")).toBeUndefined();
    });

    it("isValid always returns true", () => {
      const { form } = createTestForm({ withValidator: false });
      const nh = form.getNestedHive("email");
      expect(nh.isValid()).toBe(true);
    });
  });

  // ─── getValidator pattern ──────────────────────────────────────

  describe("getValidator pattern", () => {
    it("creates validators from factory function", async () => {
      const onSubmit = vi.fn();
      const form = createFormHive<LoginForm>({
        initialValue: { email: "", password: "" },
        getValidator: () => ({
          email: (value: string) => (!value.includes("@") ? "Need @" : undefined),
          password: (value: string) => (value.length < 3 ? "Min 3" : undefined),
        }),
        validateMode: "onChange",
        onSubmit,
      });

      form.validate("email", "bad");
      expect(form.getError("email")).toBe("Need @");

      form.validate("email", "good@test.com");
      expect(form.getError("email")).toBeUndefined();
    });
  });

  // ─── subscribeToNestedHive ─────────────────────────────────────

  describe("subscribeToNestedHive", () => {
    it("notifies on nested hive changes", () => {
      const { form } = createTestForm();
      const cb = vi.fn();
      form.subscribeToNestedHive("email", cb);
      cb.mockClear();

      form.getNestedHive("email").setHoney("new@val.com");
      expect(cb).toHaveBeenCalled();
    });
  });
});
