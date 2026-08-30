import { createHive } from "./Hive";
import { _getHiveBase } from "./HiveBase";
import { CheckSimilarity } from "./HiveUtils";
import { FieldHoney, FormValidateMode, IFormHive, IFormHiveValidator, INestedFormHive, IStoreKey, SafeFieldState } from "./Types";

export function createFormHive<HiveType, TState = {}>({
  initialValue,
  storeKey,
  validator,
  getValidator,
  validateMode = "onBlur",
  onSubmit,
  fields,
}:
  | {
      initialValue: HiveType;
      storeKey?: IStoreKey;
      validator?: undefined;
      getValidator?: (formHive: IFormHive<HiveType, TState>) => IFormHiveValidator<HiveType>;
      validateMode?: FormValidateMode;
      onSubmit: (honey: HiveType) => void;
      fields?: { [K in keyof HiveType]?: SafeFieldState<TState> };
    }
  | {
      initialValue: HiveType;
      storeKey?: IStoreKey;
      validator?: <K extends keyof HiveType>(key: K, value: HiveType[K]) => string | undefined;
      getValidator?: undefined;
      validateMode?: FormValidateMode;
      onSubmit: (honey: HiveType) => void;
      fields?: { [K in keyof HiveType]?: SafeFieldState<TState> };
    }): IFormHive<HiveType, TState> {
  type FormHiveKey = keyof HiveType;
  type ValidatorFn = <K extends FormHiveKey>(key: K, value: HiveType[K]) => string | undefined;
  let _initialValue = structuredClone(initialValue);
  const _fields = fields ? { ...fields } : undefined;
  const formHive = createHive(structuredClone(_initialValue), storeKey) as IFormHive<HiveType, TState>;
  formHive.validateMode = validateMode;
  formHive.isDirtyHive = createHive(false);
  formHive.isValidHive = createHive(true);

  const _NestedHives = new Map<string, INestedFormHive<any, TState>>();
  const _InitialFieldStates = new Map<string, TState>();
  let resolvedValidator: ValidatorFn | undefined = validator as ValidatorFn | undefined;

  formHive.silentSetHoney = (newValue: any) => {
    formHive.honey = typeof newValue === "function" ? newValue(formHive.honey) : newValue;
    formHive.isDirtyHive.setHoney(!CheckSimilarity(formHive.honey, _initialValue));
    formHive.isValidHive.setHoney(!Object.values(formHive.errors).some((key) => key));
  };
  formHive.errors = {};
  formHive.getError = (key: keyof HiveType) => formHive.errors[key as string];
  formHive.setError = (key: keyof HiveType, err?: string) => formHive.getFieldHive(key).setError(err);
  formHive.clearErrors = () => {
    _NestedHives.forEach((nh) => {
      nh.setError();
    });
  };

  formHive.createFieldHive = <NestedHiveType>(key: string, nestedInitVal: NestedHiveType, initialState?: SafeFieldState<TState>, storeKey?: string) => {
    const initialStateSnapshot = { ...((initialState ?? {}) as TState) };
    const initialHoney: FieldHoney<NestedHiveType, TState> = {
      ...initialStateSnapshot,
      value: nestedInitVal,
      error: undefined,
    };
    const [nestedHive, pollinate] = _getHiveBase(initialHoney, storeKey) as unknown as [INestedFormHive<NestedHiveType, TState>, () => void];

    _NestedHives.set(key, nestedHive);
    _InitialFieldStates.set(key, initialStateSnapshot);

    nestedHive.silentSetHoney = (value: any) => {
      if (typeof value === "function") value = value(nestedHive.honey.value);
      nestedHive.honey = { ...nestedHive.honey, value };
    };

    nestedHive.setError = (error?: string) => {
      if (!error) error = undefined;
      if (formHive.errors[key as string] === error) return;
      formHive.errors[key as string] = error;
      nestedHive.honey = { ...nestedHive.honey, error };
      pollinate();
    };

    nestedHive.set = (stateKey: any, stateValue: any) => {
      if ((nestedHive.honey as Record<string, unknown>)[stateKey] === stateValue) return;
      nestedHive.honey = { ...nestedHive.honey, [stateKey]: stateValue };
      pollinate();
    };

    nestedHive.setState = (partial: any) => {
      let changed = false;
      const current = nestedHive.honey as Record<string, unknown>;
      for (const k in partial) {
        if (current[k] !== partial[k]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      nestedHive.honey = { ...nestedHive.honey, ...partial };
      pollinate();
    };

    nestedHive.validate = (value: NestedHiveType, effect?: boolean) => {
      if (typeof value === "function") value = value(nestedHive.honey.value);
      if (resolvedValidator) {
        if (nestedHive.honey.error) nestedHive.setError(resolvedValidator(key as FormHiveKey, value as HiveType[FormHiveKey]));
        else if (validateMode !== "onSubmit")
          if (validateMode === "onChange") nestedHive.setError(resolvedValidator(key as FormHiveKey, value as HiveType[FormHiveKey]));
          // TODO: onBlur validation couples to document.querySelector — consider making injectable for SSR/testing
          else if (validateMode === "onBlur") {
            const focusedElement = document.querySelector(":focus") as HTMLElement & { willValidateOnBlur?: boolean };
            if (focusedElement && !focusedElement.willValidateOnBlur) {
              focusedElement.willValidateOnBlur = true;
              focusedElement.addEventListener(
                "blur",
                () => {
                  setTimeout(() => {
                    nestedHive.setError(resolvedValidator?.(key as FormHiveKey, nestedHive.honey.value as HiveType[FormHiveKey]));
                    focusedElement.willValidateOnBlur = false;
                  }, 10);
                },
                { once: true },
              );
            }
          }
      }
      if (effect) formHive.setHoney((prev) => ({ ...prev, [key]: value }));
      else nestedHive.setHoney(value);
    };

    nestedHive.isValid = () => {
      if (!resolvedValidator) return true;
      nestedHive.setError(resolvedValidator(key as FormHiveKey, nestedHive.honey.value as HiveType[FormHiveKey]));
      return !nestedHive.honey.error;
    };

    nestedHive.subscribe((newValue: any) => {
      (formHive.honey as Record<string, unknown>)[key] = newValue.value;
      formHive.silentSetHoney(formHive.honey);
    });
    formHive.subscribe((newValue: any) => {
      if (newValue[key] === nestedHive.honey.value) return;
      nestedHive.setHoney(newValue[key]);
    });

    if ((formHive.honey as Record<string, unknown>)[key] !== nestedInitVal) {
      formHive.setHoney((prev) => ({ ...prev, [key]: nestedInitVal }));
      _initialValue = { ..._initialValue, [key]: nestedInitVal };
    }

    return nestedHive;
  };

  formHive.setFieldValue = (key: FormHiveKey, value: any, effect?: boolean) => {
    if (typeof value === "function") value = value(formHive.honey[key]);
    if (effect) formHive.setHoney((prev) => ({ ...prev, [key]: value }));
    else _NestedHives.get(String(key))?.setHoney(value);
  };
  formHive.getFieldValue = (key: FormHiveKey) => {
    const nested = _NestedHives.get(String(key));
    if (!nested) throw new Error(`[FormHive] getFieldValue: no field "${String(key)}" exists`);
    return nested.honey.value;
  };
  formHive.getFieldHive = <K extends keyof HiveType>(key: K) => _NestedHives.get(String(key)) as unknown as INestedFormHive<HiveType[K], TState>;
  formHive.subscribeToField = (key: FormHiveKey, callback: (value: any) => void) => {
    _NestedHives.get(String(key))?.subscribe(callback);
  };
  formHive.validate = (key: keyof HiveType, value: any, effect?: boolean) => {
    formHive.getFieldHive(key).validate(value, effect);
  };

  formHive.setFieldState = (key: keyof HiveType, state: Partial<TState>) => {
    const nh = _NestedHives.get(String(key));
    if (!nh) throw new Error(`[FormHive] setFieldState: no field "${String(key)}"`);
    nh.setState(state);
  };

  formHive.getFieldState = (key: keyof HiveType) => {
    const nh = _NestedHives.get(String(key));
    if (!nh) throw new Error(`[FormHive] getFieldState: no field "${String(key)}"`);
    const { value, error, ...state } = nh.honey;
    return state as TState;
  };

  // Create nested hives from initial value
  Object.entries(_initialValue as Record<string, unknown>).forEach(([key, val]) => {
    formHive.createFieldHive(key, val, _fields?.[key as keyof HiveType]);
  });

  formHive.reValidate = (validateKeys?: FormHiveKey[]) =>
    new Promise<boolean>((resolve) => {
      formHive.clearErrors();
      if (!validateKeys) validateKeys = Object.keys(_initialValue as Record<string, unknown>) as FormHiveKey[];

      setTimeout(() => {
        let isValid = true;
        const validateField = resolvedValidator;
        if (!validateField) return resolve(isValid);

        _NestedHives.forEach((nh, key) => {
          if (!validateKeys!.includes(key as FormHiveKey)) return;
          nh.setError(validateField(key as FormHiveKey, nh.honey.value));
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

  formHive.reset = (
    _init: {
      [K in keyof HiveType]?: HiveType[K];
    } = {},
  ) => {
    const newValues = structuredClone(_initialValue) as Record<string, unknown>;
    if (_init) {
      Object.keys(newValues).forEach((key) => {
        if (key in (_init as Record<string, unknown>)) newValues[key] = (_init as Record<string, unknown>)[key];
      });
    }
    formHive.setHoney(newValues as HiveType);
    _initialValue = structuredClone(newValues) as HiveType;

    // Restore field state exactly, removing transient keys added after creation.
    _NestedHives.forEach((nh, key) => {
      const value = nh.honey.value;
      nh.honey = {
        ...(_InitialFieldStates.get(key) ?? ({} as TState)),
        value,
        error: nh.honey.error,
      };
      nh.setHoney(value);
    });

    formHive.clearErrors();
    formHive.isDirtyHive.setHoney(false);
  };

  // Resolve factory validators only after the complete form API and every field
  // hive exist, so getValidator may safely inspect sibling values/state.
  if (getValidator) {
    const validators = getValidator(formHive);
    resolvedValidator = (key, value) => validators[key]?.(value);
  }

  return formHive;
}
