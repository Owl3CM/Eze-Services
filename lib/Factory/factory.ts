// FactoryPackage.ts
import { useRef } from "react";

export type Slice<T = any, Ctx = any> = (ctx: Ctx) => T;

export type Factory<Ctx = {}> = {
  use: <ReqCtx, Add>(
    slice: (ctx: ReqCtx) => Add,
  ) => Ctx extends ReqCtx ? Factory<Ctx & Add> : "Error: Factory context is missing required properties for this slice";
  build: () => Ctx;
  useBuild: () => Ctx;
};

export function createFactory<Ctx = {}>(): Factory<Ctx> {
  const slices: Slice[] = [];

  const factory: Factory<Ctx> = {
    use: <ReqCtx, Add>(slice: (ctx: ReqCtx) => Add) => {
      slices.push(slice);
      return factory as any;
    },
    build: () => {
      const ctx: any = {};
      for (const slice of slices) {
        const result = slice(ctx);
        Object.assign(ctx, result);
      }
      return ctx as Ctx;
    },
    useBuild: () => {
      const ref = useRef<Ctx | null>(null);
      if (!ref.current) ref.current = factory.build();
      return ref.current;
    },
  };

  return factory;
}
