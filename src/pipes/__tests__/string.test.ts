/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import pipes from '../string';

describe('String manipulation pipe functions', () => {
  it('should trim spaces from both sides of a string', () => {
    expect(pipes.trim('   hello   ')).toBe('hello');
  });

  it('should trim all occurrences of a character from both sides of a string', () => {
    expect(pipes.trimAll('$', '$5.00')).toBe('5.00');
  });

  it('should trim suffix from a string', () => {
    expect(pipes.trimSuffix('-', 'hello-')).toBe('hello');
  });

  it('should trim prefix from a string', () => {
    expect(pipes.trimPrefix('-', '-hello')).toBe('hello');
  });

  it('should convert a string to uppercase', () => {
    expect(pipes.upper('hello')).toBe('HELLO');
  });

  it('should convert a string to lowercase', () => {
    expect(pipes.lower('HELLO')).toBe('hello');
  });

  it('should convert a string to title case', () => {
    expect(pipes.title('hello world')).toBe('Hello World');
  });

  it('should remove title casing from a string', () => {
    expect(pipes.untitle('Hello World')).toBe('hello world');
  });

  it('should repeat a string multiple times', () => {
    expect(pipes.repeat('hello', '3')).toBe('hellohellohello');
  });

  it('should return a substring from a string', () => {
    expect(pipes.substr('hello world', '0', '5')).toBe('hello');
  });

  it('should remove all whitespace from a string', () => {
    expect(pipes.nospace('hello w o r l d')).toBe('helloworld');
  });

  it('should truncate a string without suffix', () => {
    expect(pipes.trunc('hello world', '5')).toBe('hello');
  });

  it('should abbreviate a string with ellipses', () => {
    expect(pipes.abbrev('hello world', '5')).toBe('he...');
  });

  it('should abbreviate both sides of a string', () => {
    expect(pipes.abbrevboth('1234 5678 9123', '5', '10')).toBe('...5678...');
  });

  it('should return the initials of a string', () => {
    expect(pipes.initials('First Try')).toBe('FT');
  });

  it('should wrap text at a given column count', () => {
    expect(pipes.wrap('This is a long line of text', '10')).toBe('This is a\nlong line\nof text');
  });

  it('should wrap text with a custom string', () => {
    expect(pipes.wrapWith('Hello World', '5', '\t')).toBe('Hello\tWorld');
  });

  it('should test if a string contains another string', () => {
    expect(pipes.contains('catch', 'cat')).toBe(true);
  });

  it('should test if a string has a given prefix', () => {
    expect(pipes.hasPrefix('catch', 'cat')).toBe(true);
  });

  it('should test if a string has a given suffix', () => {
    expect(pipes.hasSuffix('catch', 'ch')).toBe(true);
  });

  it('should quote a string', () => {
    expect(pipes.quote('hello')).toBe('"hello"');
  });

  it('should single quote a string', () => {
    expect(pipes.squote('hello')).toBe("'hello'");
  });

  it('should concatenate multiple strings with spaces', () => {
    expect(pipes.cat('hello', 'beautiful', 'world')).toBe('hello beautiful world');
  });

  it('should indent every line of a string', () => {
    expect(pipes.indent('This is a test', '4')).toBe('    This is a test');
  });

  it('should nindent every line of a string', () => {
    expect(pipes.nindent('This is a test', '4')).toBe('\n    This is a test');
  });

  it('should replace a substring with another string', () => {
    expect(pipes.replace('I Am Henry VIII', ' ', '-')).toBe('I-Am-Henry-VIII');
  });

  it('should pluralize a string', () => {
    expect(pipes.plural('1', 'one anchovy', 'many anchovies')).toBe('one anchovy');
    expect(pipes.plural('2', 'one anchovy', 'many anchovies')).toBe('many anchovies');
  });

  it('should convert a string from camelCase to snake_case', () => {
    expect(pipes.snakecase('FirstName')).toBe('first_name');
  });

  it('should convert a string from snake_case to CamelCase', () => {
    expect(pipes.camelcase('http_server')).toBe('HttpServer');
  });

  it('should convert a string from camelCase to kebab-case', () => {
    expect(pipes.kebabcase('FirstName')).toBe('first-name');
  });

  it('should swap the case of a string', () => {
    expect(pipes.swapcase('This Is A.Test')).toBe('tHIS iS a.tEST');
  });

  it('should shuffle a string', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = pipes.shuffle('hello');
    expect(result.length).toBe(5);
    expect(result).not.toBe('hello'); // Ensure it's different from the input
  });

  it('should match a regex pattern', () => {
    expect(pipes.regexMatch('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$', 'test@acme.com')).toBe(true);
  });

  it('should find all regex matches in a string', () => {
    expect(pipes.regexFindAll('[2,4,6,8]', '123456789', '-1')).toEqual(['2', '4', '6', '8']);
  });

  it('should find the first regex match in a string', () => {
    expect(pipes.regexFind('[a-zA-Z][1-9]', 'abcd1234')).toBe('d1');
  });

  it('should replace regex matches with a replacement string', () => {
    // eslint-disable-next-line no-template-curly-in-string
    expect(pipes.regexReplaceAll('a(x*)b', '-ab-axxb-', '${1}W')).toBe('-W-xxW-');
  });

  it('should replace regex matches with a literal replacement string', () => {
    // eslint-disable-next-line no-template-curly-in-string
    expect(pipes.regexReplaceAllLiteral('a(x*)b', '-ab-axxb-', '${1}')).toBe('-${1}-${1}-');
  });

  it('should split a string using a regex pattern', () => {
    expect(pipes.regexSplit('z+', 'pizza', '-1')).toEqual(['pi', 'a']);
  });

  it('should escape all regex metacharacters in a string', () => {
    expect(pipes.regexQuoteMeta('1.2.3')).toBe('1\\.2\\.3');
  });
});
