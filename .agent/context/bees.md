# Bee Components

**Pattern:** Children-as-function with object destructuring.

## Component Table

| Component         | Mode       | Children args                           | Hive type                |
| ----------------- | ---------- | --------------------------------------- | ------------------------ |
| `<Honey>`         | Read-only  | `{ honey }`                             | `IHive`, `IHiveObserver` |
| `<Bee>`           | Read+Write | `{ honey, set, silentSet }`             | `IHive`                  |
| `<Bee.Form>`      | Form R+W   | `{ value, set, error, validate }`       | `INestedFormHive`        |
| `<Honey.Form>`    | Form Read  | `{ value, error }`                      | `INestedFormHive`        |
| `<Honey.List>`    | Array      | `{ item, i }`                           | `IHiveArray`             |
| `<Bee.Proxy>`     | Nested     | `{ honey, set, silentSet }` + `id` prop | `IProxyHive`             |
| `<Honey.Cluster>` | Multi Read | `{ cell }`                              | `HiveCluster`            |
| `<Bee.Cluster>`   | Multi R+W  | `{ cell, set }`                         | `HiveCluster`            |

> `HiveCluster` = `Record<string, IHive<any> | IHiveObserver<any> | IHiveArray<any>>`

## Usage Examples

```tsx
import { Honey, Bee } from "eze-factory";

// Read-only
<Honey hive={themeHive}>{({ honey }) => <div>{honey.mode}</div>}</Honey>

// Read + Write
<Bee hive={counterHive}>{({ honey, set }) => <button onClick={() => set(honey + 1)}>{honey}</button>}</Bee>

// Form field
<Bee.Form hive={emailHive}>{({ value, set, error }) => <input value={value} onChange={e => set(e.target.value)} />}</Bee.Form>

// Form read-only
<Honey.Form hive={emailHive}>{({ value, error }) => <span>{value}</span>}</Honey.Form>

// Array iteration
<Honey.List hive={itemsHive}>{({ item, i }) => <li>{item.name}</li>}</Honey.List>

// Nested proxy
<Bee.Proxy hive={userHive} id="address">{({ honey, set }) => <input value={honey.street} />}</Bee.Proxy>

// Multi-hive read
<Honey.Cluster hives={{ user: userHive, theme: themeHive }}>
  {({ cell }) => <div className={cell.theme.mode}>{cell.user.name}</div>}
</Honey.Cluster>

// Multi-hive read+write
<Bee.Cluster hives={{ count: countHive, name: nameHive }}>
  {({ cell, set }) => <button onClick={() => set({ count: 0 })}>{cell.count}</button>}
</Bee.Cluster>
```

## Type Exports

All from `Bees/Types.ts`:

**Props:** `HoneyProps<T>`, `HoneyFormProps<T>`, `BeeProps<T>`, `BeeFormProps<T>`, `BeeListProps<T>`, `BeeProxyProps<T>`, `HoneyClusterProps<T>`, `BeeClusterProps<T>`

**Children args:** `HoneyChildrenArgs<T>`, `HoneyFormChildrenArgs<T>`, `BeeChildrenArgs<T>`, `BeeFormChildrenArgs<T>`, `BeeListChildrenArgs<T>`, `BeeProxyChildrenArgs<T>`, `HoneyClusterChildrenArgs<T>`, `BeeClusterChildrenArgs<T>`

**Cluster utilities:** `HiveCluster`, `ClusterValues<T>`

**Legacy (used by ControllerContainers):** `INestedFormHoneySetter<K>`, `ProxyHoneySetter<K>`

## Source Files

| File             | Path                 |
| ---------------- | -------------------- |
| Honey component  | `lib/Bees/Honey.tsx` |
| Bee component    | `lib/Bees/Bee.tsx`   |
| Type definitions | `lib/Bees/Types.ts`  |
| Barrel export    | `lib/Bees/index.ts`  |
