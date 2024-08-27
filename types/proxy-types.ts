// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PipeFn = (value: string, ...args: string[]) => any;

export type PipeDict = Record<string, PipeFn>;
