import { StorageType } from "../utils/Storable";

export interface IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  reset: () => void;
  clearStore?: () => void;
  initialValue: HiveType;
}

export type HiveGetter<HiveType> = (get: <Target>(a: IHive<Target>) => Target) => HiveType;
export type IHiveBase<HiveType> = [IHive<HiveType>, () => void];

export interface IHiveObserver<HiveType> {
  honey: any;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  setHoney?: undefined;
  silentSetHoney?: undefined;
}

export interface IHiveList<HiveType> {
  honey: HiveType[];
  setHoney: (newValue: HiveType[] | ((prev: HiveType[]) => HiveType[])) => void;
  silentSetHoney: (newValue: HiveType[]) => void;
  subscribe: (callback: (newValue: HiveType[]) => void) => () => void;
  _subscribers: () => number;
  push: (newValue: HiveType) => void;
  pop: () => void;
  shift: () => void;
  unshift: (newValue: HiveType) => void;
  splice: (start: number, deleteCount: number, ...items: HiveType[]) => void;
  remove: (id: any) => void;
  removeById: (id: any) => void;
  removeByIndex: (index: number) => void;
  append: (items: HiveType[]) => void;
  update: () => void;
  updateById: (id: any, newValue: Partial<HiveType>) => void;
  updateByIndex: (index: number, newValue: HiveType) => void;
  getById: (id: any) => HiveType | undefined;
}

export interface IProxyHive<HiveType> extends IHive<HiveType> {
  createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => IHive<NestedHiveType>;
  getNestedHive: <K extends keyof HiveType>(key: K) => IHive<HiveType[K]> | undefined;
  setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
  getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
  subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
  reset: () => void;
}

// ─── Field State Types ──────────────────────────────────────────────────────

export type FieldHoney<T, TState = {}> = { value: T; error?: string } & TState;

type ReservedFieldKeys = "value" | "error" | "set" | "setState" | "validate";
export type SafeFieldState<T> = keyof T extends string ? (Extract<keyof T, ReservedFieldKeys> extends never ? T : never) : T;

/** Backward-compatible value setter with an overload for one custom state key. */
export type FormFieldSetter<T, TState = {}> = {
  (value: T | ((prev: T) => T)): void;
  <K extends keyof TState>(key: K, value: TState[K]): void;
};

// ─── Form Hive ──────────────────────────────────────────────────────────────

export interface IFormHive<HiveType, TState = {}> extends IHive<HiveType> {
  createFieldHive: <FieldType>(
    key: string,
    initialValue: FieldType,
    initialState?: SafeFieldState<TState>,
    storeKey?: string,
  ) => INestedFormHive<FieldType, TState>;
  getFieldHive: <K extends keyof HiveType>(key: K) => INestedFormHive<HiveType[K], TState>;
  setFieldValue: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
  getFieldValue: <K extends keyof HiveType>(key: K) => HiveType[K];
  subscribeToField: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
  validate: <K extends keyof HiveType>(key: K, value: HiveType[K], effect?: boolean) => void;
  errors: { [key: string]: string | undefined };
  getError: (key: keyof HiveType) => string | undefined;
  setError: (key: keyof HiveType, value: string) => void;
  clearErrors: () => void;
  isDirtyHive: IHive<boolean>;
  isValidHive: IHive<boolean>;
  reValidate: <K extends keyof HiveType>(validateKeys?: K[]) => Promise<boolean>;
  submit: <K extends keyof HiveType>(e?: React.FormEvent<HTMLFormElement>, validateKeys?: K[]) => void;
  validateMode: FormValidateMode;
  reset: (initialValue?: Partial<HiveType>) => void;
  setFieldState: <K extends keyof HiveType>(fieldId: K, state: Partial<TState>) => void;
  getFieldState: <K extends keyof HiveType>(fieldId: K) => TState;
}

// ─── Nested Form Hive (per-field) ───────────────────────────────────────────

export interface INestedFormHive<HiveType, TState = {}> {
  initialValue: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: FieldHoney<HiveType, TState>) => void) => () => void;
  _subscribers: () => number;
  clearStore?: () => void;

  honey: FieldHoney<HiveType, TState>;

  error?: string;
  setError: (err?: string) => void;
  validate: (honey: HiveType, effect?: boolean) => void;
  isValid: () => boolean | Promise<boolean>;
  reset: () => void;

  set: <K extends keyof TState>(key: K, value: TState[K]) => void;
  setState: (state: Partial<TState>) => void;
}

// ─── Shared ─────────────────────────────────────────────────────────────────

export type IStoreKey = string | { storeKey: string; storage: StorageType };

export type FormValidateMode = "onBlur" | "onChange" | "onSubmit";

export type IFormHiveValidator<T> = {
  [K in keyof T]?: (value: T[K]) => string | undefined;
};
