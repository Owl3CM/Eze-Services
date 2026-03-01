# UI Components

## Component Reference

| Export                | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `Wrapper`             | Scroll container with pull-to-refresh, infinite scroll, status overlay  |
| `StatusKit`           | Default status → component map: loading, error, empty, processing, etc. |
| `setDefaultStatusKit` | Override specific StatusKit entries at runtime                          |
| `StatusBee`           | Renders status UI from a status hive using StatusKit                    |
| `StateBuilder`        | Builds state-dependent UI from a StateKit map                           |
| `ControllerContainer` | Connects a `FormHive` nested field to any `Element` component           |

## Wrapper Props

`service`, `reload`, `loadMore`, `subscribeToStatus`, `statusHive`, `canLoadHive`, `statusKit`, `rememberScrollPosition`, `isScrollPositionTopHive`, `reloaderProps`, `className`

## ControllerContainer

Connects a `FormHive` nested field to any `Element` component — passes `setValue`, `value`, `error`, `id`.

## Constants

| Export             | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `DefaultStatusKit` | Status → component map with priority               |
| `StateKit`         | Default state rendering map                        |
| `Loader`           | Loading spinner component                          |
| `IState`           | Type: `"idle" \| "loading" \| "processing" \| ...` |
| `ServiceState`     | Type: `IState \| { state: IState; props: any }`    |

## Source Files

| File                | Path                                         |
| ------------------- | -------------------------------------------- |
| Wrapper             | `lib/Ui/Wrappers/Wrapper.tsx`                |
| Wrapper types       | `lib/Ui/Wrappers/types.ts`                   |
| ControllerContainer | `lib/Ui/Containers/ControllerContainers.tsx` |
| Constants           | `lib/System/Constants/`                      |
