/* eslint-disable @typescript-eslint/no-base-to-string */
import { PipeDict } from '../../types/proxy-types';

// Escapes special characters for regex
export const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stringPipes: PipeDict = {
  trim: (value) => value.toString().trim(),

  trimAll: (char, value) => {
    const escapedChar = escapeRegExp(char.toString());
    return value.replace(new RegExp(`^${escapedChar}+|${escapedChar}+$`, 'g'), '');
  },

  trimSuffix: (
    suffix,
    value,
  ) => (value.endsWith(suffix.toString()) ? value.slice(0, -suffix.toString().length) : value),

  trimPrefix: (
    prefix,
    value,
  ) => (value.startsWith(prefix.toString()) ? value.slice(prefix.toString().length) : value),

  upper: (value) => value.toString().toUpperCase(),
  lower: (value) => value.toString().toLowerCase(),
  title: (value) => value.toString().replace(/\b\w/g, (char) => char.toUpperCase()),
  untitle: (value) => value.toString().replace(/\b\w/g, (char) => char.toLowerCase()),
  repeat: (value, count) => value.toString().repeat(parseInt(count, 10)),

  substr: (
    value,
    start,
    end,
  ) => value.toString().substring(parseInt(start, 10), parseInt(end, 10)),

  nospace: (value) => value.toString().replace(/\s+/g, ''),

  trunc: (
    value,
    length,
  ) => (parseInt(length, 10) > 0
    ? value.toString().slice(0, parseInt(length, 10))
    : value.toString().slice(parseInt(length, 10))),

  abbrev: (value, maxLength) => (value.toString().length > parseInt(maxLength, 10) ? `${value.toString().slice(0, parseInt(maxLength, 10) - 3)}...` : value),

  abbrevboth: (value, leftOffset, maxLength) => {
    const len = parseInt(maxLength, 10);
    const left = parseInt(leftOffset, 10);

    if (value.toString().length <= len) return value;

    const remainingLength = len - 6; // 6 accounts for the ellipses on both sides ("...")
    const rightOffset = value.toString().length - (remainingLength + left);

    if (remainingLength <= 0) return `...${value.toString().slice(-left)}...`;

    return `...${value.toString().slice(left, value.toString().toString().length - rightOffset)}...`;
  },

  initials: (value) => value.toString().split(/\s+/).map((word) => word.charAt(0).toUpperCase()).join(''),
  wrap: (value, width) => value.toString().replace(new RegExp(`(.{1,${width}})(\\s|$)`, 'g'), '$1\n').trim(),
  wrapWith: (value, width, separator) => value.toString().replace(new RegExp(`(.{1,${width}})(\\s|$)`, 'g'), `$1${separator}`).trim(),
  contains: (value, substring) => value.toString().includes(substring),
  hasPrefix: (value, prefix) => value.toString().startsWith(prefix),
  hasSuffix: (value, suffix) => value.toString().endsWith(suffix),
  quote: (value) => `"${value.toString()}"`,
  squote: (value) => `'${value.toString()}'`,
  cat: (...args) => args.join(' '),
  indent: (value, width) => value.toString().replace(/^/gm, ' '.repeat(parseInt(width, 10))),
  nindent: (value, width) => `\n${' '.repeat(parseInt(width, 10))}${value.toString().replace(/\n/g, `\n${' '.repeat(parseInt(width, 10))}`)}`,
  replace: (value, oldSubStr, newSubStr) => value.toString().replace(new RegExp(oldSubStr, 'g'), newSubStr),

  plural: (
    length,
    singular,
    plural,
  ) => (parseInt(length.toString(), 10) === 1 ? singular : plural),

  snakecase: (value) => value.toString().replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
  camelcase: (value) => value.toString().replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toUpperCase()),
  kebabcase: (value) => value.toString().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  swapcase: (value) => value.toString().split('').map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())).join(''),
  shuffle: (value) => value.toString().split('').sort(() => Math.random() - 0.5).join(''),
  regexMatch: (pattern, value) => new RegExp(pattern.toString()).test(value),

  regexFindAll: (pattern, value, n) => {
    const regex = new RegExp(pattern.toString(), 'g');
    const matches = value.match(regex) || [];
    return n === '-1' ? matches : matches.slice(0, parseInt(n, 10));
  },

  regexFind: (pattern, value) => {
    const match = value.match(new RegExp(pattern.toString()));
    return match ? match[0] : '';
  },

  regexReplaceAll: (pattern, value, replacement) => {
    const regex = new RegExp(pattern.toString(), 'g');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value.replace(regex, (_1, ...args) => replacement.replace(/\$\{(\d+)\}/g, (_2, groupIndex) => args[groupIndex - 1] || ''));
  },

  regexReplaceAllLiteral: (pattern, value, replacement) => {
    const regex = new RegExp(pattern.toString(), 'g');
    return value.replace(regex, replacement); // Perform a literal replacement
  },

  regexSplit: (pattern, value, n) => {
    const limit = parseInt(n, 10);
    const regex = new RegExp(pattern.toString());

    if (limit === -1) {
      return value.split(regex);
    }

    const result = value.split(regex);
    return result.slice(0, limit);
  },

  regexQuoteMeta: (value) => value.toString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
};

export default stringPipes;
