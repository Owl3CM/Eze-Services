import { describe, it, expect, vi } from "vitest";
import { createProxyHive } from "../Hives/ProxyHive";

interface UserProfile {
  name: string;
  age: number;
  email: string;
}

describe("createProxyHive", () => {
  describe("initialization", () => {
    it("stores initial value", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      expect(hive.honey.name).toBe("Alice");
      expect(hive.honey.age).toBe(25);
    });

    it("auto-creates nested hives from initial keys", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const nameHive = hive.getNestedHive("name");
      expect(nameHive).toBeDefined();
      expect(nameHive.honey).toBe("Alice");
    });
  });

  describe("nested → parent sync", () => {
    it("updates parent when nested hive changes", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const nameHive = hive.getNestedHive("name");

      nameHive.setHoney("Bob");
      expect(hive.honey.name).toBe("Bob");
    });

    it("does not affect other nested values", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const nameHive = hive.getNestedHive("name");

      nameHive.setHoney("Bob");
      expect(hive.honey.age).toBe(25);
      expect(hive.honey.email).toBe("a@b.c");
    });
  });

  describe("parent → nested sync", () => {
    it("updates nested hive when parent changes", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const nameHive = hive.getNestedHive("name");

      hive.setHoney({ name: "Charlie", age: 30, email: "c@d.e" });
      expect(nameHive.honey).toBe("Charlie");
    });

    it("skips nested update when value is identical", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const nameHive = hive.getNestedHive("name");

      const cb = vi.fn();
      nameHive.subscribe(cb);
      cb.mockClear();

      // Set parent with same name value
      hive.setHoney({ name: "Alice", age: 30, email: "x@y.z" });
      // nameHive should NOT be notified since name didn't change
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe("setNestedHoney", () => {
    it("updates a nested value by key", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      hive.setNestedHoney("age", 30);
      expect(hive.getNestedHoney("age")).toBe(30);
    });

    it("with effect=true triggers parent notification", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const cb = vi.fn();
      hive.subscribe(cb);
      cb.mockClear();

      hive.setNestedHoney("age", 99, true);
      expect(cb).toHaveBeenCalled();
      expect(hive.honey.age).toBe(99);
    });
  });

  describe("getNestedHoney", () => {
    it("returns current nested value", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      expect(hive.getNestedHoney("name")).toBe("Alice");
    });
  });

  describe("subscribeToNestedHive", () => {
    it("subscribes to changes on a specific key", () => {
      const hive = createProxyHive<UserProfile>({ name: "Alice", age: 25, email: "a@b.c" });
      const cb = vi.fn();
      hive.subscribeToNestedHive("age", cb);
      cb.mockClear();

      hive.getNestedHive("age").setHoney(26);
      expect(cb).toHaveBeenCalledWith(26);
    });
  });

  describe("reset", () => {
    it("resets to initial value", () => {
      const init = { name: "Alice", age: 25, email: "a@b.c" };
      const hive = createProxyHive<UserProfile>(init);

      hive.setHoney({ name: "Bob", age: 30, email: "b@b.c" });
      expect(hive.honey.name).toBe("Bob");

      hive.reset();
      expect(hive.honey.name).toBe("Alice");
      expect(hive.honey.age).toBe(25);
    });
  });
});
