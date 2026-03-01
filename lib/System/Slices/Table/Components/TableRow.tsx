import { Fragment } from "react";
import { TableColumnDef } from "../Types";

type Props<T> = {
  item: T;
  index: number;
  visibleColumns: TableColumnDef<T>[];
};

export const TableRow = <T extends any>({ item, index, visibleColumns }: Props<T>) => {
  return (
    <tr>
      {visibleColumns.map(({ id, cell, ...props }) => (
        // @ts-ignore
        <Fragment key={id}>{cell(item, { ...props, index })}</Fragment>
      ))}
    </tr>
  );
};
