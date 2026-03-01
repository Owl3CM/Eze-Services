import { Fragment } from "react/jsx-runtime";
import { TableAPI, TableColumnDef } from "../Types";

type Props<T> = {
  tableSlice: TableAPI<T>;
  visibleColumns: TableColumnDef<T>[];
};

export const TableHead = <T extends any>({ tableSlice, visibleColumns }: Props<T>) => {
  return (
    <thead>
      <tr>
        {visibleColumns.map((col) => {
          return col.headerComponent ? (
            //
            <Fragment key={col.id}>{col.headerComponent(tableSlice)}</Fragment>
          ) : (
            <th key={col.id}>{col.header}</th>
          );
        })}
      </tr>
    </thead>
  );
};
