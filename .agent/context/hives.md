# Hive System

**Concept:** Reactive state containers that live outside React. Pure TypeScript.

## Hive Namespace

All hive creators are grouped under the `Hive` namespace:

```typescript
import { Hive } from "eze-factory";

Hive.state<T>(initial, storeKey?);          // Simple reactive value
Hive.list<T>(initial, storeKey?);            // List with mutation helpers
Hive.observer<T>(listen);                    // Read-only derived hive
Hive.proxy<T>(initial, storeKey?);           // Nested-hive container (each key → own hive)
Hive.form({ initialValue, ... });            // Form state with validation
```

## Common API (all hive types)

```typescript
hive.honey;                    // Get current value
hive.setHoney(v);              // Set → triggers subscriber re-renders
hive.setHoney(prev => ...);    // Updater-function form also accepted
hive.silentSetHoney(v);        // Set → does NOT notify subscribers (also accepts updater fn)
hive.subscribe(cb);            // Subscribe → returns unsubscribe fn
hive.reset();                  // Reset to initial value
hive.initialValue;             // The initial value passed at creation
```

## Storage Persistence

Any hive creator accepts an optional `storeKey`:

```typescript
Hive.state(0, "counter"); // memoryStorage (default)
Hive.state(0, { storeKey: "counter", storage: "localStorage" }); // localStorage
hive.clearStore?.(); // reset + remove from storage
```

Storage types: `"localStorage"` | `"sessionStorage"` | `"memoryStorage"` | custom `Storage` instance.

## ProxyHive — Nested Hive Container

Wraps an object, **auto-creates a separate hive for each key** from the initial value, with **two-way sync**:

```typescript
const settings = Hive.proxy({ theme: "dark", lang: "en" });
// ↑ Nested hives for "theme" and "lang" are created automatically

const themeHive = settings.getNestedHive("theme"); // subscribes to "theme" only
settings.setNestedHoney("theme", "light"); // parent auto-synced
settings.getNestedHoney("theme"); // → "light" (read nested value directly)
```

## HiveObserver — Derived/Computed Values

Read-only hive that recomputes when sources change:

```typescript
const fullName = Hive.observer((observe) => {
  return observe(firstName) + " " + observe(lastName);
});
// fullName.honey → "John Doe" (auto-updates)
// fullName.setHoney → throws Error (read-only)
// fullName.silentSetHoney → also throws Error
```

## FormHive — Config Options

```typescript
const form = Hive.form({
  initialValue: { email: "", password: "" }, // Required
  onSubmit: (values) => api.login(values), // Required
  validateMode: "onBlur", // "onBlur" | "onChange" | "onSubmit" (default: "onBlur")
  storeKey: "login-form", // Optional persistence

  // Option A: simple validator
  validator: (key, value) => {
    if (key === "email" && !value.includes("@")) return "Invalid email";
  },

  // Option B: getValidator (mutually exclusive with validator)
  getValidator: (formHive) => ({
    email: (v) => (!v.includes("@") ? "Invalid" : undefined),
    password: (v) => (v.length < 8 ? "Too short" : undefined),
  }),
});
```

> **Note:** `getValidator(formHive)` runs after the full form API and every initial field hive have been created, so it may safely inspect sibling values. `reset(partial?)` accepts falsy overrides and restores per-field custom state (`TState`) exactly to its initial shape, removing transient keys.

## FormHive — Custom Field State (`TState`)

FormHive accepts a second generic `TState` for **per-field custom state** beyond value/error.

```typescript
type FieldState = { disabled?: boolean; loading?: boolean };

const form = Hive.form<FormValues, FieldState>({
  initialValue: { country: "", city: "" },
  onSubmit: save,
  // Initial state per field
  fields: {
    country: { disabled: false, loading: false },
    city: { disabled: true, loading: false },
  },
});
```

Each field's `honey` becomes `{ value: T; error?: string } & TState`:

```typescript
const cityHive = form.getFieldHive("city");
cityHive.honey; // → { value: "", error: undefined, disabled: true, loading: false }
```

