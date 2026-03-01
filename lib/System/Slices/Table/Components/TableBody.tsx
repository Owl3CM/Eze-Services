import { TableAPI } from "../Types";
import { TableRow } from "./TableRow";

type Props<T> = {
  data: T[];
  tableSlice: TableAPI<T>;
  visibleColumns: any[];
};

export const TableBody = <T extends any>({ data, tableSlice, visibleColumns }: Props<T>) => {
  return (
    <tbody>
      {data.map((item, i) => (
        <TableRow key={(item as any).id || i} item={item} index={i} visibleColumns={visibleColumns} />
      ))}
    </tbody>
  );
};
