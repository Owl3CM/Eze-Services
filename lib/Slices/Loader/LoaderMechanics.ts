import { LoaderFunction, LoaderProps } from "./Types";

export const LoaderMechanics = {
  load: async <L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined>(
    config: LoaderProps<L, R, Fmt>,
    params?: any,
    clearCache?: boolean
  ): Promise<Fmt extends undefined ? R : Fmt> => {
    try {
      // Call the loader function
      let response = await config.loader(params, clearCache);

      // Apply format function if provided
      if (config.format) {
        return config.format(response) as Fmt extends undefined ? R : Fmt;
      }

      return response as Fmt extends undefined ? R : Fmt;
    } catch (error) {
      // Handle error callback
      if (config.onError) {
        config.onError(error);
      }
      throw error;
    }
  },

  reload: async <L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined>(
    config: LoaderProps<L, R, Fmt>,
    params?: any
  ): Promise<Fmt extends undefined ? R : Fmt> => {
    // Reload is just load with clearCache = true
    return LoaderMechanics.load(config, params, true);
  },
};
