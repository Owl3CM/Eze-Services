import { TableAPI, TableColumnDef } from "../../Slices/Table/Types";
import { TableRow } from "./TableRow";

type Props<T> = {
  data: T[];
  tableSlice: TableAPI<T>;
  visibleColumns: TableColumnDef<T>[];
};

export const TableBody = <T extends any>({ data, tableSlice, visibleColumns }: Props<T>) => {
  return (
    <tbody>
      {data.map((item, i) => (
        <TableRow key={((item as Record<string, unknown>).id as string) ?? i} item={item} index={i} visibleColumns={visibleColumns} />
      ))}
    </tbody>
  );
};
