# React Hooks

**Count:** 7 hooks

## Hook Reference

| Hook           | Input                | Returns                       | Use For                  |
| -------------- | -------------------- | ----------------------------- | ------------------------ |
| `useHoney`     | Any hive type        | `T` (value only)              | Read-only subscription   |
| `useHive`      | `IHive<T>`           | `[T, setHoney]` tuple         | Read + write             |
| `useFormHoney` | `INestedFormHive<T>` | `{value, error?}`             | Read form field          |
| `useFormHive`  | `INestedFormHive<T>` | `[{value, error?}, validate]` | Read + validate form     |
| `useProxy`     | `IProxyHive<T>, key` | `[value, set]` tuple          | Nested hive read + write |
| `useFormProxy` | `IFormHive<T>, key`  | `{value, error?}`             | Nested form hive read    |
| `useCluster`   | `HiveCluster`        | `ClusterValues<T>` object     | Multi-hive subscription  |

> `HiveCluster` = `Record<string, IHive<any> | IHiveObserver<any> | IHiveArray<any>>`

## Notes

- `useHoney` is the **primary hook** — accepts `IHive`, `IHiveObserver`, `IHiveArray`, `INestedFormHive`
- `useHive` is a convenience wrapper: `[useHoney(hive), hive.setHoney]`
- `useCluster` calls `useHoney` per-key — re-renders on ANY hive change in the cluster
- `useProxy` / `useFormProxy` handle nested hive resolution internally

## Source Files

| File                  | Path                        |
| --------------------- | --------------------------- |
| Primary read hook     | `lib/Hooks/useHoney.ts`     |
| Read + write          | `lib/Hooks/useHive.ts`      |
| Form field read       | `lib/Hooks/useFormHoney.ts` |
| Form field + validate | `lib/Hooks/useFormHive.ts`  |
| Nested proxy          | `lib/Hooks/useProxy.ts`     |
| Nested form proxy     | `lib/Hooks/useFormProxy.ts` |
| Multi-hive cluster    | `lib/Hooks/useCluster.ts`   |
| Barrel export         | `lib/Hooks/index.ts`        |
