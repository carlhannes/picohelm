/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable no-continue */
/* eslint-disable no-bitwise */

import { PipeDict } from '../../types/proxy-types';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_PAD_CHAR = '=';

function base32Encode(input: string): string {
  let output = '';
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < input.length; i += 1) {
    buffer = (buffer << 8) | input.charCodeAt(i);
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      const index = (buffer >> (bitsLeft - 5)) & 31;
      output += BASE32_ALPHABET[index];
      bitsLeft -= 5;
    }
  }

  if (bitsLeft > 0) {
    output += BASE32_ALPHABET[(buffer << (5 - bitsLeft)) & 31];
  }

  while (output.length % 8 !== 0) {
    output += BASE32_PAD_CHAR;
  }

  return output;
}

function base32Decode(inputStr: string): string {
  let buffer = 0;
  let bitsLeft = 0;
  let output = '';

  const input = inputStr.replace(new RegExp(BASE32_PAD_CHAR, 'g'), '');

  for (let i = 0; i < input.length; i += 1) {
    const index = BASE32_ALPHABET.indexOf(input[i].toUpperCase());
    if (index === -1) continue; // skip invalid characters

    buffer = (buffer << 5) | index;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      output += String.fromCharCode((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }

  return output;
}

const encodingPipes: PipeDict = {
  b64enc: (value) => Buffer.from(value.toString()).toString('base64'),
  b64dec: (value) => Buffer.from(value.toString(), 'base64').toString('utf-8'),
  b32enc: (value) => base32Encode(value.toString()),
  b32dec: (value) => base32Decode(value.toString()),
};

export default encodingPipes;
