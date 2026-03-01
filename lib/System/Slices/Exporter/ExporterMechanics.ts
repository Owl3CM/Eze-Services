import { TableColumnDef } from "../Table/Types";
import { ExporterDependencies, ExporterSliceConfig } from "./Types";

// TODO: Investigate these optional dependencies — they break consumer builds
// because rollup bundles the dynamic import() calls and consumers can't resolve them.
// Needs a proper solution (e.g., dependency injection or peer deps).
//
// const lazyExcelJS = async () => {
//   const mod = await import("exceljs");
//   return mod.default ?? mod;
// };
// const lazyCapacitorFilesystem = async () => {
//   const mod = await import("@capacitor/filesystem");
//   return { Filesystem: mod.Filesystem, Directory: mod.Directory };
// };
// const lazyCapacitorShare = async () => {
//   const mod = await import("@capacitor/share");
//   return mod.Share;
// };
// const lazyGetLabel = async () => {
//   const mod = await import("@/Language");
//   return mod.GetLabel;
// };

export const ExporterMechanics = {
  // CSV builder (robust escaping)
  rowsToCsv: (headers: string[], rows: Record<string, any>[]) => {
    const escape = (v: any) => {
      if (v == null) return "";
      const s = String(v);
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const lines: string[] = [];
    lines.push(headers.map((h) => escape(h)).join(","));
    for (const r of rows) {
      lines.push(headers.map((h) => escape(r[h])).join(","));
    }
    return lines.join("\n");
  },

  // TODO: Re-enable when optional deps are properly handled
  // Excel builder using ExcelJS
  // rowsToXlsx: async (headers: string[], rows: Record<string, any>[]) => {
  //   const ExcelJS = await lazyExcelJS();
  //   const wb = new ExcelJS.Workbook();
  //   const ws = wb.addWorksheet("Data");
  //   ws.columns = headers.map((h) => ({ header: String(h), key: String(h), width: Math.max(10, String(h).length + 4) }));
  //   rows.forEach((r) => ws.addRow(r));
  //   const buf = await wb.xlsx.writeBuffer();
  //   return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  // },

  saveFileBrowser: async (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // TODO: Re-enable when optional deps are properly handled
  // saveFileNative: async (filename: string, blob: Blob | string) => {
  //   try {
  //     const { Filesystem, Directory } = await lazyCapacitorFilesystem();
  //     const Share = await lazyCapacitorShare();
  //     const GetLabel = await lazyGetLabel();
  //     let base64: string;
  //     if (typeof blob === "string") base64 = blob;
  //     else {
  //       base64 = await new Promise<string>((res, rej) => {
  //         const reader = new FileReader();
  //         reader.onload = () => { res((reader.result as string).split(",")[1]); };
  //         reader.onerror = rej;
  //         reader.readAsDataURL(blob);
  //       });
  //     }
  //     const writeResult = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.External });
  //     const uri = writeResult.uri ?? ((writeResult as any).path ? `file://${(writeResult as any).path}` : undefined);
  //     if (uri) await Share.share({ title: GetLabel("downloaded"), url: uri });
  //   } catch (e) { console.warn("exporter: native save failed", e); }
  // },

  resolveData: async <TItem>(config: ExporterSliceConfig<TItem>, ctx: ExporterDependencies<TItem>): Promise<TItem[]> => {
    if (config.dataProvider) {
      const provided = config.dataProvider(ctx);
      return provided instanceof Promise ? await provided : provided;
    }
    const dataHive = ctx.paginator ? ctx.paginator.paginatorHive : ctx.loader!.loaderHive;
    return dataHive.honey as TItem[];
  },

  resolveColumns: <TItem>(config: ExporterSliceConfig<TItem>, ctx: ExporterDependencies<TItem>): TableColumnDef<TItem>[] => {
    let cols: TableColumnDef<TItem>[] = [];
    if (config.columns && config.columns.length) cols = config.columns;
    else if (ctx.table) {
      cols = ctx.table.columnsHive?.honey ?? [];
    }
    return cols.filter((c) => !!c.export);
  },

  applyPrepare: async <TItem>(config: ExporterSliceConfig<TItem>, items: TItem[], cols: TableColumnDef<TItem>[]) => {
    if (!config.prepare) return { items, cols };
    const out = await config.prepare(items, cols);
    if (!out) return { items, cols };
    if (Array.isArray(out)) return { items: out, cols };
    const maybe = out as { items?: TItem[]; cols?: TableColumnDef<TItem>[] };
    return { items: maybe.items ?? items, cols: maybe.cols ?? cols };
  },

  download: async <TItem>(config: ExporterSliceConfig<TItem>, ctx: ExporterDependencies<TItem>, opts: { type: "csv" | "excel" }) => {
    const run = async () => {
      let items = await ExporterMechanics.resolveData(config, ctx);
      let cols = ExporterMechanics.resolveColumns(config, ctx);

      const result = await ExporterMechanics.applyPrepare(config, items, cols);
      items = result.items!;
      cols = result.cols!;

      if (!cols.length) {
        console.warn("exporter: no export columns configured");
        return;
      }

      const headers = cols.map((c) => c.header!);
      const rows: Record<string, any>[] = items.map((it) => {
        const row: Record<string, any> = {};
        for (const c of cols) {
          row[c.header!] = c.export ? c.export.value(it) : "";
        }
        return row;
      });

      const filenameBase = config.filename ? config.filename(opts.type) : `export_${Date.now()}`;
      if (opts.type === "csv") {
        const csv = ExporterMechanics.rowsToCsv(headers, rows);
        await ExporterMechanics.saveFileBrowser(`${filenameBase}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      } else {
        // TODO: Re-enable excel export when optional deps are resolved
        console.warn("exporter: excel export is disabled until optional dependencies are resolved");
      }
    };

    if (config.useStatus && ctx.status) {
      try {
        ctx.status.ready().loading({ title: "Exporting..." });
        await run();
        ctx.status.ready().idle();
      } catch (e) {
        ctx.status.ready().error({ title: "Export failed" });
        throw e;
      }
    } else {
      try {
        await run();
      } catch (e) {
        throw e;
      }
    }
  },
};
