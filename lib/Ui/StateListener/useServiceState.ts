export const useServiceState = (service: any, name: string) => {
  const value = service.useStore((state: any) => state[name]);
  const setValue = (value: any) => service.set({ [name]: value });

  return [value, setValue];
};
