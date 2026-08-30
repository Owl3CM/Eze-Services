import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExporterSlice } from "../Slices/Exporter/ExporterSlice";
import { ExporterMechanics } from "../Slices/Exporter/ExporterMechanics";
import type { ExporterDependencies, ExporterSliceConfig } from "../Slices/Exporter/Types";
import type { TableColumnDef } from "../Slices/Table/Types";
import { Hive } from "../Hives";

// ─── Test Helpers ───────────────────────────────────────────────────────────

type TestItem = { id: string; name: string; email: string };

const sampleData: TestItem[] = [
  { id: "1", name: "Alice", email: "a@test.com" },
  { id: "2", name: "Bob", email: "b@test.com" },
];

const exportColumns: TableColumnDef<TestItem>[] = [
  { id: "name", header: "Name", export: { value: (item) => item.name } },
  { id: "email", header: "Email", export: { value: (item) => item.email } },
];

/** Build a minimal ExporterSlice context with a loader data source. */
function buildExporter(configOverrides?: Partial<ExporterSliceConfig<TestItem>>) {
  const loaderHive = Hive.state<TestItem[]>(sampleData);

  const config: ExporterSliceConfig<TestItem> = {
    columns: exportColumns,
    ...configOverrides,
  };

  const slice = ExporterSlice<TestItem>(config);
  const ctx = {
    loader: { loaderHive },
  } as unknown as ExporterDependencies<TestItem>;
  const result = slice(ctx);

  return { exporter: result.exporter, ctx, loaderHive };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("ExporterSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Mechanics: rowsToCsv ──────────────────────────────────────────────────

  describe("ExporterMechanics.rowsToCsv", () => {
    it("generates valid CSV from headers and rows", () => {
      const csv = ExporterMechanics.rowsToCsv(
        ["Name", "Email"],
        [
          { Name: "Alice", Email: "a@test.com" },
          { Name: "Bob", Email: "b@test.com" },
        ],
      );

      const lines = csv.split("\n");
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe("Name,Email");
      expect(lines[1]).toBe("Alice,a@test.com");
    });

    it("escapes values with commas and quotes", () => {
      const csv = ExporterMechanics.rowsToCsv(["Name"], [{ Name: 'O"Brien, Jr.' }]);

      expect(csv).toContain('"O""Brien, Jr."');
    });

    it("handles null/undefined values", () => {
      const csv = ExporterMechanics.rowsToCsv(["Name", "Email"], [{ Name: null, Email: undefined }]);

      const lines = csv.split("\n");
      expect(lines[1]).toBe(",");
    });
  });

  // ── Mechanics: resolveData ────────────────────────────────────────────────

  describe("ExporterMechanics.resolveData", () => {
    it("uses dataProvider when configured", async () => {
      const custom = [{ id: "x", name: "Custom", email: "" }];
      const data = await ExporterMechanics.resolveData({ dataProvider: () => custom }, { loader: { loaderHive: Hive.state([]) } } as any);

      expect(data).toBe(custom);
    });

    it("uses async dataProvider", async () => {
      const custom = [{ id: "x", name: "Async", email: "" }];
      const data = await ExporterMechanics.resolveData({ dataProvider: () => Promise.resolve(custom) }, { loader: { loaderHive: Hive.state([]) } } as any);

      expect(data).toEqual(custom);
    });

    it("falls back to loader hive when no dataProvider", async () => {
      const loaderHive = Hive.state(sampleData);
      const data = await ExporterMechanics.resolveData({}, { loader: { loaderHive } } as any);

      expect(data).toBe(sampleData);
    });

    it("falls back to paginator hive when no loader", async () => {
      const paginatorHive = Hive.list(sampleData);
      const data = await ExporterMechanics.resolveData({}, { paginator: { paginatorHive } } as any);

      expect(data).toBe(sampleData);
    });
  });

  // ── Mechanics: resolveColumns ─────────────────────────────────────────────

  describe("ExporterMechanics.resolveColumns", () => {
    it("uses config.columns when provided", () => {
      const cols = ExporterMechanics.resolveColumns({ columns: exportColumns }, {} as any);

      expect(cols).toHaveLength(2);
    });

    it("falls back to table.columnsHive when no config columns", () => {
      const tableColumnsHive = Hive.state([
        { id: "name", header: "Name", export: { value: (i: any) => i.name } },
        { id: "id", header: "ID" }, // no export — should be filtered out
      ]);

      const cols = ExporterMechanics.resolveColumns({}, { table: { columnsHive: tableColumnsHive } } as any);

      expect(cols).toHaveLength(1);
      expect(cols[0].id).toBe("name");
    });
  });

  // ── Mechanics: applyPrepare ───────────────────────────────────────────────

  describe("ExporterMechanics.applyPrepare", () => {
    it("returns original data when no prepare configured", async () => {
      const result = await ExporterMechanics.applyPrepare({}, sampleData, exportColumns);
      expect(result.items).toBe(sampleData);
      expect(result.cols).toBe(exportColumns);
    });

    it("applies prepare function that returns items array", async () => {
      const filtered = [sampleData[0]];
      const result = await ExporterMechanics.applyPrepare({ prepare: () => filtered }, sampleData, exportColumns);

      expect(result.items).toBe(filtered);
    });

    it("applies prepare function that returns { items, cols }", async () => {
      const newCols = [exportColumns[0]];
      const result = await ExporterMechanics.applyPrepare({ prepare: () => ({ items: sampleData, cols: newCols }) }, sampleData, exportColumns);

      expect(result.cols).toBe(newCols);
    });
  });

  // ── Download Flow ─────────────────────────────────────────────────────────

  describe("download", () => {
    it("CSV download calls saveFileBrowser with correct filename", async () => {
      // Mock saveFileBrowser to avoid DOM manipulation
      const saveSpy = vi.spyOn(ExporterMechanics, "saveFileBrowser").mockResolvedValue(undefined);

      const { exporter } = buildExporter({
        filename: (type) => `test_export`,
      });

      await exporter.download({ type: "csv" });

      expect(saveSpy).toHaveBeenCalledOnce();
      expect(saveSpy.mock.calls[0][0]).toBe("test_export.csv");
      expect(saveSpy.mock.calls[0][1]).toBeInstanceOf(Blob);

      saveSpy.mockRestore();
    });

    it("CSV content has correct headers and data", async () => {
      let capturedBlob: Blob | undefined;
      const saveSpy = vi.spyOn(ExporterMechanics, "saveFileBrowser").mockImplementation(async (_, blob) => {
        capturedBlob = blob;
      });

      const { exporter } = buildExporter();
      await exporter.download({ type: "csv" });

      expect(capturedBlob).toBeDefined();
      const text = await capturedBlob!.text();
      const lines = text.split("\n");
      expect(lines[0]).toBe("Name,Email");
      expect(lines[1]).toBe("Alice,a@test.com");
      expect(lines[2]).toBe("Bob,b@test.com");

      saveSpy.mockRestore();
    });

    it("warns when no export columns are configured", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const saveSpy = vi.spyOn(ExporterMechanics, "saveFileBrowser").mockResolvedValue(undefined);

      const { exporter } = buildExporter({ columns: [] });
      await exporter.download({ type: "csv" });

      expect(warn).toHaveBeenCalledWith("exporter: no export columns configured");
      expect(saveSpy).not.toHaveBeenCalled();

      warn.mockRestore();
      saveSpy.mockRestore();
    });

    it("excel export warns that it's disabled", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { exporter } = buildExporter();
      await exporter.download({ type: "excel" });

      expect(warn).toHaveBeenCalledWith("exporter: excel export is disabled until optional dependencies are resolved");

      warn.mockRestore();
    });
  });
});
