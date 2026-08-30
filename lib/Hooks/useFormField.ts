import useHoney from "./useHoney";
import { FormFieldSetter, IFormHive } from "../Hives/Types";

export default function useFormField<T, K extends keyof T, TState = {}>(formHive: IFormHive<T, TState>, id: K) {
  const fieldHive = formHive.getFieldHive(id);
  const set = ((...args: [unknown] | [keyof TState, TState[keyof TState]]) => {
    if (args.length === 1) fieldHive.setHoney(args[0] as T[K] | ((prev: T[K]) => T[K]));
    else fieldHive.set(args[0], args[1]);
  }) as FormFieldSetter<T[K], TState>;

  return {
    ...useHoney(fieldHive),
    validate: fieldHive.validate,
    set,
    setValue: fieldHive.setHoney,
    setState: fieldHive.setState,
  };
}
