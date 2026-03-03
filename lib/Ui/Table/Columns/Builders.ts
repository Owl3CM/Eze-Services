import { TableColumnDef } from "../../../Slices/Table/Types";
import { ActionCell, DateCell, MoneyCell, StatusCell, TextCell } from "./StandardCells";

// ── Base Options ──
export interface BaseColOptions<T> extends Partial<TableColumnDef<T>> {
  header?: string;
  width?: number | string;
  visible?: boolean;
  sortable?: boolean;
}

// ── Text Column ──
export interface TextColOptions<T> extends BaseColOptions<T> {
  limit?: number;
}

export const textCol = <T>(id: string, header?: string, options: TextColOptions<T> = {}): TableColumnDef<T> => {
  const { limit, ...rest } = options;
  return {
    id,
    header,
    cell: (item: any) => TextCell({ value: item[id], limit }),
    export: { value: (item: any) => item[id] },
    ...rest,
  };
};

// ── Date Column ──
export interface DateColOptions<T> extends BaseColOptions<T> {
  format?: string;
}

export const dateCol = <T>(id: string, header?: string, options: DateColOptions<T> = {}): TableColumnDef<T> => {
  const { format, ...rest } = options;
  return {
    id,
    header,
    cell: (item: any) => DateCell({ value: item[id], format }),
    export: { value: (item: any) => new Date(item[id]).toISOString().split("T")[0] },
    ...rest,
  };
};

// ── Money Column ──
export interface MoneyColOptions<T> extends BaseColOptions<T> {
  currency?: string;
}

export const moneyCol = <T>(id: string, header?: string, options: MoneyColOptions<T> = {}): TableColumnDef<T> => {
  const { currency, ...rest } = options;
  return {
    id,
    header,
    cell: (item: any) => MoneyCell({ value: item[id], currency }),
    export: { value: (item: any) => item[id], calcTotal: true },
    ...rest,
  };
};

// ── Status Column ──
export const statusCol = <T>(id: string, header?: string, options: BaseColOptions<T> = {}): TableColumnDef<T> => ({
  id,
  header,
  cell: (item: any) => StatusCell({ value: item[id] }),
  export: { value: (item: any) => item[id] },
  ...options,
});

// ── Index Column ──
export const indexCol = <T>(options: Partial<TableColumnDef<T>> = {}): TableColumnDef<T> => ({
  id: "#",
  header: "#",
  cell: (_item: any, { index }: { index: number }) => index + 1,
  ...options,
});

// ── Actions Column ──
export const actionCol = <T>(
  actions: {
    icon: string;
    label: string;
    onClick: (item: T) => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    hidden?: (item: T) => boolean;
  }[],
  options: BaseColOptions<T> = {},
): TableColumnDef<T> => ({
  id: "actions",
  header: options.header || "",
  cell: (item) => ActionCell({ item, actions }),
  hideOnPrint: true,
  ...options,
});
