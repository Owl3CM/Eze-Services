// FactoryPackage.ts
export type Slice<T = any, Ctx = any> = (ctx: Ctx) => T;

export type Factory<Ctx = {}> = {
  use: <S extends Slice<any, Ctx>>(slice: S) => Factory<Ctx & ReturnType<S>>;
  build: () => Ctx;
};

export function createFactory<Ctx = {}>(): Factory<Ctx> {
  const slices: Slice[] = [];

  const factory: Factory<Ctx> = {
    use: <S extends Slice<any, Ctx>>(slice: S) => {
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
  };

  return factory;
}
