import React from "react";
import { FormBee } from "../Bees";
import { IFormHive } from "../Hives/Types";
import { INestedFormHoneySetter } from "../Bees/Types";

interface ControllerContainerProps<T, K extends keyof T> {
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

export function ControllerContainer<T, K extends keyof T>({ id, formHive, Element, ...props }: ControllerContainerProps<T, K>) {
  return (
    <FormBee
      hive={formHive.getNestedHive(id)}
      Component={({ honey, validate, error, silentSetHoney }) => {
        return <Element setValue={validate} value={honey} error={error} silentSetHoney={silentSetHoney} id={id} {...props} />;
      }}
    />
  );
}
