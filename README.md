# **Eze-Services: A Flexible, Modular State Management Library**

Eze-Services is a high-performance, flexible, and easy-to-use state management library for React applications. It simplifies managing state across small and large projects without the need for a centralized store.

---

## **Why Eze-Services?**

1. **No More `useState`**: Hives replace `useState`, allowing you to manage state outside of components. Whether you're managing simple or complex state, `createHive` ensures consistent, centralized state management across your app.

2. **No More `useEffect`**: Hives replace `useEffect` for handling side effects. You can subscribe to hives for real-time updates without the need to manually track dependencies or state changes.

3. **Unified State Pattern**: Eze-Services offers a single API for managing **primitives, arrays, forms, and deeply nested objects**, reducing the need for multiple patterns across your project.

4. **Modular and Scalable**: Hives are **modular**, meaning they can be used independently or in combination. This allows you to scale state management from small components to large, complex applications without added overhead.

5. **Persistent State**: Eze-Services supports **localStorage, sessionStorage, and memory storage** using a simple `storeKey` option, allowing you to persist state across reloads.

---

## **Key Features**

- **Hives**: Manage state in a modular way with `createHive`, allowing flexible control over any type of state (primitives, arrays, nested objects).
- **Array and Form Handling**: Built-in support for managing arrays with `ArrayHive` and forms with `FormHive`, providing validation out of the box.
- **Subscriptions**: Components automatically update when hive state changes, ensuring real-time updates without manual re-renders.
- **ProxyHive**: Manage deeply nested objects efficiently and update individual fields without rebuilding the entire object.

---

