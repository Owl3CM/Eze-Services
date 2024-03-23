import { create } from "zustand";

type IStateValueTypeObj<T> =
  | {
      [key in keyof T]: (prev: any) => any;
    }
  | { [key in keyof T]: any };

export interface IStateManager<T = any> {
  set: (stateUpdates: Partial<T> | ((prevState: T) => Partial<T>), replace?: boolean) => void;
  setTo: <K extends keyof T>(name: K, value: T[K] | ((prev: T[K]) => T[K])) => void;

  get: <K extends keyof T>(name: K) => T[K];
  getMultiple: <K extends keyof T>(names: K[]) => Pick<T, K>;
  getAll: () => T;

  listen: (listener: (state: T) => T) => () => any;
  // make it return array of [value, set]
  listenTo: <K extends keyof T>(name: K) => [T[K], (value: T[K]) => void];
  listenToMultiple: <K extends keyof T>(names: K[]) => [Pick<T, K>, (values: Pick<T, K>) => void];

  subscribe: (listener: (state: T) => void) => () => void;
  subscribeTo: <K extends keyof T>(name: K, listener: (value: T[K]) => void) => () => void;
  subscribeToMultiple: <K extends keyof T>(names: K[], listener: (values: Pick<T, K>) => void) => () => void;
}
// export type IStateValueType<T = any> = typeof StateManager<T>;
export class StateManager<T> implements IStateManager<T> {
  // set: (values: IStateValueTypeObj<T>, replace?: boolean) => void = () => {};
  // setTo: (name: keyof T, value: IStateValueType) => void = () => {};

  // get: (name: keyof T) => void = () => {};
  // getMultiple: (names: (keyof T)[]) => void = () => {};
  // getAll: () => { [key in keyof T]: any } = () => ({} as any);

  // listen: (state: T) => T = () => ({} as any);
  // listenTo: (name: keyof T) => void = () => {};
  // listenToMultiple: (names: (keyof T)[]) => void = () => {};

  // subscribe: (listener: (values: { [key in keyof T]: any }) => void) => void = () => {};
  // subscribeTo: (name: keyof T, listener: (value: any) => void) => void = () => {};
  // subscribeToMultiple: (names: (keyof T)[], listener: (values: { [key in keyof T]: any }) => void) => void = () => {};

  set: (stateUpdates: Partial<T> | ((prevState: T) => Partial<T>), replace?: boolean) => void = () => {};
  setTo: <K extends keyof T>(name: K, value: T[K] | ((prev: T[K]) => T[K])) => void = () => {};

  get: <K extends keyof T>(name: K) => T[K] = () => ({} as any);
  getMultiple: <K extends keyof T>(names: K[]) => Pick<T, K>;
  getAll: () => T;

  listen: (listener: (state: T) => T) => () => any;
  listenTo: <K extends keyof T>(name: K) => [T[K], (value: T[K]) => void];
  listenToMultiple: <K extends keyof T>(names: K[]) => Pick<T, K> | any;
  subscribe: (listener: (state: T) => void) => () => void;
  subscribeTo: <K extends keyof T>(name: K, listener: (value: T[K]) => void) => () => void;
  subscribeToMultiple: <K extends keyof T>(names: K[], listener: (values: Pick<T, K>) => void) => () => void;

  constructor(initialState: T) {
    const store = create<T>((set: any, get) => {
      this.set = set;
      this.setTo = (name, value) => {
        set((prev: any) => ({ [name]: typeof value === "function" ? (value as any)(prev[name]) : value }));
      };
      this.get = (name) => (get as any)()[name];
      return initialState;
    });

    this.listen = store;
    this.subscribe = store.subscribe;
    this.getAll = () => (store as any).getState();

    this.listenTo = (name) => [store((state: any) => state[name]), (value: any) => this.setTo(name, value)];

    this.listenToMultiple = (names) => store((state: any) => names.reduce((acc, name) => ({ ...acc, [name]: state[name] }), {}));

    this.getMultiple = (names) => (store as any)((state: any) => names.reduce((acc, name) => ({ ...acc, [name]: state[name] }), {}));

    this.subscribeTo = (name, listener) => (store as any).subscribe((state: any) => state[name], listener);
    this.subscribeToMultiple = (names, listener) =>
      store.subscribe((state) => listener(names.reduce((acc, name) => ({ ...acc, [name]: (state as any)[name] }), {} as any)));
  }
  static Create: <T>(initialState: T) => IStateManager<T> = (initialState) => new StateManager(initialState);
}
