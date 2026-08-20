import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormSlice } from "../Slices/Form/FormSlice";
import { noopHandler } from "../Slices/OperationHandler";

// ─── Test Helpers ───────────────────────────────────────────────────────────

type TestForm = { name: string; email: string };
const defaultValues: TestForm = { name: "", email: "" };

/** Track OperationHandler calls. */
function createSpyHandler() {
  const handler = {
    loading: vi.fn(),
    error: vi.fn(),
    idle: vi.fn(),
    success: vi.fn(),
  };
  return { handler, factory: () => handler };
}

/** Build a FormSlice with sensible defaults. */
function buildForm(overrides?: {
  onSubmit?: (data: TestForm) => void | Promise<void>;
  loader?: (q?: any, clearCache?: boolean) => Promise<TestForm>;
  operations?: { submit: string; load?: string };
  operationHandler?: (ctx: any) => any;
}) {
  const { handler, factory } = createSpyHandler();
  const onSubmit = overrides?.onSubmit ?? vi.fn();

  const slice = FormSlice<TestForm>({
    initialValue: defaultValues,
    onSubmit,
    loader: overrides?.loader,
    operations: overrides?.operations,
    operationHandler: overrides?.operationHandler ?? factory,
  });

  const result = slice({});
  return { form: result.form, handler, onSubmit };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("FormSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Hive Creation ─────────────────────────────────────────────────────────

  it("creates a form hive with initialValue", () => {
    const { form } = buildForm();
    expect(form.hive).toBeDefined();
    expect(form.hive.honey).toEqual({ name: "", email: "" });
  });

  // ── Submit Lifecycle ──────────────────────────────────────────────────────

  it("submit calls onSubmit with form values", async () => {
    const onSubmit = vi.fn();
    const { form } = buildForm({ onSubmit });

    form.hive.setHoney({ name: "Hyder", email: "h@owl.dev" });
    form.submit();

    // onSubmit is called via Hive.form's internal submit → onSubmit callback
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({ name: "Hyder", email: "h@owl.dev" });
  });

  it("handler lifecycle on successful submit: loading → success", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { form, handler } = buildForm({ onSubmit });

    form.submit();

    await vi.waitFor(() => expect(handler.success).toHaveBeenCalled());
    expect(handler.loading).toHaveBeenCalled();

    const loadOrder = handler.loading.mock.invocationCallOrder[0];
    const successOrder = handler.success.mock.invocationCallOrder[0];
    expect(loadOrder).toBeLessThan(successOrder);
  });

  it("handler lifecycle on failed submit: loading → error", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    const { form, handler } = buildForm({ onSubmit });

    form.submit();

    await vi.waitFor(() => expect(handler.error).toHaveBeenCalled());
    expect(handler.loading).toHaveBeenCalled();
    expect(handler.error).toHaveBeenCalledWith({ message: "Error: Server error" });
  });

  // ── Reset ─────────────────────────────────────────────────────────────────

  it("reset restores form hive and sets handler to idle", () => {
    const { form, handler } = buildForm();

    form.hive.setHoney({ name: "Hyder", email: "test@test.com" });
    expect(form.hive.honey).toEqual({ name: "Hyder", email: "test@test.com" });

    form.reset();

    // Handler should go idle
    expect(handler.idle).toHaveBeenCalled();
    // Form values should be back to initial (Hive.form.reset restores initialValue)
    expect(form.hive.honey).toEqual({ name: "", email: "" });
  });

  // ── Load ──────────────────────────────────────────────────────────────────

  it("load fetches data and resets form with result", async () => {
    const loader = vi.fn().mockResolvedValue({ name: "Loaded", email: "loaded@test.com" });
    const { form, handler } = buildForm({ loader });

    await form.load("query-123");

    expect(loader).toHaveBeenCalledWith("query-123", true);
    expect(handler.loading).toHaveBeenCalled();
    // After load, handler should go idle (via reset → idle)
    expect(handler.idle).toHaveBeenCalled();
  });

  it("load without configured loader warns and returns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { form } = buildForm();

    await form.load();

    expect(warn).toHaveBeenCalledWith("FormSlice: load called but no loader configured");
    warn.mockRestore();
  });

  it("load error triggers handler.error", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("Load failed"));
    const { form, handler } = buildForm({ loader });

    await form.load();

    expect(handler.loading).toHaveBeenCalled();
    expect(handler.error).toHaveBeenCalledWith({ message: "Error: Load failed" });
  });

  // ── Operations Exposure ───────────────────────────────────────────────────

  it("exposes configured operation names", () => {
    const slice = FormSlice<TestForm>({
      initialValue: defaultValues,
      onSubmit: vi.fn(),
      operations: { submit: "user-save", load: "user-load" },
      operationHandler: () => noopHandler,
    });

    const { form } = slice({});
    expect(form.operations).toEqual({ submit: "user-save", load: "user-load" });
  });

  it("returns undefined operations when none configured", () => {
    const slice = FormSlice<TestForm>({
      initialValue: defaultValues,
      onSubmit: vi.fn(),
      operationHandler: () => noopHandler,
    });

    const { form } = slice({});
    expect(form.operations).toBeUndefined();
  });

  it("submit and load use separate handlers when configured with different operations", async () => {
    const submitHandler = { loading: vi.fn(), error: vi.fn(), idle: vi.fn(), success: vi.fn() };
    const loadHandler = { loading: vi.fn(), error: vi.fn(), idle: vi.fn(), success: vi.fn() };
    let callCount = 0;
    const handlerFactory = () => {
      callCount++;
      // First call = submit handler, second = load handler (matches resolveHandler order)
      return callCount === 1 ? submitHandler : loadHandler;
    };

    const loader = vi.fn().mockResolvedValue({ name: "loaded", email: "a@b.com" });
    const onSubmit = vi.fn();

    const slice = FormSlice<TestForm>({
      initialValue: defaultValues,
      onSubmit,
      loader,
      operations: { submit: "user-save", load: "user-load" },
      operationHandler: handlerFactory,
    });
    const { form } = slice({});

    // Load should use loadHandler
    await form.load();
    expect(loadHandler.loading).toHaveBeenCalled();
    expect(submitHandler.loading).not.toHaveBeenCalled();
  });
});
