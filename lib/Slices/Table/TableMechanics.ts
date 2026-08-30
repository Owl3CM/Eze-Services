import { CellFunction, TableCellMap, TableColumnDef, TableSliceConfig, TableSort } from "./Types";

const defaultStringCell: CellFunction = (item: any, col: any) => String(item[col.id] ?? "");

export const TableMechanics = {
  Storage: {
    saveColumns: (key: string, columns: TableColumnDef<any>[]) => {
      try {
        const minimal = columns.map((c) => ({ id: c.id, visible: c.visible }));
        localStorage.setItem(key, JSON.stringify(minimal));
      } catch {}
    },
    getColumns: (key: string): { id: string; visible?: boolean }[] => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    clearColumns: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
  },
  Sorting: {
    sortRows: <T>(rows: T[], sorts: TableSort<T>[]): T[] => {
      if (!sorts.length) return rows;
      return [...rows].sort((a: any, b: any) => {
        for (const s of sorts) {
          const key = s.id as string;
          const va = a[key],
            vb = b[key];
          if (va === vb) continue;
          if (va == null) return 1;
          if (vb == null) return -1;
          if (va < vb) return s.dir === "asc" ? -1 : 1;
          if (va > vb) return s.dir === "asc" ? 1 : -1;
        }
        return 0;
      });
    },
  },
  Columns: {
    initialize: <TItem>(config: TableSliceConfig<TItem>, ctx: any, storeKey: string): TableColumnDef<TItem>[] => {
      const rawCols = config.columns(ctx);
      const cellMap: TableCellMap = { ...(config.cellMap ?? {}) };

      const defaults = rawCols.map((col) => {
        const resolved: TableColumnDef<TItem> = {
          ...col,
          visible: col.visible !== false,
          header: col.header || col.id,
        };
        resolved.props ??= {};

        // Cell resolution: explicit cell > cellMap type > default string
        if (!resolved.cell) {
          const cellFn = resolved.type && typeof resolved.type === "string" ? (cellMap[resolved.type] ?? defaultStringCell) : defaultStringCell;

          if (resolved.resolve) {
            // Bake resolve into cell at init — zero checks at render
            const resolver = resolved.resolve;
            resolved.cell = (item: any, c: any, meta: any) => cellFn(item, { ...c, props: resolver(item, c) }, meta);
          } else {
            resolved.cell = cellFn;
          }
        }

        // Header resolution: only set renderHeader for explicit headerComponent.
        // When undefined, headBuilder (e.g. DSTableHead) falls through to resolve(col.header) for i18n.
        if (col.headerComponent) {
          resolved.renderHeader = col.headerComponent;
        }

        return resolved;
      });

      if (config.restoreFromStore !== false) {
        const stored = TableMechanics.Storage.getColumns(storeKey);
        if (stored && stored.length) {
          return defaults.map((d) => {
            const s = stored.find((sc: any) => sc.id === d.id);
            return s ? { ...d, visible: s.visible } : d;
          }) as TableColumnDef<TItem>[];
        }
      }
      return defaults as TableColumnDef<TItem>[];
    },
    /** Merges visibility changes into already-resolved columns (preserves cellMap cells). */
    setVisible: <TItem>(currentCols: TableColumnDef<TItem>[], incomingCols: TableColumnDef<TItem>[], storeKey: string): TableColumnDef<TItem>[] => {
      const incoming = new Map(incomingCols.map((c) => [c.id, c]));
      const updated = currentCols.map((base) => {
        const found = incoming.get(base.id);
        return found ? { ...base, visible: found.visible } : base;
      });
      TableMechanics.Storage.saveColumns(storeKey, updated);
      return updated as TableColumnDef<TItem>[];
    },
  },
  Selection: {
    toggle: <TItem>(prev: Record<string, TItem>, item: any, idKey: string): Record<string, TItem> => {
      const id = item[idKey];
      const clone = { ...prev };
      if (clone[id]) delete clone[id];
      else clone[id] = item;
      return clone;
    },
    isAllSelected: <TItem>(rows: TItem[], selected: Record<string, TItem>, idKey: string): boolean => {
      if (!rows || rows.length === 0) return false;
      return rows.every((r) => !!selected[(r as Record<string, unknown>)[idKey] as string]);
    },
    selectAll: <TItem>(rows: TItem[], idKey: string): Record<string, TItem> => {
      const map: Record<string, TItem> = {};
      rows.forEach((r) => {
        map[(r as Record<string, unknown>)[idKey] as string] = r;
      });
      return map;
    },
    isItemSelected: <TItem>(item: any, selected: Record<string, TItem>, idKey: string): boolean => {
      const id = item[idKey];
      return !!selected[id];
    },
  },
};
