import mustache from 'wontache';
import createProxy from '../proxy';
import { PipeFn } from '../../types/proxy-types';

const extraPipes = {
  uppercase: (value: string) => value.toUpperCase(),
  lowercase: (value: string) => value.toLowerCase(),
  reverse: (value: string) => value.split('').reverse().join(''),
  plus: (value: string, add: string) => (
    parseFloat(value.toString()) + parseFloat(add.toString())
  ),
  trim: (value: string) => value.trim(),
  toFixed: (value: string, digits: string) => (
    parseFloat(value.toString()).toFixed(parseFloat(digits.toString()))
  ),
  toBase64: (value: string) => Buffer.from(value.toString()).toString('base64'),
  fromBase64: (value: string) => Buffer.from(value.toString(), 'base64').toString('utf-8'),
};

describe('Wontache Piping Functionality', () => {
  it('should apply a single pipe function', () => {
    const template = '{{name | uppercase}}';
    const data = createProxy({
      name: 'Alice',
    }, extraPipes);

    const output = mustache(template)(data);
    expect(output).toBe('ALICE');
  });

  it('should apply multiple pipe functions in sequence', () => {
    const template = '{{greeting | reverse | lowercase}}';
    const data = createProxy({
      greeting: 'Hello World!',
    }, extraPipes);

    const output = mustache(template)(data);
    expect(output).toBe('!dlrow olleh');
  });

  it('should apply pipe function with arguments', () => {
    const template = '{{day | plus 5}}';
    const data = createProxy({
      day: 1,
    }, extraPipes);

    const output = mustache(template)(data);
    expect(output).toBe('6');
  });

  it('should handle undefined values gracefully', () => {
    const template = '{{unknown | uppercase}}';
    const data = createProxy({
      name: 'Alice',
    }, extraPipes);

    const output = mustache(template)(data);
    expect(output).toBe('');
  });

  it('should throw an error for undefined pipes', () => {
    const template = '{{name | nonExistentPipe}}';
    const data = createProxy({
      name: 'Alice',
    }, extraPipes);

    expect(() => mustache(template)(data)).toThrow('Pipe "nonExistentPipe" not found');
  });

  it('should support nested paths with pipes', () => {
    const template = '{{user.name | uppercase}}';
    const data = createProxy({
      user: {
        name: 'Bob',
      },
      extraPipes,
    });

    const output = mustache(template)(data);
    expect(output).toBe('BOB');
  });

  it('should apply pipe function with multiple arguments', () => {
    // Add a pipe function with multiple arguments
    const multiply: PipeFn = (
      value: string,
      factor: string,
      add: string,
    ) => parseFloat(value) * parseFloat(factor) + parseFloat(add);

    const template = '{{number | multiply 2 3}}';
    const data = createProxy(
      {
        number: 5,
      },
      {
        multiply,
      },
    );

    const output = mustache(template)(data);
    expect(output).toBe('13'); // (5 * 2) + 3 = 13
  });
});
