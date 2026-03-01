import { Bee } from "../../Bees";
import { IFormHive } from "../../Hives/Types";
import { INestedFormHoneySetter } from "../../Bees/Types";

interface ControllerContainerBaseProps<T, K extends keyof T> {
  formHive: IFormHive<T>;
  id: K;
  Element: React.ComponentType<{
    setValue: INestedFormHoneySetter<T[K]>; // (value: T[K], effect?: boolean) => void;
    silentSetHoney?: (value: T[K]) => void;
    value: T[K];
    error?: string;
    id?: K;
  }>;
  [key: string]: any;
}

export function ControllerContainer<T, K extends keyof T>({ id, formHive, Element, ...props }: ControllerContainerBaseProps<T, K> & Record<string, unknown>) {
  return (
    <Bee.Form hive={formHive.getNestedHive(id)}>
      {({ value, set, error }) => {
        return <Element setValue={set as any} value={value} error={error} silentSetHoney={set as any} id={id} {...props} />;
      }}
    </Bee.Form>
  );
}
