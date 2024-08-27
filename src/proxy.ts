/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { PipeDict } from '../types/proxy-types';
import encodingPipes from './pipes/encoding';
import stringPipes from './pipes/string';

export const defaultPipes: PipeDict = {
  ...stringPipes,
  ...encodingPipes,
};

export default function createProxy(
  context: Record<string, any>,
  additionalPipes?: PipeDict,
): Record<string, any> {
  const pipes = { ...defaultPipes, ...(additionalPipes || {}) };

  return new Proxy(context, {
    get(target, prop: string) {
      if (prop in target) {
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
          } else {
            throw new Error(`Pipe "${pipeName}" not found`);
          }
        }
        return value;
      }
      return undefined;
    },
  });
}
