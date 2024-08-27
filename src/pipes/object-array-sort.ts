/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { PipeDict } from '../../types/proxy-types';

const objectArraySortPipes: PipeDict = {
  hasKey: (obj, key: string) => Object.prototype.hasOwnProperty.call(obj, key),

  isLast: (arr: any) => {
    if (arr._parent) {
      return arr._parent[arr._parent.length - 1] === arr._value;
    }
    return false;
  },

  isFirst: (arr: any) => {
    if (arr._parent) {
      return arr._parent[0] === arr._value;
    }
    return false;
  },

  values: (obj) => Object.keys(obj).map((key) => ({
    _key: key,
    // @ts-expect-error this is so ugly but hey it works
    _value: obj[key],
    _parent: obj,
    // @ts-expect-error this is so ugly but hey it works
    toString: () => obj[key],
  })),

  // @ts-expect-error ugh
  sortAlpha: (arr: string[]) => {
    if (!Array.isArray(arr)) {
      return arr;
    }
    return arr.slice().sort((a, b) => a.localeCompare(b));
  },

  // @ts-expect-error ugh
  reverse: (arr: any[]) => (Array.isArray(arr) ? arr.slice().reverse() : arr),

  // @ts-expect-error ugh
  uniq: (arr: any[]) => Array.from(new Set(arr)),

  // JSON
  json: (obj) => JSON.stringify(obj),

  // console.log
  log: (obj) => {
    console.log('Logging object: ', obj);
    return obj;
  },
};

export default objectArraySortPipes;
