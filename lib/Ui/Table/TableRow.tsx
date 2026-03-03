import { Fragment } from "react";
import { TableColumnDef } from "../../Slices/Table/Types";

type Props<T> = {
  item: T;
  index: number;
  visibleColumns: TableColumnDef<T>[];
};

export const TableRow = <T extends any>({ item, index, visibleColumns }: Props<T>) => {
  return (
    <tr>
      {visibleColumns.map(({ id, cell }) => (
        <Fragment key={id}>{cell!(item, { index })}</Fragment>
      ))}
    </tr>
  );
};
