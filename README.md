# Eze-Factory

Composable reactive state, form, query, table, and async-operation primitives for React applications.

## Documentation

- [Package context and API map](./.agent/_index.md)
- Installed-agent entry point: `node_modules/eze-factory/.agent/_index.md`

The published package includes its TypeScript source and stable `.agent/context` documentation, so source references in those guides also work from `node_modules`.

## Quick Start

```bash
npm install eze-factory
```

### Basic State (Hive)

```typescript
import { Hive } from "eze-factory";

const counter = Hive.state(0);
counter.setHoney(1);
counter.subscribe((value) => console.log(value));
```

### React Connection (Bee)

```tsx
import { Bee } from "eze-factory";

<Bee hive={counter}>
  {({ honey, set }) => <button onClick={() => set(honey + 1)}>Count: {honey}</button>}
</Bee>;
```

### Factory Composition

```typescript
import { createTableFactory } from "eze-factory";

// Compose slices into a complete feature
const UsersFactory = createTableFactory({
  paginator: { paginator: UsersAPI },
  table: { columns: () => [...] },
}).build();

// Use directly — no useState needed!
UsersFactory.paginator.load();
UsersFactory.table.toggleColumnVisibility("email");
UsersFactory.exporter.download({ type: "csv" });
```

### Form Handling

```typescript
import { Hive } from "eze-factory";

const loginForm = Hive.form({
  initialValue: { email: "", password: "" },
  onSubmit: (values) => api.login(values),
  validator: (key, value) => {
    if (key === "email" && !value.includes("@")) return "Invalid email";
  },
});

// In JSX:
<Bee.Field hive={loginForm.getFieldHive("email")}>
  {({ value, error, set }) => (
    <input value={value} onChange={(e) => set(e.target.value)} />
  )}
</Bee.Field>
```

### Validation

```typescript
import { Validator } from "eze-factory";

const validate = new Validator("Email").required().email().min(5).build();
validate(""); // → "Email is required"
validate("a@b.com"); // → undefined (valid)
```

## Philosophy

- **🐝 Hives** — State lives outside React, accessible anywhere
- **🔌 Slices** — Reusable logic modules that auto-wire together
- **🏭 Factories** — Compose slices into complete features
- **📦 Components** — StatusGuard, StatusIndicator filter by operation

## Development

The published runtime supports Node.js 18 and newer. Building, testing, and
publishing this repository uses Node.js 22 LTS, as pinned in `.nvmrc`.

```bash
nvm use
pnpm install --frozen-lockfile
pnpm run verify
```

## License

[MIT](./LICENSE)
