/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { PipeDict } from '../types/proxy-types';
import encodingPipes from './pipes/encoding';
import objectArraySortPipes from './pipes/object-array-sort';
import stringPipes from './pipes/string';

export const defaultPipes: PipeDict = {
  ...stringPipes,
  ...encodingPipes,
  ...objectArraySortPipes,
};

export default function createProxy(
  context: Record<string, any>,
  additionalPipes?: PipeDict,
): Record<string, any> {
  const pipes = { ...defaultPipes, ...(additionalPipes || {}) };

  return new Proxy(context, {
    get(target, prop: string) {
      if (typeof prop === 'symbol') {
        return target[prop];
      }
      if (typeof target[prop] !== 'undefined') {
        const value = target[prop];
        if (typeof value === 'object' && value !== null) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createProxy(value, pipes);
        }
        return typeof value === 'function' ? value.call(target) : value;
      } if (prop.includes('|')) {
        // Split the pipes by `|` and process each one
        const [key, ...pipeSegments] = prop.split('|').map((p) => p.trim());

        // Initial value lookup
        let value = target[key];
        if (value === undefined) return undefined;

        for (const segment of pipeSegments) {
          const [pipeName, ...args] = segment.split(' ').map((arg) => arg.trim());

          if (pipes[pipeName]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            value = pipes[pipeName](value, ...args);
            if ((typeof value === 'object' && value !== null)) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              value = createProxy(value, pipes);
            }
          } else {
            throw new Error(`Pipe "${pipeName}" not found while processing "${prop}"`);
          }
        }
        return value;
      }
      return undefined;
    },
  });
}
