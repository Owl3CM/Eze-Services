
# Eze-Services: State Management Library

Eze-Services is a powerful state management library for React applications, designed to manage state effectively across components. Inspired by the structure of a beehive, it includes features to handle arrays, forms, and state observation efficiently.

## Table of Contents
1. [Creating Hives](#creating-hives)
2. [Rendering State with Bee](#rendering-state-with-bee)
3. [Array State Management with ArrayBee and createHiveArray](#array-state-management-with-arraybee-and-createhivearray)
4. [Form State Management with FormBee, FormBees, and createFormHive](#form-state-management-with-formbee-formbees-and-createformhive)
   - [Props for createFormHive](#props-for-createformhive)
   - [Validation Libraries: Integrating with Yup](#validation-libraries-integrating-with-yup)
5. [Observer Pattern with create](#observer-pattern-with-create)

---

## Creating Hives

### 1. **Creating Hives** with `createHive`
A hive is the central unit of state in Eze-Services. It can hold simple or complex values and can also be persisted using `storeKey` and `storageType` options.

#### Example: Creating a simple hive
```typescript
import { createHive } from "eze-services";

// Primitive state hive
const countHive = createHive(0);

// Object-based state with persistence
const userHive = createHive({ name: "John", age: 30 }, { storeKey: "user", storage: "localStorage" });
```

---

## Rendering State with Bee

Once you create a hive, `Bee` connects the state to your UI. It provides the current state (`honey`) and a setter function (`setHoney`).

#### Example: Using `Bee` to render state
```typescript
import { Bee } from "eze-services";

const Counter = () => (
  <Bee hive={countHive} Component={({ honey, setHoney }) => (
    <div>
      <p>{honey}</p>
      <button onClick={() => setHoney(honey + 1)}>Increment</button>
    </div>
  )}/>
);
```

#### `setHoney` Behavior
`setHoney` can take either a value or a function. When passed a function, it receives the current state as an argument, similar to how React’s `setState` works:

```typescript
setHoney((prevHoney) => prevHoney + 1);  // Increment the current value
```

---

## Array State Management with ArrayBee and createHiveArray

Array hives are designed to handle arrays of data, with built-in utility methods for common array operations.

### 1. **Creating an Array Hive**
`createHiveArray` creates a hive that manages an array of values and offers built-in methods for array manipulation.

#### Example: Creating an array hive
```typescript
import { createHiveArray } from "eze-services";

// Initialize array hive
const itemArrayHive = createHiveArray([{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]);
```

### 2. **Rendering Arrays with `ArrayBee`**
`ArrayBee` maps over the array stored in a hive and renders each item.

#### Example: Rendering array items
```typescript
import { ArrayBee } from "eze-services";

const ItemList = () => (
  <ArrayBee
    hive={itemArrayHive}
    Component={({ honey }) => (
      <div>
        <p>{honey.name}</p>
      </div>
    )}
  />
);
```

### 3. **Array Hive API**

The `createHiveArray` provides utility methods for array operations:

- **`push(newItem)`**: Adds a new item to the end of the array.
- **`pop()`**: Removes the last item from the array.
- **`shift()`**: Removes the first item from the array.
- **`unshift(newItem)`**: Adds a new item to the beginning of the array.
- **`splice(start, deleteCount, ...newItems)`**: Removes items from the array and/or adds new items.
- **`removeById(id)`**: Removes an item from the array based on its `id`.
- **`updateById(id, newValue)`**: Updates an item by its `id`.
- **`removeByIndex(index)`**: Removes an item at the given index.
- **`updateByIndex(index, newValue)`**: Updates an item at the given index.

#### Example: Manipulating an array hive
```typescript
// Push a new item
itemArrayHive.push({ id: 3, name: "Item 3" });

// Remove the first item
itemArrayHive.shift();

// Update an item by its index
itemArrayHive.updateByIndex(0, { id: 2, name: "Updated Item 2" });
```

---

## Form State Management with FormBee, FormBees, and createFormHive

`createFormHive` manages form state and validation. It provides tools for easy form handling, validation, and submission. Forms are rendered with `FormBee` for individual fields or `FormBees` for handling multiple fields.

### 1. **Creating a Form Hive with `createFormHive`**
`createFormHive` handles form state, validation, and submission logic.

#### Example: Creating a form hive
```typescript
import { createFormHive } from "eze-services";

const formHive = createFormHive({
  initialValue: { username: "", email: "" },
  validator: (key, value) => {
    if (key === "username" && value.length < 3) return "Username must be at least 3 characters";
    if (key === "email" && !value.includes("@")) return "Invalid email address";
    return null;
  },
  onSubmit: (honey) => {
    console.log("Form Submitted", honey);
  },
  validateMode: "onBlur"  // Other options: "onChange", "onSubmit"
});
```

### 2. **Rendering Form Fields with `FormBee`**
`FormBee` renders individual form fields and binds them to the form hive.

#### Example: Rendering a form field
```typescript
import { FormBee } from "eze-services";

const UsernameField = () => (
  <FormBee
    hive={formHive.getNestedHive("username")}
    Component={({ honey, error, setHoney, validate }) => (
      <div>
        <input
          type="text"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          onBlur={() => validate(honey)}  // Trigger validation on blur
        />
        {error && <span>{error}</span>}
      </div>
    )}
  />
);
```

### 3. **Submitting Forms with `onSubmit`**
The `submit` method revalidates the form and triggers the `onSubmit` callback.

#### Example: Submitting the form
```typescript
const handleSubmit = (e) => {
  formHive.submit(e);  // Revalidates and submits the form
};

return (
  <form onSubmit={handleSubmit}>
    <FormBee hive={formHive.getNestedHive("username")} Component={UsernameField} />
    <button type="submit">Submit</button>
  </form>
);
```

---

### Props for `createFormHive`

`createFormHive` accepts several props that define how the form is structured, validated, and submitted:

1. **`initialValue`**: Sets the initial values for the form fields.
   - Example: `{ username: "", email: "" }`.

2. **`storeKey`** (optional): Persist the form hive’s state in specified storage (e.g., `localStorage`).

3. **`validator`**: Function that validates form fields. You can use libraries like **Yup** or **Validator.js** for more advanced validation.

4. **`validateMode`**: Defines when to trigger validation: `onBlur`, `onChange`, or `onSubmit`.

5. **`onSubmit`**: Callback triggered when the form is submitted successfully.

---

### Validation Libraries: Integrating with Yup

You can integrate **Yup** for more complex validation. Here’s an example of using Yup with `createFormHive`:

```typescript
import * as Yup from "yup";
import { createFormHive } from "eze-services";

const formSchema = Yup.object().shape({
  username: Yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required")
});

const formHive = createFormHive({
  initialValue: { username: "", email: "" },
  validator: async (key, value) => {
    try {
      await formSchema.validateAt(key, { [key]: value });
      return null;
    } catch (err) {
      return err.message;
    }
  },
  onSubmit: (honey) => {
    console.log("Form Submitted", honey);
  },
  validateMode: "onBlur"
});
```

---


## Observer Pattern with createHiveObserver and ObserverBee

### 1. **Creating a Hive Observer**
`createHiveObserver` allows you to observe multiple hives and combine their states.

#### Example: Observing multiple hives
```typescript
import { createHiveObserver } from "eze-services";

const observerHive = createHiveObserver((observe) => ({
  username: observe(userHive),
  itemCount: observe(itemArrayHive),
}));
```

### 2. **Rendering with `ObserverBee`**
`ObserverBee` listens to observed hives and triggers re-renders when any of the states change.

#### Example: Using `ObserverBee`
```typescript
import { ObserverBee } from "eze-services";

const ObservedComponent = () => (
  <ObserverBee
    hive={observerHive}
    Component={({ honey }) => (
      <div>
        <p>Username: {honey.username}</p>
        <p>Item Count: {honey.itemCount.length}</p>
      </div>
    )}
  />
);
```

---

## Persistent Storage and Store Keys

### **Persistent Hives with `storeKey`**

Hives can be linked to persistent storage by passing a `storeKey` and optional `storageType` (`localStorage`, `sessionStorage`, `memoryStorage`).

#### Example: Creating a persistent hive
```typescript
const userHive = createHive({ name: "John" }, { storeKey: "user-data", storage: "localStorage" });
```

---

## Custom Hooks

The following custom hooks are available for interacting with hives:

### 1. `useHoney`

Returns the current `honey` (state) from a hive and updates the component when the state changes.

#### Example
```typescript
const honey = useHoney(hive);
```

### 2. `useHive`

Returns the current `honey` and a `setHoney` function to update the state.

#### Example
```typescript
const [honey, setHoney] = useHive(hive);
```

### 3. `useFormHoney`

Specifically for form hives, this returns an object containing the value and any validation errors.

#### Example
```typescript
const { value, error } = useFormHoney(formHive);
```

### 4. `useFormHive`

This is similar to `useHive` but designed for form hives. It also provides the `validate` method to trigger validation.

#### Example
```typescript
const [honey, validate] = useFormHive(formHive);
```

These hooks provide flexibility when interacting with various hives and managing state dynamically in React applications.

