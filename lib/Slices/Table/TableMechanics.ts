import { TableColumnDef, TableSliceConfig, TableSort } from "./Types";

export const TableMechanics = {
  Storage: {
    saveColumns: (key: string, columns: TableColumnDef<any>[]) => {
      try {
        localStorage.setItem(key, JSON.stringify(columns));
      } catch {}
    },
    getColumns: <T>(key: string): Partial<TableColumnDef<T>>[] => {
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
          if (va == null) return s.dir === "asc" ? -1 : 1;
          if (vb == null) return s.dir === "asc" ? 1 : -1;
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
      const defaults = rawCols.map((col) => {
        col.visible = col.visible !== false;
        if (!col.cell) col.cell = (item: any) => item[col.id] ?? "";
        if (!col.header) col.header = col.id;
        return col;
      });

      if (config.restoreFromStore !== false) {
        const stored = TableMechanics.Storage.getColumns(storeKey);
        if (stored && stored.length) {
          const merged = defaults.map((d) => {
            const s = stored.find((sc: any) => sc.id === d.id);
            if (s) d.visible = s.visible;
            return d;
          });
          return merged as any;
        }
      }
      return defaults as any;
    },
    setVisible: <TItem>(config: TableSliceConfig<TItem>, ctx: any, cols: TableColumnDef<TItem>[], storeKey: string): TableColumnDef<TItem>[] => {
      const updated = config.columns(ctx).map((base) => {
        const found = cols.find((c) => c.id === base.id);
        return found ? { ...base, ...found } : base;
      });
      TableMechanics.Storage.saveColumns(storeKey, updated);
      return updated as any;
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
      return rows.every((r: any) => !!selected[(r as any)[idKey]]);
    },
    selectAll: <TItem>(rows: TItem[], idKey: string): Record<string, TItem> => {
      const map: Record<string, TItem> = {};
      rows.forEach((r: any) => {
        map[(r as any)[idKey]] = r;
      });
      return map;
    },
    isItemSelected: <TItem>(item: any, selected: Record<string, TItem>, idKey: string): boolean => {
      const id = item[idKey];
      return !!selected[id];
    },
  },
};
