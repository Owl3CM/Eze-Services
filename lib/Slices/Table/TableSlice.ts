import { Hive, IHive } from "../../Hives";
import { TableMechanics } from "./TableMechanics";
import { TableAPI, TableColumnDef, TableDependencies, TableSliceConfig, TableSort } from "./Types";

export function TableSlice<TItem = any, Ctx = any>(config: TableSliceConfig<TItem, Ctx>) {
  return (ctx: Ctx & TableDependencies<TItem>): { table: TableAPI<TItem> } => {
    const idKey = config.idKey ?? ("id" as string);
    const storeKey = config.storeKey ? `table_columns_${config.storeKey}` : `table_columns_${config.idKey ?? "default"}`;

    // Detect data source type
    const dataHive = ctx.paginator ? ctx.paginator.paginatorHive : ctx.loader!.loaderHive;

    const columnsHive = Hive.state<TableColumnDef<TItem>[]>([]);
    const selectedItemsHive = Hive.state<Record<string, TItem>>({}) as IHive<Record<string, TItem>>;
    const sortingHive = Hive.state<TableSort<TItem>[]>([] as any);

    const normalizeColumn = (col: TableColumnDef<TItem>) => {
      let header = col.header;
      if (!header) header = col.id;
      const cell = col.cell ?? ((item: TItem) => String((item as Record<string, unknown>)[col.id] ?? ""));
      return { ...col, header, cell };
    };

    const initializeColumns = () => {
      const cols = TableMechanics.Columns.initialize(config, ctx, storeKey).map(normalizeColumn);
      columnsHive.setHoney(cols);
    };

    const setVisibleColumns = (cols: TableColumnDef<TItem>[]) => {
      const updated = TableMechanics.Columns.setVisible(config, ctx, cols, storeKey).map(normalizeColumn);
      columnsHive.setHoney(updated);
    };

    const getVisibleColumns = () => columnsHive.honey.filter((c: TableColumnDef<TItem>) => c.visible !== false);
    const toggleColumnVisibility = (colId: string) => {
      const newCols = columnsHive.honey.map((c: TableColumnDef<TItem>) => (c.id === colId ? { ...c, visible: !c.visible } : c));
      columnsHive.setHoney([...newCols]);
      TableMechanics.Storage.saveColumns(storeKey, columnsHive.honey);
    };
    const toggleAllColumns = (val?: boolean) => {
      const newCols = columnsHive.honey.map((c: TableColumnDef<TItem>) => ({ ...c, visible: typeof val === "boolean" ? val : true }));
      columnsHive.setHoney(newCols as any);
      TableMechanics.Storage.saveColumns(storeKey, columnsHive.honey);
    };
    const resetColumns = () => {
      const defaults = config.columns(ctx).map((c) => ({ ...c, visible: c.visible !== false }));
      columnsHive.setHoney(defaults as any);
      TableMechanics.Storage.clearColumns(storeKey);
    };
    const restoreColumns = () => {
      initializeColumns();
    };

    const clearStoredColumns = () => {
      TableMechanics.Storage.clearColumns(storeKey);
      initializeColumns();
    };

    const setSelected = (next: Record<string, TItem> | ((prev: Record<string, TItem>) => Record<string, TItem>)) => {
      if (typeof next === "function") {
        const newVal = (next as any)(selectedItemsHive.honey);
        selectedItemsHive.setHoney(newVal);
      } else {
        selectedItemsHive.setHoney(next);
      }
    };

    const toggleItemSelection = (item: any) => {
      setSelected((prev) => TableMechanics.Selection.toggle(prev, item, idKey));
    };

    const isAllSelected = () => {
      const rows = dataHive.honey as TItem[];
      return TableMechanics.Selection.isAllSelected(rows, selectedItemsHive.honey, idKey);
    };

    const selectAllItems = () => {
      const rows = dataHive.honey as TItem[];
      setSelected(TableMechanics.Selection.selectAll(rows, idKey));
    };
    const unselectAllItems = () => setSelected({});
    const toggleAllItemsSelection = () => {
      if (isAllSelected()) unselectAllItems();
      else selectAllItems();
      dataHive.setHoney([...dataHive.honey]);
    };

    const setSorting = (sorts: TableSort<TItem>[]) => sortingHive.setHoney(sorts as any);
    const clearSorting = () => sortingHive.setHoney([] as any);
    const addSort = (s: TableSort<TItem>) => sortingHive.setHoney([...sortingHive.honey, s] as any);

    const getRawRows = (): TItem[] => (dataHive?.honey ?? []) as TItem[];
    const getFilteredRows = (): TItem[] => getRawRows().filter((r: any) => !(r && r.__table__hidden__ === true));
    const getSortedRows = (): TItem[] => {
      const rows = getFilteredRows();
      const sorts = sortingHive.honey as TableSort<TItem>[];
      return TableMechanics.Sorting.sortRows(rows, sorts);
    };

    const getViewRows = (applySorting = true) => (applySorting ? getSortedRows() : getFilteredRows());

    setTimeout(() => {
      restoreColumns();
    }, 1);

    return {
      table: {
        columnsHive,
        selectedItemsHive,
        sortingHive,
        storeKey,
        showIndex: config.showIndex !== false,
        showCheckBox: config.showCheckBox === true,
        toggleColumnsBtnVisible: config.toggleColumnsBtnVisible !== false,
        setVisibleColumns,
        getVisibleColumns,
        toggleColumnVisibility,
        toggleAllColumns,
        resetColumns,
        restoreColumns,
        clearStoredColumns,
        setSelected,
        toggleItemSelection,
        toggleAllItemsSelection,
        selectAllItems,
        unselectAllItems,
        isAllSelected,
        setSorting,
        clearSorting,
        addSort,
        getRawRows,
        getFilteredRows,
        getSortedRows,
        getViewRows,
        getExportColumns: () => columnsHive.honey.filter((c: TableColumnDef<TItem>) => !!c.export),
        isItemSelected: (item: TItem) => TableMechanics.Selection.isItemSelected(item, selectedItemsHive.honey, idKey),
      },
    };
  };
}
