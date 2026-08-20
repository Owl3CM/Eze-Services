import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach } from "vitest";
import { TableSlice } from "../Slices/Table/TableSlice";
import { Hive } from "../Hives";
import type { TableSliceConfig, TableColumnDef } from "../Slices/Table/Types";
import { TABLE_HIDDEN_FLAG } from "../Slices/Table/Types";
import { DataTableBase } from "../Ui/Table/DataTableBase";

// ─── Test Helpers ───────────────────────────────────────────────────────────

type TestItem = { id: string; name: string; email: string; age: number };

const sampleData: TestItem[] = [
  { id: "1", name: "Alice", email: "a@test.com", age: 30 },
  { id: "2", name: "Bob", email: "b@test.com", age: 25 },
  { id: "3", name: "Charlie", email: "c@test.com", age: 35 },
];

/** Standard column definitions. */
function testColumns(ctx?: any): TableColumnDef<TestItem>[] {
  return [
    { id: "name", header: "Name" },
    { id: "email", header: "Email" },
    { id: "age", header: "Age", visible: false },
    { id: "id", header: "ID", export: { value: (item) => item.id } },
  ];
}

/** Build a TableSlice with a mock loader data source. */
async function buildTable(overrides?: Partial<TableSliceConfig<TestItem>>) {
  const loaderHive = Hive.state<TestItem[]>(sampleData);

  const config: TableSliceConfig<TestItem> = {
    columns: (overrides?.columns ?? testColumns) as any,
    idKey: "id",
    storeKey: "test-table",
    ...overrides,
  };

  const slice = TableSlice<TestItem>(config);
  const ctx = { loader: { loaderHive } };
  const result = slice(ctx as any);

  // Flush the queueMicrotask that initializeColumns runs in
  await Promise.resolve();

  return { table: result.table, loaderHive, ctx };
}

