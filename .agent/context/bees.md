# Bee Components

**Pattern:** Children-as-function with object destructuring.

## Component Table

| Component         | Mode       | Children args                            | Hive type                |
| ----------------- | ---------- | ---------------------------------------- | ------------------------ |
| `<Honey>`         | Read-only  | `{ honey }`                              | `IHive`, `IHiveObserver` |
| `<Bee>`           | Read+Write | `{ honey, set, silentSet }`              | `IHive`                  |
| `<Bee.Field>`     | Form R+W   | `{ honey, value, set, validate, error }` | `INestedFormHive`        |
| `<Honey.Field>`   | Form Read  | `{ honey, value, error }`                | `INestedFormHive`        |
| `<Honey.List>`    | Array      | `{ item, i }`                            | `IHiveList`              |
| `<Bee.Proxy>`     | Nested     | `{ honey, set, silentSet }` + `id` prop  | `IProxyHive`             |
| `<Honey.Cluster>` | Multi Read | `{ cell }`                               | `HiveCluster`            |
| `<Bee.Cluster>`   | Multi R+W  | `{ cell, set }`                          | `HiveCluster`            |

> `HiveCluster` = `Record<string, IHive<any> | IHiveObserver<any> | IHiveList<any>>`

## Usage Examples

```tsx
import { Honey, Bee } from "eze-factory";

// Read-only
<Honey hive={themeHive}>{({ honey }) => <div>{honey.mode}</div>}</Honey>

// Read + Write
<Bee hive={counterHive}>{({ honey, set }) => <button onClick={() => set(honey + 1)}>{honey}</button>}</Bee>

// Form field (read+write)
<Bee.Field hive={formHive.getFieldHive("email")}>
  {({ honey, validate }) => <input value={honey.value} onChange={e => validate(e.target.value)} />}
</Bee.Field>

// Form field (read-only)
<Honey.Field hive={formHive.getFieldHive("email")}>
  {({ honey }) => <span>{honey.value}</span>}
</Honey.Field>

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

**Props:** `HoneyProps<T>`, `HoneyFieldProps<T>`, `BeeProps<T>`, `BeeFieldProps<T>`, `BeeListProps<T>`, `BeeProxyProps<T>`, `HoneyClusterProps<T>`, `BeeClusterProps<T>`

**Children args:** `HoneyChildrenArgs<T>`, `HoneyFieldChildrenArgs<T>`, `BeeChildrenArgs<T>`, `BeeFieldChildrenArgs<T>`, `BeeListChildrenArgs<T>`, `BeeProxyChildrenArgs<T>`, `HoneyClusterChildrenArgs<T>`, `BeeClusterChildrenArgs<T>`

**Cluster utilities:** `HiveCluster`, `ClusterValues<T>`

## Source Files

| File             | Path                 |
| ---------------- | -------------------- |
| Honey component  | `lib/Bees/Honey.tsx` |
| Bee component    | `lib/Bees/Bee.tsx`   |
| Type definitions | `lib/Bees/Types.ts`  |
| Barrel export    | `lib/Bees/index.ts`  |
