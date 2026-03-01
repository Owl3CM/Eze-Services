# Hive System

**Concept:** Reactive state containers that live outside React. Pure TypeScript.

## Hive Creators

```typescript
createHive<T>(initial, storeKey?);          // Simple reactive value
createHiveArray<T>(initial, storeKey?);     // Array with mutation helpers
createHiveObserver<T>(listen);              // Read-only derived hive
createProxyHive<T>(initial, storeKey?);     // Nested-hive container (each key → own hive)
createFormHive({ initialValue, ... });      // Form state with validation
```

## Common API (all hive types)

```typescript
hive.honey; // Get current value
hive.setHoney(v); // Set → triggers subscriber re-renders
hive.silentSetHoney(v); // Set → does NOT notify subscribers
hive.subscribe(cb); // Subscribe → returns unsubscribe fn
hive.reset(); // Reset to initial value
hive.initialValue; // The initial value passed at creation
```

## Storage Persistence

Any hive creator accepts an optional `storeKey`:

```typescript
createHive(0, "counter"); // memoryStorage (default)
createHive(0, { storeKey: "counter", storage: "localStorage" }); // localStorage
hive.clearStore?.(); // reset + remove from storage
```

Storage types: `"localStorage"` | `"sessionStorage"` | `"memoryStorage"` | custom `Storage` instance.

## ProxyHive — Nested Hive Container

Wraps an object, creates a **separate hive for each key** with **two-way sync**:

```typescript
const settings = createProxyHive({ theme: "dark", lang: "en" });

const themeHive = settings.getNestedHive("theme"); // subscribes to "theme" only
settings.setNestedHoney("theme", "light"); // parent auto-synced
```

## HiveObserver — Derived/Computed Values

Read-only hive that recomputes when sources change:

```typescript
const fullName = createHiveObserver((observe) => {
  return observe(firstName) + " " + observe(lastName);
});
// fullName.honey → "John Doe" (auto-updates)
// fullName.setHoney → throws Error (read-only)
```

## FormHive — Config Options

```typescript
const form = createFormHive({
  initialValue: { email: "", password: "" }, // Required
  onSubmit: (values) => api.login(values), // Required
  validateMode: "onBlur", // "onBlur" | "onChange" | "onSubmit"
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

## Interface Reference

| Interface               | Key Members                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IHive<T>`              | `honey`, `setHoney`, `silentSetHoney`, `subscribe`, `reset`, `initialValue`, `clearStore?`                                                                        |
| `IHiveArray<T>`         | All `IHive` + `push`, `pop`, `shift`, `unshift`, `splice`, `remove`, `removeById`, `removeByIndex`, `append`, `update`, `updateById`, `updateByIndex`, `getById`  |
| `IHiveObserver<T>`      | Read-only: `honey`, `subscribe` (no `setHoney` — throws)                                                                                                          |
| `IProxyHive<T>`         | `IHive` + `createNestedHive`, `getNestedHive`, `setNestedHoney`, `getNestedHoney`, `subscribeToNestedHive`                                                        |
| `IFormHive<T>`          | `IHive` + `validate`, `errors`, `getError`, `setError`, `clearErrors`, `isDirtyHive`, `isValidHive`, `reValidate`, `submit`, `validateMode` + nested hive methods |
| `INestedFormHive<T>`    | `honey: {value, error?}`, `setHoney`, `silentSetHoney`, `subscribe`, `error`, `setError`, `validate`, `isValid`, `reset`                                          |
| `IStoreKey`             | `string \| { storeKey: string; storage: StorageType }`                                                                                                            |
| `FormValidateMode`      | `"onBlur" \| "onChange" \| "onSubmit"`                                                                                                                            |
| `IFormHiveValidator<T>` | `{ [K in keyof T]?: (value: T[K]) => string \| undefined }`                                                                                                       |

## Source Files

| File           | Path                        |
| -------------- | --------------------------- |
| Simple hive    | `lib/Hives/Hive.ts`         |
| Array hive     | `lib/Hives/HiveArray.ts`    |
| Observer hive  | `lib/Hives/HiveObserver.ts` |
| Proxy hive     | `lib/Hives/ProxyHive.ts`    |
| Form hive      | `lib/Hives/FormHive.ts`     |
| Shared base    | `lib/Hives/HiveBase.ts`     |
| All interfaces | `lib/Hives/Types.ts`        |
