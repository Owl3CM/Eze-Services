# React Hooks

**Count:** 6 hooks

## Hook Reference

| Hook           | Input                       | Returns                                                   | Use For                  |
| -------------- | --------------------------- | --------------------------------------------------------- | ------------------------ |
| `useHoney`     | Any hive type               | `T` (value only)                                          | Read-only subscription   |
| `useHive`      | `IHive<T>`                  | `[T, setHoney]` tuple                                     | Read + write             |
| `useFormField` | `IFormHive<T, TState>, key` | `{ value, error?, ...TState, validate, set, setValue, setState }` | Form field read + write  |
| `useForm`      | `IFormHive<T>`              | `{ values, isDirty, isValid, submit, reset, reValidate }` | Form-level state         |
| `useProxy`     | `IProxyHive<T>, key`        | `[value, set]` tuple                                      | Nested hive read + write |
| `useCluster`   | `HiveCluster`               | `ClusterValues<T>` object                                 | Multi-hive subscription  |

> `HiveCluster` = `Record<string, IHive<any> | IHiveObserver<any> | IHiveList<any>>`

## Notes

- `useHoney` is the **primary hook** — accepts `IHive`, `IHiveObserver`, `IHiveList`, `INestedFormHive`
- `useHive` is a convenience wrapper: `[useHoney(hive), hive.setHoney]`
- `useFormField` takes `(formHive, key)` — resolves `getFieldHive()` internally, spreads `useHoney(fieldHive)` (which is `FieldHoney<T, TState>` = `{ value, error?, ...TState }`), then adds `validate`, overloaded `set`, `setValue`, and `setState`. `set(value)` updates the field value; `set(key, value)` updates one custom-state key.
- `useForm` subscribes to form-level hives (`isDirtyHive`, `isValidHive`) and exposes `submit`, `reset`, `reValidate`
- `useCluster` calls `useHoney` per-key — re-renders on ANY hive change in the cluster
- `useProxy` handles nested hive resolution internally

## Source Files

| File               | Path                        |
| ------------------ | --------------------------- |
| Primary read hook  | `lib/Hooks/useHoney.ts`     |
| Read + write       | `lib/Hooks/useHive.ts`      |
| Form field         | `lib/Hooks/useFormField.ts` |
| Form-level state   | `lib/Hooks/useForm.ts`      |
| Nested proxy       | `lib/Hooks/useProxy.ts`     |
| Multi-hive cluster | `lib/Hooks/useCluster.ts`   |
| Barrel export      | `lib/Hooks/index.ts`        |
