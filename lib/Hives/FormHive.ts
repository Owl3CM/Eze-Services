import { createHive } from "./Hive";
import { _getHiveBase } from "./HiveBase";
import { CheckSimilarity } from "./HiveUtils";
import { FormValidateMode, IFormHive, IFormHiveValidator, INestedFormHive, IStoreKey } from "./Types";

export function createFormHive<HiveType>({
  initialValue,
  storeKey,
  validator,
  getValidator,
  validateMode = "onBlur",
  onSubmit,
}:
  | {
      initialValue: HiveType;
      storeKey?: IStoreKey;
      // validator?: (key: keyof HiveType, value: any) => string;
      validator?: undefined;
      getValidator?: (formHive: IFormHive<HiveType>) => IFormHiveValidator<HiveType>;
      validateMode?: FormValidateMode;
      onSubmit: (honey: HiveType) => void;
    }
  | {
      initialValue: HiveType;
      storeKey?: IStoreKey;
      // validator?: (key: keyof HiveType, value: any) => string;
      validator?: <K extends keyof HiveType>(key: K, value: HiveType[K]) => string | undefined;
      getValidator?: undefined;
      validateMode?: FormValidateMode;
      onSubmit: (honey: HiveType) => void;
    }): IFormHive<HiveType> {
  type FormHiveKey = keyof HiveType;
  let _initialValue = structuredClone(initialValue);
  const formHive = createHive(structuredClone(_initialValue), storeKey) as IFormHive<HiveType>;
  formHive.validateMode = validateMode;
  formHive.isDirtyHive = createHive(false);
  formHive.isValidHive = createHive(true);

  const _NestedHives = new Map<FormHiveKey, INestedFormHive<any>>();

  formHive.createNestedHive = <NestedHiveType>(key: string, nestedInitVal: NestedHiveType, storeKey?: string) => {
    const [nestedHive, pollinate] = _getHiveBase({ value: nestedInitVal, error: null }, storeKey) as any as [INestedFormHive<NestedHiveType>, () => void];
    formHive.silentSetHoney = (newValue: any) => {
      formHive.honey = typeof newValue === "function" ? newValue(formHive.honey) : newValue;
      formHive.isDirtyHive.setHoney(!CheckSimilarity(formHive.honey, _initialValue));
      formHive.isValidHive.setHoney(!Object.values(formHive.errors).some((key) => key));
    };

    _NestedHives.set(key as any, nestedHive);
    formHive.errors = {};
    formHive.getError = (key: keyof HiveType) => formHive.errors[key as string];
    formHive.setError = (key: keyof HiveType, err?: string) => formHive.getNestedHive(key).setError(err);
    formHive.clearErrors = () => {
      _NestedHives.forEach((nh) => {
        nh.setError();
      });
    };

    nestedHive.silentSetHoney = (value: any) => {
      if (typeof value === "function") value = value(nestedHive.honey.value);
      nestedHive.honey = {
        error: nestedHive.honey.error,
        value,
      };
    };

    nestedHive.setError = (error?: string) => {
      if (!error) error = undefined;
      if (formHive.errors[key as string] === error) return;
      formHive.errors[key as string] = error as any;
      nestedHive.honey = {
        value: nestedHive.honey.value,
        error,
      };

      pollinate();
    };

    if (getValidator) {
      const keys = getValidator(formHive);
      validator = (key, value) => {
        return keys[key]?.(value);
      };
    }

    nestedHive.validate = validator
      ? (value: NestedHiveType, effect?: boolean) => {
          if (typeof value === "function") value = value(nestedHive.honey.value);
          if (nestedHive.honey.error) nestedHive.setError((validator as any)(key as FormHiveKey, value));
          else if (validateMode !== "onSubmit")
            if (validateMode === "onChange") nestedHive.setError((validator as any)(key as FormHiveKey, value));
            // TODO: onBlur validation couples to document.querySelector — consider making injectable for SSR/testing
            else if (validateMode === "onBlur") {
              const focusedElement = document.querySelector(":focus") as HTMLElement & { willValidateOnBlur?: boolean };
              if (focusedElement && !focusedElement.willValidateOnBlur) {
                focusedElement.willValidateOnBlur = true;
                focusedElement.addEventListener(
                  "blur",
                  () => {
                    setTimeout(() => {
                      nestedHive.setError((validator as any)(key as FormHiveKey, nestedHive.honey.value));
                      focusedElement.willValidateOnBlur = false;
                    }, 10);
                  },
                  { once: true },
                );
              }
            }
          if (effect) formHive.setHoney((prev) => ({ ...prev, [key]: value }));
          else nestedHive.setHoney(value);
        }
      : nestedHive.setHoney;

    nestedHive.isValid = validator
      ? () => {
          nestedHive.setError((validator as any)(key as FormHiveKey, nestedHive.honey.value));
          return !nestedHive.honey.error;
        }
      : () => true;

    nestedHive.subscribe((newValue: any) => {
      (formHive.honey as any)[key] = newValue.value;
      formHive.silentSetHoney(formHive.honey);
    });
    formHive.subscribe((newValue: any) => {
      if (newValue[key] === nestedHive.honey.value) return;
      nestedHive.setHoney(newValue[key]);
    });

    if ((formHive as any).honey[key] !== nestedInitVal) {
      formHive.setHoney((prev) => ({ ...prev, [key]: nestedInitVal }));
      _initialValue = { ..._initialValue, [key]: nestedInitVal };
    }

    return nestedHive;
  };

  formHive.setNestedHoney = (key: FormHiveKey, value: any, effect?: boolean) => {
    if (typeof value === "function") value = value(formHive.honey[key]);
    if (effect) formHive.setHoney((prev) => ({ ...prev, [key]: value }));
    else _NestedHives.get(key)?.setHoney(value);
  };
  formHive.getNestedHoney = (key: FormHiveKey) => _NestedHives.get(key)!.honey.value;
  formHive.getNestedHive = (key: FormHiveKey) => _NestedHives.get(key) as any;
  formHive.subscribeToNestedHive = (key: FormHiveKey, callback: (value: any) => void) => {
    _NestedHives.get(key)?.subscribe(callback);
  };
  formHive.validate = (key: keyof HiveType, value: any, effect?: boolean) => {
    formHive.getNestedHive(key).validate(value, effect);
  };

  // Create nested hives from initial value
  Object.entries(_initialValue as any).forEach(([key, val]) => {
    formHive.createNestedHive(key, val);
  });

  formHive.reValidate = (validateKeys?: FormHiveKey[]) =>
    new Promise<boolean>((resolve) => {
      formHive.clearErrors();
      if (!validateKeys) validateKeys = Object.keys(_initialValue as any) as FormHiveKey[];

      setTimeout(() => {
        let isValid = true;
        if (!validator) return resolve(isValid);

        _NestedHives.forEach((nh, key) => {
          if (!validateKeys!.includes(key)) return;
          nh.setError((validator as any)(key as FormHiveKey, nh.honey.value));
          if (isValid && !nh.isValid()) isValid = false;
        });
        resolve(isValid);
      }, 100);
    });

  formHive.submit = (e, validateKeys?: FormHiveKey[]) => {
    e?.preventDefault();
    formHive.reValidate(validateKeys).then((isValid) => {
      if (isValid) onSubmit(formHive.honey);
    });
  };

  (formHive as any).reset = (
    _init: {
      [K in keyof HiveType]?: HiveType[K];
    } = {},
  ) => {
    const newValues = structuredClone(_initialValue) as any;
    if (_init) {
      Object.keys(newValues).forEach((key: any) => {
        const newVal = (_init as any)[key];
        if (newVal) newValues[key] = newVal;
      });
    }
    formHive.setHoney(newValues);
    _initialValue = structuredClone(newValues) as any;

    formHive.clearErrors();
    formHive.isDirtyHive.setHoney(false);
  };

  return formHive;
}
