import { useHoney } from "../../Hooks";
import type {
  TableAPI,
  TableColumnDef,
  TableSort,
  DataTableBaseProps,
  TableHeadBuilderProps,
  TableRowBuilderProps,
  TableFooterBuilderProps,
  TableEmptyBuilderProps,
} from "../../Slices/Table/Types";
import "./table.css";

// ═══════════════════════════════════════════════════════
// ── DataTableBase (orchestrator) ──────────────────────
// ═══════════════════════════════════════════════════════

export function DataTableBase<T>({
  table,
  data,
  onRowClick,
  headBuilder: HeadBuilder = DefaultTableHead,
  rowBuilder: RowBuilder = DefaultTableRow,
  footerBuilder: FooterBuilder = DefaultTableFooter,
  emptyBuilder: EmptyBuilder = DefaultTableEmpty,
  emptyMessage = "No data",
  className,
  children,
}: DataTableBaseProps<T>) {
  const columns = useHoney(table.columnsHive);
  const sorting = useHoney(table.sortingHive);
  useHoney(table.selectedItemsHive);

  const visibleColumns = columns.filter((c: TableColumnDef<T>) => c.visible !== false);
  const rows = table.getViewRows();

  const handleSort = (colId: string) => {
    const existing = sorting.find((s: TableSort<T>) => s.id === colId);
    if (existing) {
      if (existing.dir === "asc") {
        table.setSorting(sorting.map((s: TableSort<T>) => (s.id === colId ? { ...s, dir: "desc" as const } : s)));
      } else {
        table.setSorting(sorting.filter((s: TableSort<T>) => s.id !== colId));
      }
    } else {
      table.setSorting([...sorting, { id: colId as keyof T & string, dir: "asc" }]);
    }
  };

  const colSpan = visibleColumns.length + (table.showCheckBox ? 1 : 0) + (table.showIndex ? 1 : 0);

  return (
    <div className={className ?? "ez-table"}>
      <table>
        <HeadBuilder
          columns={visibleColumns}
          sorting={sorting}
          onSort={handleSort}
          showCheckBox={table.showCheckBox}
          showIndex={table.showIndex}
          isAllSelected={table.isAllSelected()}
          onToggleAll={() => table.toggleAllItemsSelection()}
          table={table}
        />
        <tbody>
          {rows.length === 0 ? (
            <EmptyBuilder message={emptyMessage} colSpan={colSpan} />
          ) : (
            rows.map((item, i) => (
              <RowBuilder
                key={((item as Record<string, unknown>).id as string) ?? i}
                item={item}
                index={i}
                columns={visibleColumns}
                isSelected={table.isItemSelected(item)}
                showCheckBox={table.showCheckBox}
                showIndex={table.showIndex}
                onToggleSelect={() => table.toggleItemSelection(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              />
            ))
          )}
        </tbody>
      </table>
      {children && <FooterBuilder totalItems={data.length}>{children}</FooterBuilder>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ── Default Builders (ez-table__* light theme) ───────
// ═══════════════════════════════════════════════════════

function DefaultTableHead<T>({ columns, sorting, onSort, showCheckBox, showIndex, isAllSelected, onToggleAll, table }: TableHeadBuilderProps<T>) {
  return (
    <thead className="ez-table__head">
      <tr>
        {showCheckBox && (
          <th className="ez-table__th ez-table__th--checkbox">
            <input type="checkbox" checked={isAllSelected} onChange={onToggleAll} />
          </th>
        )}
        {showIndex && <th className="ez-table__th ez-table__th--index">#</th>}
        {columns.map((col) => {
          const sort = sorting.find((s) => s.id === col.id);
          return (
            <th key={col.id} className="ez-table__th" data-sort-dir={sort?.dir} onClick={() => onSort(col.id)}>
              {col.headerComponent ? col.headerComponent(table) : col.header}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function DefaultTableRow<T>({ item, index, columns, isSelected, showCheckBox, showIndex, onToggleSelect, onClick }: TableRowBuilderProps<T>) {
  return (
    <tr className="ez-table__row" data-selected={isSelected || undefined} onClick={onClick}>
      {showCheckBox && (
        <td className="ez-table__td ez-table__td--checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
          />
        </td>
      )}
      {showIndex && <td className="ez-table__td ez-table__td--index">{index + 1}</td>}
      {columns.map((col) => (
        <td key={col.id} className="ez-table__td">
          {col.cell!(item, { index })}
        </td>
      ))}
    </tr>
  );
}

function DefaultTableFooter({ totalItems, children }: TableFooterBuilderProps) {
  return (
    <div className="ez-table__footer">
      <span className="ez-table__footer-info">{totalItems != null ? `Total: ${totalItems}` : ""}</span>
      <div className="ez-table__footer-controls">{children}</div>
    </div>
  );
}

function DefaultTableEmpty({ message, colSpan }: TableEmptyBuilderProps) {
  return (
    <tr>
      <td className="ez-table__empty" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
}
