import { PipeDict } from '../../types/proxy-types';

// Escapes special characters for regex
export const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stringPipes: PipeDict = {
  trim: (value: string) => value.trim(),

  trimAll: (char: string, value: string) => {
    const escapedChar = escapeRegExp(char);
    return value.replace(new RegExp(`^${escapedChar}+|${escapedChar}+$`, 'g'), '');
  },

  trimSuffix: (
    suffix: string,
    value: string,
  ) => (value.endsWith(suffix) ? value.slice(0, -suffix.length) : value),

  trimPrefix: (
    prefix: string,
    value: string,
  ) => (value.startsWith(prefix) ? value.slice(prefix.length) : value),

  upper: (value: string) => value.toUpperCase(),
  lower: (value: string) => value.toLowerCase(),
  title: (value: string) => value.replace(/\b\w/g, (char) => char.toUpperCase()),
  untitle: (value: string) => value.replace(/\b\w/g, (char) => char.toLowerCase()),
  repeat: (value: string, count: string) => value.repeat(parseInt(count, 10)),

  substr: (
    value: string,
    start: string,
    end: string,
  ) => value.substring(parseInt(start, 10), parseInt(end, 10)),

  nospace: (value: string) => value.replace(/\s+/g, ''),

  trunc: (
    value: string,
    length: string,
  ) => (parseInt(length, 10) > 0
    ? value.slice(0, parseInt(length, 10))
    : value.slice(parseInt(length, 10))),

  abbrev: (value: string, maxLength: string) => (value.length > parseInt(maxLength, 10) ? `${value.slice(0, parseInt(maxLength, 10) - 3)}...` : value),

  abbrevboth: (value: string, leftOffset: string, maxLength: string) => {
    const len = parseInt(maxLength, 10);
    const left = parseInt(leftOffset, 10);

    if (value.length <= len) return value;

    const remainingLength = len - 6; // 6 accounts for the ellipses on both sides ("...")
    const rightOffset = value.length - (remainingLength + left);

    if (remainingLength <= 0) return `...${value.slice(-left)}...`;

    return `...${value.slice(left, value.length - rightOffset)}...`;
  },

  initials: (value: string) => value.split(/\s+/).map((word) => word.charAt(0).toUpperCase()).join(''),
  wrap: (value: string, width: string) => value.replace(new RegExp(`(.{1,${width}})(\\s|$)`, 'g'), '$1\n').trim(),
  wrapWith: (value: string, width: string, separator: string) => value.replace(new RegExp(`(.{1,${width}})(\\s|$)`, 'g'), `$1${separator}`).trim(),
  contains: (value: string, substring: string) => value.includes(substring),
  hasPrefix: (value: string, prefix: string) => value.startsWith(prefix),
  hasSuffix: (value: string, suffix: string) => value.endsWith(suffix),
  quote: (value: string) => `"${value}"`,
  squote: (value: string) => `'${value}'`,
  cat: (...args: string[]) => args.join(' '),
  indent: (value: string, width: string) => value.replace(/^/gm, ' '.repeat(parseInt(width, 10))),
  nindent: (value: string, width: string) => `\n${' '.repeat(parseInt(width, 10))}${value.replace(/\n/g, `\n${' '.repeat(parseInt(width, 10))}`)}`,
  replace: (value: string, oldSubStr: string, newSubStr: string) => value.replace(new RegExp(oldSubStr, 'g'), newSubStr),

  plural: (
    length: string,
    singular: string,
    plural: string,
  ) => (parseInt(length, 10) === 1 ? singular : plural),

  snakecase: (value: string) => value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
  camelcase: (value: string) => value.replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toUpperCase()),
  kebabcase: (value: string) => value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  swapcase: (value: string) => value.split('').map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())).join(''),
  shuffle: (value: string) => value.split('').sort(() => Math.random() - 0.5).join(''),
  regexMatch: (pattern: string, value: string) => new RegExp(pattern).test(value),

  regexFindAll: (pattern: string, value: string, n: string) => {
    const regex = new RegExp(pattern, 'g');
    const matches = value.match(regex) || [];
    return n === '-1' ? matches : matches.slice(0, parseInt(n, 10));
  },

  regexFind: (pattern: string, value: string) => {
    const match = value.match(new RegExp(pattern));
    return match ? match[0] : '';
  },

  regexReplaceAll: (pattern: string, value: string, replacement: string) => {
    const regex = new RegExp(pattern, 'g');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value.replace(regex, (_1, ...args) => replacement.replace(/\$\{(\d+)\}/g, (_2, groupIndex) => args[groupIndex - 1] || ''));
  },

  regexReplaceAllLiteral: (pattern: string, value: string, replacement: string) => {
    const regex = new RegExp(pattern, 'g');
    return value.replace(regex, replacement); // Perform a literal replacement
  },

  regexSplit: (pattern: string, value: string, n: string) => {
    const limit = parseInt(n, 10);
    const regex = new RegExp(pattern);

    if (limit === -1) {
      return value.split(regex);
    }

    const result = value.split(regex);
    return result.slice(0, limit);
  },

  regexQuoteMeta: (value: string) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
};

export default stringPipes;
