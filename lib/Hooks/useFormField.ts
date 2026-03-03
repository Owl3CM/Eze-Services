import { useHoney } from "./index";
import { IFormHive } from "../Hives/Types";

export default function useFormField<T, K extends keyof T>(formHive: IFormHive<T>, id: K) {
  const fieldHive = formHive.getFieldHive(id);
  const honey = useHoney(fieldHive);

  return {
    value: honey.value,
    set: fieldHive.setHoney,
    error: honey.error,
    validate: fieldHive.validate,
  };
}
