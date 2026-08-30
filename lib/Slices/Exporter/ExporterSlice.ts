import { defaultReadyHandler } from "../OperationHandler";
import { ExporterMechanics } from "./ExporterMechanics";
import { ExporterAPI, ExporterDependencies, ExporterSliceConfig } from "./Types";

export function ExporterSlice<TItem = any>(config: ExporterSliceConfig<TItem> = {}) {
  // Rule 1: Build Clean, Run Lean — resolve handler factory at construction
  const handlerFactory = config.operationHandler ?? defaultReadyHandler();

  return (ctx: any): { exporter: ExporterAPI } => {
    const deps = ctx as ExporterDependencies<TItem>;
    // Resolve handler ONCE at build time
    const handler = handlerFactory(ctx);

    async function download(opts: { type: "csv" | "excel" }) {
      await ExporterMechanics.download(config, handler, deps, opts);
    }

    return {
      exporter: { download },
    };
  };
}
