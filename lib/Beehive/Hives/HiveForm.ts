// form

// type SubscribeProps = {
//   id: string;
//   setValue: (value: string) => void;
//   setError: (error: string) => void;
//   onSuccess?: () => void;
// };
// interface IFormProps<T> {
//   initialValues: T;
//   valiateSchema?: any;
//   validate?: (id: keyof T, value: any) => string;
//   setErrors?: (errors: any) => void;
//   setError: (id: keyof T, error: string) => void;
//   setValue: (id: keyof T, value: any) => void;
//   subscribeToForm: (props: SubscribeProps) => void;

//   onSubmit?: (values: T) => void;
// }

// export function createFormHive<HiveType>(initialValue: HiveType, validateSchema: any, storeKey?: string): IHive<HiveType> {
//   const formHive = createHive(initialValue, storeKey) as any as IFormProps<HiveType> & IHive<HiveType>;
//    formHive.validate = (id, value) => {
//     try {
//       validateSchema.validateSyncAt(id, { [id]: value });
//       formHive.removeError(id);
//     } catch ({ message }: any) {
//       if (!(message as any).includes("The schema does not contain the path")) {
//         formHive.addError(id, message as string);
//         return message;
//       }
//     }
//   };

//   Object.entries(initialValue as any).map(([key, value]: any) => {
//     const keyHive = createHive(value);
//     formHive.subscribeToForm({
//       id: key,
//       setValue: (value: any) => {
//         formHive.silentSetHoney({ ...formHive.honey, [key]: value });
//         keyHive.setHoney(value);
//       },
//       setError: (error: string) => {
//         keyHive.setHoney(error);
//       },
//     });
//   });

//   formHive.subscribeToForm = ({ id, setValue, setError, onSuccess }) => {
//     formHive[`set${id}`] = setValue;
//     formHive[`set${id}Error`] = setError;
//     formHive[`on${id}Success`] = onSuccess ?? setError;
//   }

//   return formHive;
// }
