export type FormType = "update" | "add";

export interface IFormChange {
  id: string;
  value: any;
  // silent?: boolean;
}
export interface SubscribeProps {
  id: string;
  setValue: (value: string) => void;
  setError: (error: string) => void;
  onSuccess?: () => void;
}

export interface IFormProps<T> {
  defaultValues: T;
  validationSchema: any;
  load?: () => Promise<T>;
  reload?: () => Promise<T>;
  onSubmit?: (formData: T) => void;
  valdiateOnLoad?: boolean;
  // onDataChanged?: (data: T) => void;
  onDataChanged?: (isChanged: boolean) => void;
  onErrorChanged?: (errors: { [key: string]: string }) => void;
  mode?: "onBlur" | "onChange" | "onSubmit";
  resetOnSumbit?: boolean;
}

export interface FormServiceType {
  silentSet: (props: IFormChange) => void;
  get(id: string): string;
  subscribe: (props: SubscribeProps) => void;
}
