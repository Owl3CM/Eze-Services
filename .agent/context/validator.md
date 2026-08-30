# Validator

## Usage

```typescript
import { Validator, ValidatorMessagesArabic } from "eze-factory";

// Set global messages (once at app start)
Validator.Init(ValidatorMessagesArabic);

// Builder pattern → returns (value: any) => string | undefined
const validate = new Validator("Email").required().email().min(5).build();

// Static factory shorthand
const v = Validator.Create("Name").required().string().build();

// Async → returns async (value, context?) => Promise<string | undefined>
const asyncValidate = new Validator("Username")
  .required()
  .custom(async (v) => {
    const exists = await checkUsername(v);
    return exists ? "Already taken" : undefined;
  })
  .buildAsync();
```

## Methods (all chainable)

| Category     | Methods                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------- |
| Type checks  | `string`, `number`, `boolean`, `array`, `object`                                                                                          |
| Length/range | `min(n)`, `max(n)`, `gt(n)`, `lt(n)`, `length(n)`, `arrayLength(n)`                                                                       |
| Required     | `required`                                                                                                                                |
| Number       | `integer`, `positive`, `negative`                                                                                                         |
| String fmt   | `email`, `url`, `uuid`, `hex`, `ip`, `ipv6`, `macAddress`, `json`, `time`, `regex(pattern)`, `lowercase`, `uppercase`, `passwordStrength` |
| Set          | `oneOf(arr)`, `notOneOf(arr)`, `nonEmptyArray`                                                                                            |
| Date         | `date`, `before(dateStr)`, `after(dateStr)`                                                                                               |
| Specialized  | `phoneNumber(opts?)`, `postalCode`, `isoCountryCode`, `creditCardExpiry`                                                                  |
| Custom       | `custom(fn)` — `fn: (value) => string                                                                                                     | undefined | Promise<...>` |

All methods accept an optional `customMessage` parameter.

**Build:** `build()` → sync validator, `buildAsync()` → async validator

**Exports:** `Validator` class, `ValidatorMessagesEnglish`, `ValidatorMessagesArabic`, `IValidatorMessages` type

## Source Files

| File            | Path                         |
| --------------- | ---------------------------- |
| Validator class | `lib/Validator/Validator.ts` |
| Barrel export   | `lib/Validator/index.ts`     |
