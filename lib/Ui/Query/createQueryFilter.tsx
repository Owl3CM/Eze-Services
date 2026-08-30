import React, { useState, useEffect, useRef } from "react";
import { QueryAPI } from "../../Slices/Query/Types";
import { TimedCallback } from "../../utils";

export interface QueryFilterProps {
  id: string;
  query: QueryAPI<any>;
}

/**
 * Branded component type that preserves passthrough prop types.
 * `Passthrough` carries the component props that flow through to FilterDefinition.props.
 */
export type QueryFilterAdapter<Passthrough = Record<string, any>> = React.FC<QueryFilterProps> & {
  readonly __passthrough?: Passthrough;
};

export interface CreateQueryFilterOptions {
  /** Which prop to pass the current value to. Default: "value" */
  valueProp?: string;
  /** Which prop to listen for changes on. Default: "onChange" */
  changeProp?: string;
  /** Debounce delay in ms before writing to query state (UX concern — delays hive write for controlled inputs). */
  debounce?: number;
  /** Transform the raw component output before storing in query. */
  transform?: (raw: any) => any;
  /** Extra static props to pass to the component. */
  extraProps?: Record<string, any>;
  /** Value to use when hive value is undefined (e.g. after clearQuery). Prevents uncontrolled inputs. */
  defaultValue?: any;
}

/**
 * Wraps any React component into a query-compatible filter.
 * The resulting component reads from `query.getParam(id)` and writes via `query.updateQuery`.
 *
 * When `debounce` is set, keeps a local state buffer so controlled inputs
 * don't snap back to the stale hive value during the debounce window.
 *
 * @example
 * const TextFilter = createQueryFilter(InputField, { debounce: 300 });
 * const DateFilter = createQueryFilter(DatePicker, {
 *   transform: d => d?.toISOString(),
 * });
 */
export function createQueryFilter<P extends Record<string, any>, Excluded extends keyof P = "value" | "onChange">(
  Component: React.ComponentType<P>,
  options?: CreateQueryFilterOptions,
): QueryFilterAdapter<Omit<P, Excluded | "id" | "query" | "label" | "disabled">> {
  const { valueProp = "value", changeProp = "onChange", debounce, transform, extraProps, defaultValue } = options ?? {};

  const FilterAdapter: React.FC<QueryFilterProps> = ({ id, query, ...rest }) => {
    const hiveValue = query.getParam(id);

    // For debounced filters: buffer locally to prevent snap-back on controlled inputs
    const [localValue, setLocalValue] = useState(hiveValue);
    const isDirty = useRef(false);

    // Sync hive → local when hive changes externally (clear, setQuery, API)
    useEffect(() => {
      if (!isDirty.current) {
        setLocalValue(hiveValue);
      }
    }, [hiveValue]);

    const handleChange = (raw: any) => {
      const v = transform ? transform(raw) : raw;
      if (debounce) {
        isDirty.current = true;
        setLocalValue(v);
        // TimedCallback.create REPLACES the callback for the same id —
        // so rapid keystrokes discard earlier closures, and only the latest `v` fires.
        TimedCallback.create({
          id: `query-filter-${id}`,
          timeout: debounce,
          callback: () => {
            isDirty.current = false;
            query.updateQuery({ id, value: v });
          },
        });
      } else {
        query.updateQuery({ id, value: v });
      }
    };

    const displayValue = (debounce ? localValue : hiveValue) ?? defaultValue;

    const props = {
      ...extraProps,
      ...rest,
      [valueProp]: displayValue,
      [changeProp]: handleChange,
    } as any;

    return <Component {...props} />;
  };

  FilterAdapter.displayName = `QueryFilter(${Component.displayName || Component.name || "Component"})`;

  return FilterAdapter as QueryFilterAdapter<Omit<P, Excluded | "id" | "query" | "label" | "disabled">>;
}
