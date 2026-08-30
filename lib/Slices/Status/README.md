# StatusSlice

Operations-based status management for concurrent loading states.

## Quick Start

```typescript
// Set status
ctx.status.operation("table").loading({ message: "Loading..." });

// Clear operation (return to idle)
ctx.status.operation("table").idle();

// Handle errors
ctx.status.operation("table").error({ message: "Failed!" });
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        StatusSlice                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Hive (Map)                          │  │
│  │  'table'  → { statusType: 'loading', priority: 1 }    │  │
│  │  'header' → { statusType: 'error',   priority: 0 }    │  │
│  │  'upload' → { statusType: 'loading', priority: 1 }    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │ Component│        │ Component│        │ Component│
   │ table    │        │ header   │        │ upload   │
   └──────────┘        └──────────┘        └──────────┘
```

### Flow

1. **Slice sets operation**: `operation('table').loading(props)`
2. **Hive stores state**: `Map { 'table' → OperationState }`
3. **Components subscribe**: `<StatusIndicator operations={['table']} />`
4. **Priority resolves**: Lowest priority number wins

---

## StatusKit

Defines available status types with priorities and components:

```typescript
const MyStatusKit = {
  error:   { priority: 0, props: {...}, component: ErrorAlert },    // Highest
  loading: { priority: 1, props: {...}, component: Spinner },
  saving:  { priority: 2, props: {...}, component: SaveOverlay },
  success: { priority: 998, props: {...}, component: Toast },       // Low
  idle:    { priority: 999, props: {...}, component: () => null },  // Lowest
};
```

---

## API Reference

### Operation Methods

| Method            | Description                           |
| ----------------- | ------------------------------------- |
| `.loading(props)` | Set to loading state                  |
| `.error(props)`   | Set to error state                    |
| `.success(props)` | Set to success state                  |
| `.idle()`         | **Clear operation** (remove from map) |

### Query Methods

| Method                   | Returns          | Description                     |
| ------------------------ | ---------------- | ------------------------------- |
| `isActive('name')`       | `boolean`        | Is operation in the map?        |
| `isAnyActive(['a','b'])` | `boolean`        | Is ANY operation active?        |
| `getState('name')`       | `OperationState` | Full state object               |
| `getPrimary()`           | `OperationState` | Highest priority operation      |
| `getPrimary(['a'])`      | `OperationState` | Highest priority among filtered |
| `getActiveOperations()`  | `string[]`       | All active operation names      |
| `getComponent('type')`   | `Component`      | Get component from kit          |

---

## Components

### How Components Interact with State

```
┌─────────────────────────────────────────────────────────┐
│                    StatusIndicator                       │
│  Props: { status, operations?, statusTypes? }           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  1. useHoney(status.hive)  ← Subscribe to hive changes  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. status.getPrimary(operations, statusTypes)          │
│     Filter operations → Sort by priority → Return first │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. Render: <Component {...primary.props} />            │
└─────────────────────────────────────────────────────────┘
```

### Component Types

#### `<StatusIndicator />`

Generic - shows highest priority status from filtered operations.

```tsx
// All operations
<StatusIndicator status={status} />

// Specific operations only
<StatusIndicator status={status} operations={['table', 'header']} />
```

#### `<LoadingIndicator />`

Only shows `loading` status types.

```tsx
<LoadingIndicator status={status} operations={["table"]} />
```

#### `<ErrorDisplay />`

Only shows `error` status types.

```tsx
<ErrorDisplay status={status} />
```

#### `<StatusGuard />`

Shows fallback while loading, children when idle.

```tsx
<StatusGuard status={status} operations={["table"]} fallback={<Skeleton />}>
  <TableContent />
</StatusGuard>
```

---

## Priority System

When multiple operations are active, **lowest priority number wins**:

```
Active:
  'table'  → loading (priority 1)
  'header' → error   (priority 0)  ← WINS

<StatusIndicator operations={['table', 'header']} />
→ Renders: ErrorComponent (priority 0 < 1)
```

### Default Priorities

| Status  | Priority | Behavior                   |
| ------- | -------- | -------------------------- |
| error   | 0        | Always shows first         |
| loading | 1        | Shows over success         |
| success | 998      | Only shows if nothing else |
| idle    | 999      | Never shows                |

---

## Usage Examples

### Slice Implementation

```typescript
export function TableSlice() {
  return (ctx: Dependencies) => {
    const load = async () => {
      ctx.status.operation("table").loading({ variant: "skeleton" });

      try {
        const data = await api.fetch();
        ctx.status.operation("table").idle(); // Clear operation
        return data;
      } catch (err) {
        ctx.status.operation("table").error({ message: err.message });
      }
    };

    return { table: { load } };
  };
}
```

### Page Component

```tsx
const Page = () => {
  const { status, table, header } = useFactory();

  return (
    <div>
      {/* Header section - only reacts to 'header' */}
      <StatusIndicator status={status} operations={["header"]} />
      <Header />

      {/* Table section - only reacts to 'table' */}
      <StatusIndicator status={status} operations={["table"]} />
      <Table />
    </div>
  );
};
```

---

## Options

### Transient Timeout

Auto-clear status after delay:

```typescript
ctx.status.operation("save").success(
  { message: "Saved!" },
  { timeout: 3000 } // Clears after 3s
);
```

### Stale Cleanup

Auto-clear stuck operations:

```typescript
StatusSlice({
  statusKit: MyStatusKit,
  staleTimeout: 30000, // 30s
});
```
