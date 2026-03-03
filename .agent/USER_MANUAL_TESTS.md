# Eze-Factory — Manual Runtime Tests

> These tests verify behaviors that can't be confirmed from source alone.

---

## Hive Reactivity

### T01 — createHive subscription fires on setHoney

1. Create `const h = Hive.state(0)`
2. `h.subscribe(v => console.log(v))`
3. Call `h.setHoney(5)`
4. **Pass:** Console logs `5`

### T02 — silentSetHoney does NOT fire subscribers

1. Create `const h = Hive.state(0)`
2. `h.subscribe(v => console.log("fired", v))`
3. Call `h.silentSetHoney(10)`
4. **Pass:** No console output; `h.honey === 10`

### T03 — createHive with localStorage persistence

1. Create `const h = Hive.state(0, { storeKey: "test-key", storage: "localStorage" })`
2. `h.setHoney(42)`
3. Refresh the page
4. Create the same hive again
5. **Pass:** `h.honey === 42`

### T04 — createHiveArray mutation helpers

1. Create `const arr = Hive.array<{id: number, name: string}>([])`
2. `arr.push({ id: 1, name: "A" })`
3. `arr.push({ id: 2, name: "B" })`
4. `arr.removeById(1)`
5. **Pass:** `arr.honey` is `[{ id: 2, name: "B" }]`

### T05 — createHiveObserver recomputes on source change

1. Create `const first = Hive.state("John")`
2. Create `const full = createHiveObserver(observe => observe(first) + " Doe")`
3. `full.honey` → "John Doe"
4. `first.setHoney("Jane")`
5. **Pass:** `full.honey` → "Jane Doe"

### T06 — createHiveObserver setHoney throws

1. Create `const obs = createHiveObserver(() => 0)`
2. Call `obs.setHoney(1)` (if setHoney exists)
3. **Pass:** Throws Error (or setHoney is undefined)

### T07 — hive.reset() returns to initial value

1. Create `const h = Hive.state(0)`
2. `h.setHoney(99)`
3. `h.reset()`
4. **Pass:** `h.honey === 0`

---

## ProxyHive

### T08 — Nested hive two-way sync

1. Create `const p = createProxyHive({ theme: "dark", lang: "en" })`
2. `const themeHive = p.getNestedHive("theme")`
3. `themeHive.setHoney("light")`
4. **Pass:** `p.honey.theme === "light"` (parent synced)

---

## FormHive

### T09 — createFormHive validates on blur

1. Create a FormHive with `validateMode: "onBlur"` and a validator for `email`
2. Render `<Bee.Form>` for the email nested hive
3. Type an invalid email and blur
4. **Pass:** `error` appears in the children args

### T10 — createFormHive submit with validation

1. Create a FormHive with `onSubmit` and `getValidator`
2. Call `form.submit()`
3. **Pass:** Validation runs for all fields; `onSubmit` fires only if valid

---

## Bee/Honey Components

### T11 — `<Honey>` re-renders on hive change

1. Render `<Honey hive={h}>{({honey}) => <span>{honey}</span>}</Honey>`
2. `h.setHoney(newValue)` from outside
3. **Pass:** The `<span>` updates to show `newValue`

### T12 — `<Bee.Cluster>` set() updates individual hive

1. Render `<Bee.Cluster hives={{a: hiveA, b: hiveB}}>`
2. Call `set({ a: 5 })` from inside children
3. **Pass:** `hiveA.honey === 5`, `hiveB.honey` unchanged

### T13 — `<Bee.Field>` resolves nested form hive

1. Create `const form = createFormHive({ email: "", name: "" })`
2. Render `<Bee.Field formHive={form} id="email">{({value, set, error}) => ...}</Bee.Field>`
3. Type into the field, blur
4. **Pass:** `value` updates, `error` shows if validator fails

---

## Hooks

### T14 — useHoney triggers re-render on hive change

1. Component: `const v = useHoney(hive)` + render `v`
2. `hive.setHoney(42)` from effect
3. **Pass:** Component re-renders showing `42`

### T15 — useProxy provides nested read+write

1. Component: `const [val, set] = useProxy(proxyHive, "theme")`
2. `set("dark")`
3. **Pass:** Component re-renders with `val === "dark"`; `proxyHive.honey.theme === "dark"`

---

## Factory Presets

### T16 — createTableFactory instantiates all slices

1. Create `const ctx = createTableFactory({ query: {...}, paginator: {...}, table: {...}, status: {...} })`
2. **Pass:** `ctx.status`, `ctx.query`, `ctx.paginator`, `ctx.table`, `ctx.exporter` all exist

### T17 — createStaticTableFactory includes Query + Loader

1. Create `const ctx = createStaticTableFactory({ loader: {...}, table: {...} })`
2. **Pass:** `ctx.status`, `ctx.query`, `ctx.loader`, `ctx.table`, `ctx.exporter` all exist

---

## Validator

### T18 — Validator.Init sets global messages

1. Call `Validator.Init(ValidatorMessagesArabic)`
2. Create `new Validator("Test").required().build()`
3. Call the validator with `""`
4. **Pass:** Returns Arabic error message, not English

### T19 — Validator async custom rule

1. Create `new Validator("User").custom(async (v) => { await delay(100); return v === "taken" ? "taken" : undefined }).buildAsync()`
2. Call with `"taken"`
3. **Pass:** Returns `"taken"` after async resolution

---

## UI Components

### T20 — StatusIndicator renders from StatusKit

1. Set up a StatusSlice with DefaultStatusKit
2. Set `status.operation("main").loading()`
3. Render `<StatusIndicator status={ctx.status} />`
4. **Pass:** Renders the loading component from DefaultStatusKit

### T21 — StatusGuard fallback while loading

1. Render `<StatusGuard status={status} fallback={<div>Loading</div>}><Content /></StatusGuard>`
2. Set `status.operation("main").loading()`
3. **Pass:** Shows fallback, not `<Content />`
4. Set `status.operation("main").idle()`
5. **Pass:** Shows `<Content />`

### T22 — Wrapper pull-to-refresh

1. Render `<Wrapper reload={mockReload}>...</Wrapper>`
2. Pull down on touch/scroll
3. **Pass:** Pull-to-refresh animation triggers; `mockReload` called on release

### T23 — FlowView step navigation

1. Set up a FlowSlice with 3 steps
2. Render `<FlowView flow={ctx.flow}>`
3. Call `ctx.flow.next()`
4. **Pass:** View advances to step 2

### T24 — DataTableBase renders columns

1. Set up a TableSlice with column definitions
2. Render `<DataTableBase table={ctx.table} data={rows} />`
3. **Pass:** Table renders with correct headers and data

### T25 — createQueryFilter debounces input

1. Create `const F = createQueryFilter(Input, { debounce: 300 })`
2. Render the filter and type rapidly
3. **Pass:** Query updates only after 300ms pause