## **Table of Contents**
- [**Eze-Services: A Flexible, Modular State Management Library**](#eze-services-a-flexible-modular-state-management-library)
  - [**Why Eze-Services?**](#why-eze-services)
  - [**Key Features**](#key-features)
  - [**Table of Contents**](#table-of-contents)
  - [**Getting Started**](#getting-started)
  - [**Creating Hives**](#creating-hives)
  - [**Rendering State with Bee**](#rendering-state-with-bee)
  - [**Array State Management with ArrayBee and createHiveArray**](#array-state-management-with-arraybee-and-createhivearray)
    - [**Array Manipulation API**](#array-manipulation-api)
  - [**Form State Management with FormBee, FormBees, and createFormHive**](#form-state-management-with-formbee-formbees-and-createformhive)
  - [**Proxy State Management with ProxyHive**](#proxy-state-management-with-proxyhive)
  - [**Observer Pattern with ObserverBee and createHiveObserver**](#observer-pattern-with-observerbee-and-createhiveobserver)
  - [**Persistent Storage and Store Keys**](#persistent-storage-and-store-keys)
  - [**Custom Hooks with Components**](#custom-hooks-with-components)
    - [**`useHoney` Hook**](#usehoney-hook)
    - [**`useFormHoney` Hook**](#useformhoney-hook)
  - [**Example: E-Commerce App**](#example-e-commerce-app)
  - [**Why Choose Eze-Services Over Other Libraries?**](#why-choose-eze-services-over-other-libraries)
    - [**1. Redux:**](#1-redux)
    - [**2. MobX:**](#2-mobx)
    - [**3. Zustand:**](#3-zustand)
    - [**Why Eze-Services Is the Best Choice**:](#why-eze-services-is-the-best-choice)

---

## **Getting Started**

Install the library:

```bash
npm install eze-services
```

---

## **Creating Hives**

Hives manage individual pieces of state in a modular way. You can easily subscribe to state changes with `subscribe()`.

```typescript
import { createHive } from 'eze-services';

// Primitive state hive
const countHive = createHive(0);

// Subscribing to changes
countHive.subscribe((newCount) => console.log("Count updated:", newCount));

// Update state
countHive.setHoney(1);
```

---

## **Rendering State with Bee**

`Bee` connects the state in a hive to your component. You can also subscribe to state changes using the `subscribe()` method, making it easy to track and act on updates.

```typescript
import { Bee } from 'eze-services';

const Counter = () => (
  <Bee hive={countHive} Component={({ honey, setHoney }) => (
    <div>
      <p>{honey}</p>
      <button onClick={() => setHoney(honey + 1)}>Increment</button>
    </div>
  )}/>
);

// Subscribing outside of React
countHive.subscribe((newCount) => {
  console.log('Count changed to:', newCount);
});
```

---

## **Array State Management with ArrayBee and createHiveArray**

Array hives are built to handle lists of data, and you can subscribe to changes in the array.

```typescript
import { createHiveArray, ArrayBee } from 'eze-services';

const itemArrayHive = createHiveArray([{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]);
```

---

### **Array Manipulation API**

You can easily manipulate arrays with built-in methods like `push`, `pop`, `removeById`, and more.

```typescript
itemArrayHive.push({ id: 3, name: "Item 3" });
```

---

## **Form State Management with FormBee, FormBees, and createFormHive**

`createFormHive` simplifies form state and validation. Subscribe to individual fields and the form as a whole.

```typescript
import { createFormHive, FormBee } from 'eze-services';

const formHive = createFormHive({
  initialValue: { username: "", email: "" },
  onSubmit: (honey) => console.log("Form Submitted", honey),
});

// Subscribe to form changes
formHive.subscribe((newFormState) => {
  console.log('Form state updated:', newFormState);
});
```

---

## **Proxy State Management with ProxyHive**

Manage deeply nested state objects and subscribe to changes within nested properties.

```typescript
import { createProxyHive } from 'eze-services';

const userProxyHive = createProxyHive({ name: "John", address: { city: "New York" } });

const cityHive = userProxyHive.getNestedHive("address").getNestedHive("city");
cityHive.setHoney("San Francisco");
```

---

## **Observer Pattern with ObserverBee and createHiveObserver**

Listen to changes across multiple hives using `ObserverBee` or `createHiveObserver`.

```typescript
import { createHiveObserver, ObserverBee } from 'eze-services';

const observerHive = createHiveObserver((observe) => ({
  userName: observe(userProxyHive),
  itemCount: observe(itemArrayHive),
}));
```

---

## **Persistent Storage and Store Keys**

Persist state in `localStorage`, `sessionStorage`, or memory with `storeKey`.

```typescript
const userHive = createHive({ name: "John" }, { storeKey: "user-data", storage: "localStorage" });
```

---

## **Custom Hooks with Components**

### **`useHoney` Hook**

Returns the current state from a hive and updates the component when the hive’s state changes.

```typescript
import { useHoney } from 'eze-services';

const Counter = () => {
  const honey = useHoney(countHive);
  return (
    <div>
      <p>{honey}</p>
      <button onClick={() => countHive.setHoney(honey + 1)}>Increment</button>
    </div>
  );
};
```

### **`useFormHoney` Hook**

Works with form hives to get the value and error state.

```typescript
import { useFormHoney } from 'eze-services';

const UsernameField = () => {
  const { value, error } = useFormHoney(formHive.getNestedHive("username"));
  return (
    <div>
      <input type="text" value={value} onChange={(e) => formHive.setNestedHoney("username", e.target.value)} />
      {error && <span>{error}</span>}
    </div>
  );
};
```

## **Example: E-Commerce App**

In an e-commerce app, you need to manage authentication, product data, and a shopping cart. Eze-Services simplifies this by offering hives for each part of the app:

```typescript
import { createHive, createHiveArray, createProxyHive, createFormHive } from 'eze-services';

// Authentication hive
const loginHive = createHive({ isAuthenticated: false, user: null });

// Product catalog hive
const productCatalogHive = createHiveArray([
  { id: 1, name: "Product A", price: 100 },
  { id: 2, name: "Product B", price: 200 }
]);

// Shopping cart hive with nested product details
const cartHive = createProxyHive({ items: [], total: 0 });
cartHive.setNestedHoney("items", [{ id: 1, name: "Product A", quantity: 2, price: 100 }]);

// Checkout form hive with validation
const checkoutFormHive = createFormHive({
  initialValue: { name: "", email: "", address: "" },
  validator: (key, value) => (!value ? "This field is required" : ""),
  onSubmit: (honey) => console.log("Checkout Submitted", honey),
});
```

With **Eze-Services**, each module has its own hive, making state management cleaner, more modular, and easier to scale.

---

## **Why Choose Eze-Services Over Other Libraries?**

### **1. Redux:**
   - **More Efficient State Management**: Redux requires centralized stores, actions, and reducers, which adds boilerplate and complexity. Eze-Services eliminates this with **modular hives**, allowing you to manage each piece of state independently, without extra code.
   - **Why It's Better**: Eze-Services reduces the need for complex configurations and keeps state modular, making it easier to debug and scale.

### **2. MobX:**
   - **Cleaner, Simpler API**: MobX uses observables and decorators, which can add complexity. Eze-Services offers a **functional, easy-to-use API** that handles state without complex syntax. Hives provide built-in solutions for arrays and forms.
   - **Why It's Better**: Eze-Services keeps development intuitive and clean, with fewer moving parts and a simpler learning curve.

### **3. Zustand:**
   - **More Structure for Larger Projects**: Zustand is minimal, but it lacks the structure needed for managing complex states like forms, arrays, or deeply nested objects. Eze-Services provides built-in support for these cases, offering more structure for larger, complex apps.
   - **Why It's Better**: For larger or more advanced apps, Eze-Services scales better by providing tools like `ArrayHive`, `FormHive`, and `ProxyHive` to manage complex data without extra setup.

---

### **Why Eze-Services Is the Best Choice**:

1. **Unified API**: Manage all state types (primitives, arrays, forms, and nested objects) with one consistent API, eliminating the need for multiple tools or patterns.
   
2. **Real-Time Updates Without `useEffect`**: Hives automatically trigger updates, so your components stay in sync with the latest data—no need for `useEffect` or manual dependency tracking.

3. **Scalable and Modular**: Hives scale easily from small components to large apps. Each module can manage its own state, keeping the project modular and organized.

4. **Persistent State**: Easily persist state across reloads using `storeKey` for local or session storage, with no extra setup.

---
