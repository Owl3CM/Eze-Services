# Eze-Factory

**A revolutionary architecture for building React applications through composable state and modular logic.**

## Documentation

📖 **[Complete Documentation](./Eze-Factory-Docs.md)** — Everything about Eze-Factory's philosophy, patterns, and usage.

## Quick Start

```bash
npm install eze-factory
```

### Basic State (Hive)

```typescript
import { createHive } from "eze-factory";

const counter = createHive(0);
counter.setHoney(1);
counter.subscribe((value) => console.log(value));
```

### React Connection (Bee)

```tsx
import { Bee } from "eze-factory";

<Bee hive={counter} Component={({ honey, setHoney }) => <button onClick={() => setHoney(honey + 1)}>Count: {honey}</button>} />;
```

### Factory Composition

```typescript
import { createTableFactory } from 'eze-factory';

// Compose slices into a complete feature
const UsersFactory = createTableFactory({
  paginator: { paginator: UsersAPI },
  table: { columns: () => [...] }
}).build();

// Use directly — no useState needed!
UsersFactory.paginator.load();
UsersFactory.table.toggleColumnVisibility('email');
UsersFactory.exporter.download({ type: 'csv' });
```

### Form Handling

```typescript
import { createFormHive, FormBee } from "eze-factory";

const loginForm = createFormHive({
  initialValue: { email: "", password: "" },
  onSubmit: (values) => api.login(values),
  validator: (key, value) => {
    if (key === "email" && !value.includes("@")) return "Invalid email";
  },
});

// In JSX:
<FormBee
  hive={loginForm.getNestedHive("email")}
  Component={({ honey, error, validate }) => (
    <input value={honey} onChange={(e) => validate(e.target.value)} />
  )}
/>
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

## License

MIT
