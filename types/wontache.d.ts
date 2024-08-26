declare module 'wontache' {
  // Define the mustache function
  function mustache(
    template: string,
    delimiters?: [string, string]
  ): (data: unknown, options?: RenderOptions) => string;

  // Render options interface, allowing for passing partials and decompilation option
  interface RenderOptions {
    partials?: Record<string, string | ((data: unknown) => string)>;
    decompile?: boolean;
  }

  // Export mustache as the default export
  export default mustache;
}

declare module 'wontache/wrap-module' {
  interface WrapModuleOptions {
    precompile?: boolean;
    type?: 'ESM' | 'AMD' | 'CommonJS';
    delimiters?: [string, string];
    wontache?: string;
  }

  function wrapModule(template: string, options?: WrapModuleOptions): string;

  export default wrapModule;
}
