import React from "react";
import type { CellFunction } from "../../Slices/Table/Types";

// ─── Adapter options ─────────────────────────────────────────────────────────
export interface CreateTableCellOptions {
  /** Which prop to pass `item[col.id]` as. Default: "value" */
  valueProp?: string;
  /** Transform `item[col.id]` before passing to the component. */
  transform?: (raw: any) => any;
  /** Extra static props to pass to the component. */
  extraProps?: Record<string, any>;
}

// ─── Branded cell function — phantom carries passthrough props ───────────────
/** CellFunction with phantom passthrough type for TypedCellProps extraction. */
export type BrandedCellFunction<Passthrough = Record<string, any>> = CellFunction & {
  readonly __passthrough?: Passthrough;
};

/**
 * Wraps any React component into a CellFunction.
 *
 * Prop precedence: `extraProps` < `item[col.id]` < `col.props`
 * When `col.resolve` is used, Mechanics pre-fills `col.props` at init time.
 *
 * @example
 * const moneyCellFn = createTableCell(MoneyCell);
 * const dateCellFn  = createTableCell(DatePicker, { valueProp: "date", transform: (v) => new Date(v) });
 */
export function createTableCell<P extends Record<string, any>, Excluded extends keyof P = "value">(
  Component: React.ComponentType<P>,
  options?: CreateTableCellOptions,
): BrandedCellFunction<Omit<P, Excluded>> {
  const { valueProp = "value", transform, extraProps } = options ?? {};
  const resolve = transform ?? ((raw: any) => raw);

  const cellFn: CellFunction = (item, col) => <Component {...({ ...extraProps, [valueProp]: resolve(item[col.id]), ...col.props } as P)} />;

  return cellFn as BrandedCellFunction<Omit<P, Excluded>>;
}
