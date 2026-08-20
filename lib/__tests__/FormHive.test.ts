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

    it("creates field hives for each key", () => {
      const { form } = createTestForm();
      const emailHive = form.getFieldHive("email");
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

  // ─── Field Access ─────────────────────────────────────────────

  describe("field access", () => {
    it("getFieldValue returns current value", () => {
      const { form } = createTestForm();
      expect(form.getFieldValue("email")).toBe("");
    });

    it("setFieldValue updates value", () => {
      const { form } = createTestForm();
      form.setFieldValue("email", "test@test.com");
      expect(form.getFieldValue("email")).toBe("test@test.com");
    });

    it("setFieldValue accepts function updater", () => {
      const { form } = createTestForm();
      form.setFieldValue("email", () => "updated@test.com");
      expect(form.getFieldValue("email")).toBe("updated@test.com");
    });

    it("setFieldValue with effect updates parent honey", () => {
      const { form } = createTestForm();
      form.setFieldValue("email", "synced@test.com", true);
      expect(form.honey.email).toBe("synced@test.com");
    });
  });

  // ─── Dirty Tracking ───────────────────────────────────────────

  describe("dirty tracking", () => {
    it("becomes dirty when value changes", () => {
      const { form } = createTestForm();
      form.getFieldHive("email").setHoney("changed");
      expect(form.isDirtyHive.honey).toBe(true);
    });

    it("becomes clean when value returns to initial", () => {
      const { form } = createTestForm();
      form.getFieldHive("email").setHoney("changed");
      expect(form.isDirtyHive.honey).toBe(true);

      form.getFieldHive("email").setHoney("");
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

    it("setError updates field hive error", () => {
      const { form } = createTestForm();
      form.setError("email", "boom");

      const nestedHive = form.getFieldHive("email");
      expect(nestedHive.honey.error).toBe("boom");
    });

    it("isValidHive reflects error state", () => {
      const { form } = createTestForm();
      form.setError("email", "bad");
      // isValidHive updates via silentSetHoney — dirty tracking runs
      // Need to trigger a value change so silentSetHoney re-evaluates
      form.getFieldHive("email").setHoney("trigger");
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

    it("validate updates the field value", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "new@email.com");
      expect(form.getFieldValue("email")).toBe("new@email.com");
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
      expect(form.getFieldValue("email")).toBe("whatever");
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

      form.reset();
      expect(form.honey.email).toBe("");
      expect(form.honey.password).toBe("");
    });

    it("clears all errors on reset", () => {
      const { form } = createTestForm({ validateMode: "onChange" });
      form.validate("email", "bad");
      expect(form.getError("email")).toBe("Invalid email");

      form.reset();
      expect(form.getError("email")).toBeUndefined();
    });

    it("resets dirty state", () => {
      const { form } = createTestForm();
      form.getFieldHive("email").setHoney("changed");
      expect(form.isDirtyHive.honey).toBe(true);

      form.reset();
      expect(form.isDirtyHive.honey).toBe(false);
    });

    it("accepts partial initial values override", () => {
      const { form } = createTestForm();
      form.reset({ email: "new@default.com" });
      expect(form.honey.email).toBe("new@default.com");
      expect(form.honey.password).toBe(""); // untouched
    });

    it("accepts falsy partial initial values", () => {
      const form = createFormHive({
        initialValue: { count: 5, enabled: true, label: "ready" },
        onSubmit: vi.fn(),
      });

      form.reset({ count: 0, enabled: false, label: "" });

      expect(form.honey).toEqual({ count: 0, enabled: false, label: "" });
    });
  });

  // ─── Field ↔ Parent Sync ───────────────────────────────────────

  describe("field ↔ parent sync", () => {
    it("field hive change reflects in parent honey", () => {
      const { form } = createTestForm();
      form.getFieldHive("email").setHoney("from-nested@test.com");
      expect(form.honey.email).toBe("from-nested@test.com");
    });

    it("parent setHoney change reflects in field hive", () => {
      const { form } = createTestForm();
      form.setHoney({ email: "from-parent@test.com", password: "abc" });
      expect(form.getFieldValue("email")).toBe("from-parent@test.com");
    });
  });

  // ─── Without Validator ─────────────────────────────────────────

  describe("without validator", () => {
    it("validate is just setHoney (no error logic)", () => {
      const { form } = createTestForm({ withValidator: false });
      form.validate("email", "anything");
      expect(form.getFieldValue("email")).toBe("anything");
      expect(form.getError("email")).toBeUndefined();
    });

    it("isValid always returns true", () => {
      const { form } = createTestForm({ withValidator: false });
      const nh = form.getFieldHive("email");
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

    it("receives a fully initialized form and may inspect sibling fields", () => {
      const seen = vi.fn();
      const form = createFormHive<LoginForm>({
        initialValue: { email: "start@test.com", password: "secret" },
        getValidator: (readyForm) => {
          seen(readyForm.getFieldValue("email"), readyForm.getFieldValue("password"), readyForm.getFieldHive("email").honey.value);
          return {
            email: (value) => (value === readyForm.getFieldValue("password") ? "Must differ" : undefined),
          };
        },
        validateMode: "onChange",
        onSubmit: vi.fn(),
      });

      expect(seen).toHaveBeenCalledWith("start@test.com", "secret", "start@test.com");
      form.validate("email", "secret");
      expect(form.getError("email")).toBe("Must differ");
    });
  });

  // ─── subscribeToField ──────────────────────────────────────────

  describe("subscribeToField", () => {
    it("notifies on field changes", () => {
      const { form } = createTestForm();
      const cb = vi.fn();
      form.subscribeToField("email", cb);
      cb.mockClear();

      form.getFieldHive("email").setHoney("new@val.com");
      expect(cb).toHaveBeenCalled();
    });
  });

  // ─── Runtime createFieldHive ───────────────────────────────────

  describe("runtime createFieldHive", () => {
    it("adding a field at runtime does not break existing field dirty tracking", () => {
      const onSubmit = vi.fn();
      const form = createFormHive<Record<string, any>>({
        initialValue: { name: "Alice" },
        validateMode: "onChange",
        onSubmit,
      });

      // Verify initial field works
      form.getFieldHive("name").setHoney("Bob");
      expect(form.isDirtyHive.honey).toBe(true);
      expect(form.honey.name).toBe("Bob");

      // Reset to clean state
      form.getFieldHive("name").setHoney("Alice");
      expect(form.isDirtyHive.honey).toBe(false);

      // Add a new field at runtime
      form.createFieldHive("age", 25);

      // Original field should still track dirty correctly
      form.getFieldHive("name").setHoney("Charlie");
      expect(form.isDirtyHive.honey).toBe(true);
      expect(form.honey.name).toBe("Charlie");

      // New field should also work
      form.getFieldHive("age").setHoney(30);
      expect(form.honey.age).toBe(30);
    });

    it("parent ↔ runtime field sync works both directions", () => {
      const onSubmit = vi.fn();
      const form = createFormHive<Record<string, any>>({
        initialValue: { name: "Alice" },
        validateMode: "onChange",
        onSubmit,
      });

      form.createFieldHive("age", 25);

      // Runtime field → parent
      form.getFieldHive("age").setHoney(30);
      expect(form.honey.age).toBe(30);

      // Parent → runtime field
      form.setHoney({ name: "Alice", age: 42 });
      expect(form.getFieldValue("age")).toBe(42);
    });
  });

  // ─── TState ────────────────────────────────────────────────────

  describe("TState", () => {
    type FieldState = { disabled: boolean; hidden: boolean; label: string };

    function createTStateForm() {
      const onSubmit = vi.fn();
      const form = createFormHive<LoginForm, FieldState>({
        initialValue: { email: "", password: "" },
        validator: simpleValidator,
        validateMode: "onChange",
        onSubmit,
        fields: {
          email: { disabled: false, hidden: false, label: "Email" },
          password: { disabled: false, hidden: false, label: "Password" },
        },
      });
      return { form, onSubmit };
    }

    it("createFieldHive includes TState in honey", () => {
      const { form } = createTStateForm();
      const nh = form.getFieldHive("email");
      expect(nh.honey.value).toBe("");
      expect(nh.honey.disabled).toBe(false);
      expect(nh.honey.hidden).toBe(false);
      expect(nh.honey.label).toBe("Email");
    });

    it("set(key, value) updates one state field", () => {
      const { form } = createTStateForm();
      const nh = form.getFieldHive("email");
      nh.set("disabled", true);
      expect(nh.honey.disabled).toBe(true);
      expect(nh.honey.hidden).toBe(false); // untouched
    });

    it("set(key, value) no-ops on same value", () => {
      const { form } = createTStateForm();
      const nh = form.getFieldHive("email");
      const cb = vi.fn();
      nh.subscribe(cb);
      cb.mockClear();

      nh.set("disabled", false); // same as initial
      expect(cb).not.toHaveBeenCalled();
    });

    it("set(key, value) fires subscribers on change", () => {
      const { form } = createTStateForm();
      const nh = form.getFieldHive("email");
      const cb = vi.fn();
      nh.subscribe(cb);
      cb.mockClear();

      nh.set("disabled", true);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    });

    it("setState merges partial state", () => {
      const { form } = createTStateForm();
      const nh = form.getFieldHive("email");
      nh.setState({ disabled: true, label: "Updated" });
      expect(nh.honey.disabled).toBe(true);
      expect(nh.honey.hidden).toBe(false); // untouched
      expect(nh.honey.label).toBe("Updated");
    });

    it("setState no-ops when nothing changed", () => {
      const { form } = createTStateForm();
      const nh = form.getFieldHive("email");
      const cb = vi.fn();
      nh.subscribe(cb);
      cb.mockClear();

      nh.setState({ disabled: false, hidden: false }); // same as initial
      expect(cb).not.toHaveBeenCalled();
    });

    it("setFieldState delegates to nested hive", () => {
      const { form } = createTStateForm();
      form.setFieldState("password", { hidden: true });
      expect(form.getFieldHive("password").honey.hidden).toBe(true);
    });

    it("getFieldState returns only TState portion", () => {
      const { form } = createTStateForm();
      const state = form.getFieldState("email");
      expect(state).toEqual({ disabled: false, hidden: false, label: "Email" });
      // Should NOT contain value or error
      expect(state).not.toHaveProperty("value");
      expect(state).not.toHaveProperty("error");
    });

    it("setFieldState throws for non-existent field", () => {
      const { form } = createTStateForm();
      expect(() => (form as any).setFieldState("bogus", { disabled: true })).toThrow("[FormHive] setFieldState");
    });

    it("getFieldState throws for non-existent field", () => {
      const { form } = createTStateForm();
      expect(() => (form as any).getFieldState("bogus")).toThrow("[FormHive] getFieldState");
    });

    it("value and validation still work alongside TState", () => {
      const { form } = createTStateForm();
      form.validate("email", "test@test.com");
      expect(form.getFieldValue("email")).toBe("test@test.com");

      const nh = form.getFieldHive("email");
      expect(nh.honey.value).toBe("test@test.com");
      expect(nh.honey.disabled).toBe(false); // TState untouched
    });

    it("reset restores TState to initial values", () => {
      const { form } = createTStateForm();
      form.setFieldState("email", { disabled: true, label: "Changed" });
      expect(form.getFieldHive("email").honey.disabled).toBe(true);

      form.reset();
      expect(form.getFieldHive("email").honey.disabled).toBe(false);
      expect(form.getFieldHive("email").honey.label).toBe("Email");
    });

    it("reset removes transient field-state keys", () => {
      const { form } = createTStateForm();
      const field = form.getFieldHive("email");
      (field.setState as (state: Record<string, unknown>) => void)({ transient: "remove-me", disabled: true });

      form.reset();

      expect(field.honey).not.toHaveProperty("transient");
      expect(field.honey.disabled).toBe(false);
    });

    it("backward compat — no TState works identically", () => {
      const { form } = createTestForm();
      // Should work exactly like before
      expect(form.getFieldHive("email").honey.value).toBe("");
      expect(form.getFieldHive("email").honey.error).toBeUndefined();
      form.validate("email", "test@test.com");
      expect(form.getFieldValue("email")).toBe("test@test.com");
    });

    it("fields config is optional even with TState generic", () => {
      const form = createFormHive<LoginForm, FieldState>({
        initialValue: { email: "", password: "" },
        validateMode: "onChange",
        onSubmit: vi.fn(),
        // No fields config — TState will be empty object
      });
      const nh = form.getFieldHive("email");
      expect(nh.honey.value).toBe("");
      // TState fields won't exist but shouldn't break
    });
  });
});