### Custom State API

```typescript
// From the nested field hive
cityHive.set("disabled", false); // set one state key
cityHive.setState({ disabled: false, loading: true }); // merge partial state

// From the form hive (without needing the field hive)
form.setFieldState("city", { loading: true });
form.getFieldState("city"); // → { disabled: true, loading: false }
```

### useFormField (hook)

Returns overloaded `set`, plus explicit `setValue` and `setState`, alongside value/error/validate:

```typescript
const field = useFormField(formHive, "city");
field.value; // current value
field.error; // current error
field.disabled; // custom state (from TState)
field.loading; // custom state (from TState)
field.validate(newValue); // validate + update
field.set(newValue); // backward-compatible value setter
field.set("loading", true); // set one state key
field.setValue(newValue); // explicit value setter
field.setState({ disabled: false }); // merge partial state
```

## Interface Reference

| Interface                    | Key Members                                                                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IHive<T>`                   | `honey`, `setHoney`, `silentSetHoney`, `subscribe`, `reset`, `initialValue`, `clearStore?`                                                                                                                                                                                      |
| `IHiveList<T>`               | `honey`, `setHoney`, `silentSetHoney`, `subscribe`, `push`, `pop`, `shift`, `unshift`, `splice`, `remove`, `removeById`, `removeByIndex`, `append`, `update`, `updateById`, `updateByIndex`, `getById` _(own interface — does not extend `IHive`)_                              |
| `IHiveObserver<T>`           | Read-only: `honey`, `subscribe` (`setHoney`/`silentSetHoney` — throws)                                                                                                                                                                                                          |
| `IProxyHive<T>`              | `IHive` + `createNestedHive`, `getNestedHive`, `setNestedHoney`, `getNestedHoney`, `subscribeToNestedHive`                                                                                                                                                                      |
| `IFormHive<T, TState>`       | `IHive` + `createFieldHive`, `getFieldHive`, `setFieldValue`, `getFieldValue`, `subscribeToField`, `validate`, `errors`, `getError`, `setError`, `clearErrors`, `isDirtyHive`, `isValidHive`, `reValidate`, `submit`, `validateMode`, `reset`, `setFieldState`, `getFieldState` |
| `INestedFormHive<T, TState>` | `honey: FieldHoney<T, TState>`, `initialValue`, `setHoney`, `silentSetHoney`, `subscribe`, `clearStore?`, `error`, `setError`, `validate`, `isValid`, `reset`, `set(key, value)`, `setState(partial)`                                                                           |
| `IStoreKey`                  | `string \| { storeKey: string; storage: StorageType }`                                                                                                                                                                                                                          |
| `FieldHoney<T, TState>`      | `{ value: T; error?: string } & TState`                                                                                                                                                                                                                                         |
| `HiveGetter<T>`              | `(get: <Target>(a: IHive<Target>) => Target) => T` — observer listener signature                                                                                                                                                                                                |
| `SafeFieldState<T>`          | Compile-time guard — rejects `TState` keys that collide with `value`, `error`, `set`, `setState`, `validate`                                                                                                                                                                    |
| `FormValidateMode`           | `"onBlur" \| "onChange" \| "onSubmit"`                                                                                                                                                                                                                                          |
| `IFormHiveValidator<T>`      | `{ [K in keyof T]?: (value: T[K]) => string \| undefined }`                                                                                                                                                                                                                     |

## Source Files

| File           | Path                        |
| -------------- | --------------------------- |
| Simple hive    | `lib/Hives/Hive.ts`         |
| Array hive     | `lib/Hives/HiveArray.ts`    |
| Observer hive  | `lib/Hives/HiveObserver.ts` |
| Proxy hive     | `lib/Hives/ProxyHive.ts`    |
| Form hive      | `lib/Hives/FormHive.ts`     |
| Shared base    | `lib/Hives/HiveBase.ts`     |
| Hive utilities | `lib/Hives/HiveUtils.ts`    |
| All interfaces | `lib/Hives/Types.ts`        |
| Barrel export  | `lib/Hives/index.ts`        |