// ─── localStorage Mock ──────────────────────────────────────────────────────
// jsdom in this vitest config doesn't provide a full localStorage.
// Mock it globally so TableMechanics.Storage can use it.

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
};
Object.defineProperty(globalThis, "localStorage", { value: mockLocalStorage, writable: true });

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("TableSlice", () => {
  beforeEach(() => {
    store.clear();
  });

  // ── Column Initialization ─────────────────────────────────────────────────

  describe("columns", () => {
    it("initializes columns from config", async () => {
      const { table } = await buildTable();
      const cols = table.columnsHive.honey;

      expect(cols).toHaveLength(4);
      expect(cols[0].id).toBe("name");
      expect(cols[0].header).toBe("Name");
      expect(cols[0].visible).toBe(true);
      expect(cols[2].visible).toBe(false); // age starts hidden
    });

    it("normalizes columns: sets default header and cell", async () => {
      const { table } = await buildTable({
        columns: () => [{ id: "raw" }] as any[],
      });

      const col = table.columnsHive.honey[0];
      expect(col.header).toBe("raw"); // default header = id
      expect(typeof col.cell).toBe("function"); // default cell generated
    });

    it("resolves renderHeader from headerComponent", async () => {
      const { table } = await buildTable({
        columns: () => [{ id: "name", header: "Name", headerComponent: () => "Custom Header" }] as any[],
      });

      const col = table.columnsHive.honey[0];
      expect(col.renderHeader!(null as any)).toBe("Custom Header");
    });

    it("does NOT set renderHeader when no headerComponent (leaves it for headBuilder)", async () => {
      const { table } = await buildTable();
      const col = table.columnsHive.honey[0];
      expect(col.renderHeader).toBeUndefined();
    });

    it("renders default headers when renderHeader is absent", async () => {
      const { table } = await buildTable();

      const html = renderToStaticMarkup(React.createElement(DataTableBase, { table, data: sampleData }));

      expect(html).toContain(">Name</th>");
      expect(html).toContain(">Email</th>");
    });

    it("getVisibleColumns returns only visible columns", async () => {
      const { table } = await buildTable();
      const visible = table.getVisibleColumns();

      expect(visible.every((c: any) => c.visible !== false)).toBe(true);
      expect(visible.find((c: any) => c.id === "age")).toBeUndefined(); // age is hidden
    });

    it("toggleColumnVisibility toggles a column", async () => {
      const { table } = await buildTable();

      // age starts hidden
      expect(table.getVisibleColumns().find((c: any) => c.id === "age")).toBeUndefined();

      table.toggleColumnVisibility("age");
      expect(table.getVisibleColumns().find((c: any) => c.id === "age")).toBeDefined();

      table.toggleColumnVisibility("age");
      expect(table.getVisibleColumns().find((c: any) => c.id === "age")).toBeUndefined();
    });

    it("toggleAllColumns shows/hides all", async () => {
      const { table } = await buildTable();

      table.toggleAllColumns(false);
      expect(table.getVisibleColumns()).toHaveLength(0);

      table.toggleAllColumns(true);
      expect(table.getVisibleColumns()).toHaveLength(4);
    });

    it("resetColumns restores to config defaults and clears storage", async () => {
      const { table } = await buildTable();

      table.toggleColumnVisibility("name"); // hide name
      table.resetColumns();

      const cols = table.columnsHive.honey;
      expect(cols.find((c: any) => c.id === "name")!.visible).toBe(true);
    });
  });

  // ── localStorage Persistence ──────────────────────────────────────────────

  describe("localStorage persistence", () => {
    it("saves column visibility to localStorage", async () => {
      const { table } = await buildTable();

      table.toggleColumnVisibility("age");

      const stored = localStorage.getItem("table_columns_test-table");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.find((c: any) => c.id === "age").visible).toBe(true);
    });

    it("restores column visibility from localStorage", async () => {
      // Pre-populate storage
      localStorage.setItem(
        "table_columns_test-table",
        JSON.stringify([
          { id: "name", visible: false },
          { id: "email", visible: true },
          { id: "age", visible: true },
          { id: "id", visible: true },
        ]),
      );

      const { table } = await buildTable();

      expect(table.columnsHive.honey.find((c: any) => c.id === "name")!.visible).toBe(false);
      expect(table.columnsHive.honey.find((c: any) => c.id === "age")!.visible).toBe(true);
    });

    it("resetColumns removes from storage and reinitializes", async () => {
      const { table } = await buildTable();

      table.toggleColumnVisibility("age");
      expect(localStorage.getItem("table_columns_test-table")).not.toBeNull();

      table.resetColumns();
      expect(localStorage.getItem("table_columns_test-table")).toBeNull();
    });
  });

  // ── Selection ─────────────────────────────────────────────────────────────

  describe("selection", () => {
    it("toggleItemSelection toggles an item", async () => {
      const { table } = await buildTable();

      table.toggleItemSelection(sampleData[0]);
      expect(table.isItemSelected(sampleData[0])).toBe(true);

      table.toggleItemSelection(sampleData[0]);
      expect(table.isItemSelected(sampleData[0])).toBe(false);
    });

    it("selectAllItems selects everything, unselectAllItems clears", async () => {
      const { table } = await buildTable();

      table.selectAllItems();
      expect(table.isAllSelected()).toBe(true);

      table.unselectAllItems();
      expect(table.selectedItemsHive.honey).toEqual({});
      expect(table.isAllSelected()).toBe(false);
    });

    it("toggleAllItemsSelection toggles all on/off", async () => {
      const { table } = await buildTable();

      table.toggleAllItemsSelection();
      expect(table.isAllSelected()).toBe(true);

      table.toggleAllItemsSelection();
      expect(table.isAllSelected()).toBe(false);
    });

    it("setSelected with function updater", async () => {
      const { table } = await buildTable();

      table.setSelected((prev) => ({ ...prev, "1": sampleData[0] }));
      expect(table.isItemSelected(sampleData[0])).toBe(true);
    });
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  describe("sorting", () => {
    it("setSorting / clearSorting manages sort state", async () => {
      const { table } = await buildTable();

      table.setSorting([{ id: "name", dir: "asc" }]);
      expect(table.sortingHive.honey).toEqual([{ id: "name", dir: "asc" }]);

      table.clearSorting();
      expect(table.sortingHive.honey).toEqual([]);
    });

    it("addSort appends a sort", async () => {
      const { table } = await buildTable();

      table.addSort({ id: "name", dir: "asc" });
      table.addSort({ id: "age", dir: "desc" });

      expect(table.sortingHive.honey).toHaveLength(2);
    });

    it("getSortedRows sorts by configured sorts", async () => {
      const { table } = await buildTable();

      table.setSorting([{ id: "age", dir: "asc" }]);
      const sorted = table.getSortedRows();

      expect(sorted[0].age).toBe(25); // Bob
      expect(sorted[1].age).toBe(30); // Alice
      expect(sorted[2].age).toBe(35); // Charlie
    });

    it("getSortedRows descending", async () => {
      const { table } = await buildTable();

      table.setSorting([{ id: "name", dir: "desc" }]);
      const sorted = table.getSortedRows();

      expect(sorted[0].name).toBe("Charlie");
      expect(sorted[2].name).toBe("Alice");
    });
  });

  // ── Row Access ────────────────────────────────────────────────────────────

  describe("row access", () => {
    it("getRawRows returns data from loaderHive", async () => {
      const { table } = await buildTable();
      expect(table.getRawRows()).toEqual(sampleData);
    });

    it("getFilteredRows excludes hidden rows", async () => {
      const { table, loaderHive } = await buildTable();

      // Simulate hidden row
      loaderHive.setHoney([...sampleData, { id: "4", name: "Hidden", email: "", age: 0, [TABLE_HIDDEN_FLAG]: true } as any]);
      const filtered = table.getFilteredRows();
      expect(filtered.find((r: any) => r.name === "Hidden")).toBeUndefined();
    });

    it("getViewRows applies sorting by default", async () => {
      const { table } = await buildTable();
      table.setSorting([{ id: "age", dir: "asc" }]);

      const view = table.getViewRows();
      expect(view[0].age).toBe(25);
    });

    it("getViewRows(false) skips sorting", async () => {
      const { table } = await buildTable();
      table.setSorting([{ id: "age", dir: "asc" }]);

      const view = table.getViewRows(false);
      // Should be in original order
      expect(view[0].name).toBe("Alice");
    });
  });

  // ── Export Columns ────────────────────────────────────────────────────────

  describe("export columns", () => {
    it("getExportColumns returns only columns with export config", async () => {
      const { table } = await buildTable();
      const exportCols = table.getExportColumns();

      expect(exportCols).toHaveLength(1);
      expect(exportCols[0].id).toBe("id");
    });
  });

  // ── Config Flags ──────────────────────────────────────────────────────────

  describe("config flags", () => {
    it("defaults: showIndex=true, showCheckBox=false, toggleColumnsBtnVisible=true", async () => {
      const { table } = await buildTable();
      expect(table.showIndex).toBe(true);
      expect(table.showCheckBox).toBe(false);
      expect(table.toggleColumnsBtnVisible).toBe(true);
    });

    it("respects explicit config overrides", async () => {
      const { table } = await buildTable({
        showIndex: false,
        showCheckBox: true,
        toggleColumnsBtnVisible: false,
      });

      expect(table.showIndex).toBe(false);
      expect(table.showCheckBox).toBe(true);
      expect(table.toggleColumnsBtnVisible).toBe(false);
    });
  });

  // ── CellMap Resolution ───────────────────────────────────────────────────

  describe("cellMap", () => {
    const MockCell = ({ value, currency }: { value: any; currency?: string }) => `${value}${currency ? ` ${currency}` : ""}`;

    it("resolves cell from cellMap when column has type", async () => {
      const { table } = await buildTable({
        cellMap: { money: MockCell as any },
        columns: () => [{ id: "age", type: "money", header: "Age" }] as any[],
      });

      const col = table.columnsHive.honey[0];
      expect(typeof col.cell).toBe("function");
      // Cell should render via the resolved component
      const result = col.cell!(sampleData[0], col, { index: 0 });
      expect(result).toBeDefined();
    });

    it("direct cell overrides cellMap resolution", async () => {
      const customCell = (item: TestItem) => `custom:${item.name}`;
      const { table } = await buildTable({
        cellMap: { text: MockCell as any },
        columns: () => [{ id: "name", type: "text", header: "Name", cell: customCell }] as any[],
      });

      const col = table.columnsHive.honey[0];
      expect(col.cell!(sampleData[0], col, { index: 0 })).toBe("custom:Alice");
    });

    it("falls back to string when type not found in cellMap", async () => {
      const { table } = await buildTable({
        cellMap: { money: MockCell as any },
        columns: () => [{ id: "name", type: "unknown", header: "Name" }] as any[],
      });

      const col = table.columnsHive.honey[0];
      expect(col.cell!(sampleData[0], col, { index: 0 })).toBe("Alice");
    });

    it("passes column props to resolved cell via col.props", async () => {
      // CellFunction receives (item, col, meta) — col.props carries the passthrough
      const captureCellFn = (item: any, col: any, meta: { index: number }) => ({
        value: item[col.id],
        ...col.props,
        index: meta.index,
      });

      const { table } = await buildTable({
        cellMap: { money: captureCellFn as any },
        columns: () => [{ id: "age", type: "money", header: "Age", props: { currency: "SAR" } }] as any[],
      });

      const col = table.columnsHive.honey[0];
      const result = col.cell!(sampleData[0], col, { index: 0 }) as any;
      expect(result.value).toBe(30);
      expect(result.currency).toBe("SAR");
      expect(result.index).toBe(0);
    });

    it("resolve provides all props from multiple item fields", async () => {
      const captureCellFn = (item: any, col: any, meta: { index: number }) => ({
        ...col.resolve?.(item, col),
      });

      const { table } = await buildTable({
        cellMap: { money: captureCellFn as any },
        columns: () =>
          [
            {
              id: "age",
              type: "money",
              header: "Age",
              resolve: (item: any) => ({ value: item.age, label: item.name, currency: "SAR" }),
            },
          ] as any[],
      });

      const col = table.columnsHive.honey[0];
      const result = col.cell!(sampleData[0], col, { index: 0 }) as any;
      expect(result.value).toBe(30);
      expect(result.label).toBe("Alice");
      expect(result.currency).toBe("SAR");
    });

    it("resolve overrides default item[col.id] extraction", async () => {
      const captureCellFn = (item: any, col: any) => ({
        ...col.resolve?.(item, col),
        fallback: item[col.id],
      });

      const { table } = await buildTable({
        cellMap: { money: captureCellFn as any },
        columns: () =>
          [
            {
              id: "age",
              type: "money",
              header: "Age",
              resolve: (item: any) => ({ overridden: true, custom: item.name }),
            },
          ] as any[],
      });

      const col = table.columnsHive.honey[0];
      const result = col.cell!(sampleData[0], col, { index: 0 }) as any;
      expect(result.overridden).toBe(true);
      expect(result.custom).toBe("Alice");
    });

    it("columns without type or cell get default string renderer", async () => {
      const { table } = await buildTable({
        cellMap: { money: MockCell as any },
        columns: () => [{ id: "name", header: "Name" }] as any[],
      });

      const col = table.columnsHive.honey[0];
      expect(col.cell!(sampleData[0], col, { index: 0 })).toBe("Alice");
    });

    it("resetColumns preserves cellMap-resolved cells", async () => {
      const { table } = await buildTable({
        cellMap: { money: MockCell as any },
        columns: () => [{ id: "age", type: "money", header: "Age" }] as any[],
      });

      // Cell should be resolved initially
      const before = table.columnsHive.honey[0];
      expect(typeof before.cell).toBe("function");
      const resultBefore = before.cell!(sampleData[0], before, { index: 0 });
      expect(resultBefore).toBeDefined();

      // Reset and verify cell is still resolved (not lost)
      table.resetColumns();
      await Promise.resolve();
      const after = table.columnsHive.honey[0];
      expect(typeof after.cell).toBe("function");
      const resultAfter = after.cell!(sampleData[0], after, { index: 0 });
      expect(resultAfter).toBeDefined();
    });

    it("setVisibleColumns preserves cellMap-resolved cells", async () => {
      const { table } = await buildTable({
        cellMap: { money: MockCell as any },
        columns: () =>
          [
            { id: "age", type: "money", header: "Age" },
            { id: "name", header: "Name" },
          ] as any[],
      });

      // Verify initial cell resolution
      const ageBefore = table.columnsHive.honey[0];
      expect(typeof ageBefore.cell).toBe("function");

      // Set visible columns — should preserve the resolved cell
      table.setVisibleColumns([{ ...ageBefore, visible: false }] as any);
      const ageAfter = table.columnsHive.honey.find((c: any) => c.id === "age")!;
      expect(typeof ageAfter.cell).toBe("function");
      expect(ageAfter.visible).toBe(false);

      // The cell should still render correctly
      const result = ageAfter.cell!(sampleData[0], ageAfter, { index: 0 });
      expect(result).toBeDefined();
    });
  });
});
