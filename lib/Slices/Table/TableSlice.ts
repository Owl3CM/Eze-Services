import { Hive, IHive } from "../../Hives";
import { TableMechanics } from "./TableMechanics";
import { TABLE_HIDDEN_FLAG, TableAPI, TableColumnDef, TableDependencies, TableSliceConfig, TableSort } from "./Types";

export function TableSlice<TItem = any, Ctx = any>(config: TableSliceConfig<TItem, Ctx>) {
  return (ctx: Ctx & TableDependencies<TItem>): { table: TableAPI<TItem> } => {
    const idKey = config.idKey ?? ("id" as string);
    const storeKey = config.storeKey ? `table_columns_${config.storeKey}` : `table_columns_${config.idKey ?? "default"}`;

    // Detect data source type
    const dataHive = ctx.paginator ? ctx.paginator.paginatorHive : ctx.loader!.loaderHive;

    const columnsHive = Hive.state<TableColumnDef<TItem>[]>([]);
    const selectedItemsHive = Hive.state<Record<string, TItem>>({}) as IHive<Record<string, TItem>>;
    const sortingHive = Hive.state<TableSort<TItem>[]>([] as TableSort<TItem>[]);

    const initializeColumns = () => {
      const cols = TableMechanics.Columns.initialize(config, ctx, storeKey);
      columnsHive.setHoney(cols);
    };

    const setVisibleColumns = (cols: TableColumnDef<TItem>[]) => {
      const updated = TableMechanics.Columns.setVisible(columnsHive.honey, cols, storeKey);
      columnsHive.setHoney(updated);
    };

    const getVisibleColumns = () => columnsHive.honey.filter((c: TableColumnDef<TItem>) => c.visible !== false);
    const toggleColumnVisibility = (colId: string) => {
      const updated = columnsHive.honey.map((c: TableColumnDef<TItem>) => (c.id === colId ? { ...c, visible: !c.visible } : c));
      columnsHive.setHoney(updated);
      TableMechanics.Storage.saveColumns(storeKey, updated);
    };
    const toggleAllColumns = (val = true) => {
      const updated = columnsHive.honey.map((c: TableColumnDef<TItem>) => ({ ...c, visible: val }));
      columnsHive.setHoney(updated);
      TableMechanics.Storage.saveColumns(storeKey, updated);
    };
    const resetColumns = () => {
      TableMechanics.Storage.clearColumns(storeKey);
      initializeColumns();
    };

    const setSelected = (next: Record<string, TItem> | ((prev: Record<string, TItem>) => Record<string, TItem>)) => {
      if (typeof next === "function") {
        const newVal = (next as (prev: Record<string, TItem>) => Record<string, TItem>)(selectedItemsHive.honey);
        selectedItemsHive.setHoney(newVal);
      } else {
        selectedItemsHive.setHoney(next);
      }
    };

    const toggleItemSelection = (item: any) => {
      setSelected((prev) => TableMechanics.Selection.toggle(prev, item, idKey));
    };

    const isAllSelectedHive = Hive.observer((observe) => {
      const rows = observe(dataHive as IHive<TItem[]>);
      const selected = observe(selectedItemsHive);
      return TableMechanics.Selection.isAllSelected(rows, selected, idKey);
    });
    const isAllSelected = () => isAllSelectedHive.honey;

    const selectAllItems = () => {
      const rows = dataHive.honey as TItem[];
      setSelected(TableMechanics.Selection.selectAll(rows, idKey));
    };
    const unselectAllItems = () => setSelected({});
    const toggleAllItemsSelection = () => {
      if (isAllSelected()) unselectAllItems();
      else selectAllItems();
    };

    const setSorting = (sorts: TableSort<TItem>[]) => sortingHive.setHoney(sorts as TableSort<TItem>[]);
    const clearSorting = () => sortingHive.setHoney([] as TableSort<TItem>[]);
    const addSort = (s: TableSort<TItem>) => sortingHive.setHoney([...sortingHive.honey, s] as TableSort<TItem>[]);

    const getRawRows = (): TItem[] => (dataHive?.honey ?? []) as TItem[];
    const getFilteredRows = (): TItem[] => getRawRows().filter((r: any) => !(r && r[TABLE_HIDDEN_FLAG] === true));
    const getSortedRows = (): TItem[] => {
      const rows = getFilteredRows();
      const sorts = sortingHive.honey as TableSort<TItem>[];
      return TableMechanics.Sorting.sortRows(rows, sorts);
    };

    const getViewRows = (applySorting = true) => (applySorting ? getSortedRows() : getFilteredRows());

    queueMicrotask(initializeColumns);

    return {
      table: {
        columnsHive,
        selectedItemsHive,
        sortingHive,
        isAllSelectedHive,
        storeKey,
        showIndex: config.showIndex !== false,
        showCheckBox: config.showCheckBox === true,
        toggleColumnsBtnVisible: config.toggleColumnsBtnVisible !== false,
        setVisibleColumns,
        getVisibleColumns,
        toggleColumnVisibility,
        toggleAllColumns,
        resetColumns,
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
