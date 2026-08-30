import useHoney from "./useHoney";
import { IFormHive } from "../Hives/Types";

export default function useForm<T>(formHive: IFormHive<T>) {
  const values = useHoney(formHive);
  const isDirty = useHoney(formHive.isDirtyHive);
  const isValid = useHoney(formHive.isValidHive);

  return {
    values,
    isDirty,
    isValid,
    submit: formHive.submit,
    reset: formHive.reset,
    reValidate: formHive.reValidate,
  };
}
