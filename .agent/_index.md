# Eze-Factory

**Purpose:** Architecture framework — factory pattern + slices + hives + validation
**Philosophy:** Strict separation: **Logic (pure TS) ↔ UI (React)**

## Quick Map

| Concept     | Description                                             |
| ----------- | ------------------------------------------------------- |
| **Hive**    | Reactive state container (like atoms/signals) — pure TS |
| **Bee**     | React connector: children-as-function pattern           |
| **Slice**   | Pure TS logic module — returns hives + actions          |
| **Factory** | DI container: `.use(SliceA()).use(SliceB()).build()`    |

## Area Guide — Read Only What You Need

| Working on...              | Read this              |
| -------------------------- | ---------------------- |
| Honey / Bee components     | `context/bees.md`      |
| Hive creators / interfaces | `context/hives.md`     |
| React hooks                | `context/hooks.md`     |
| createFactory / presets    | `context/factory.md`   |
| Built-in slices (overview) | `context/slices.md`    |
| QuerySlice (deep dive)     | `context/query.md`     |
| Validator                  | `context/validator.md` |
| Wrapper / StatusKit / UI   | `context/ui.md`        |

> **Need everything?** Read all `context/*.md` files — each is self-contained, no cross-dependencies.

## API Surface

Entry point: `lib/index.ts` (barrel export)

**Hive Creators:** `createHive`, `createHiveArray`, `createHiveObserver`, `createProxyHive`, `createFormHive`
**Bee Components:** `Honey` (.Form, .List, .Cluster) · `Bee` (.Form, .Proxy, .Cluster)
**Hooks (7):** `useHoney`, `useHive`, `useFormHoney`, `useFormHive`, `useProxy`, `useFormProxy`, `useCluster`
**System:** `createFactory`, 8 slices, 4 factory presets, `Validator`, `createQueryFilter`
**UI:** `Wrapper`, `StatusKit`, `StatusBee`, `StateBuilder`, `ControllerContainer`

## Anti-Patterns

- ❌ Don't use `useState` inside a Factory — factories are not React hooks
- ❌ Don't read hive values without `Bee` or `useHoney` in React (won't re-render)
- ❌ Don't put business logic in components — it belongs in Slices

## Source Structure

```
lib/
├── index.ts          # Barrel export
├── Bees/             # Honey, Bee, Types
├── Hives/            # All hive creators + Types
├── Hooks/            # 7 hooks
├── Factory/          # createFactory, Slice type
├── System/
│   ├── Factories/    # 4 presets
│   ├── Slices/       # 8 slices (Query has Components/)
│   └── Utils/        # Validator
├── Ui/               # Wrapper, StatusKit, Containers
└── Utils/            # ExtractId/Value, TimedCallback
```

## Testing

```bash
pnpm test           # Vitest — 212 tests (~1s)
npx tsc --noEmit    # Type check
```
