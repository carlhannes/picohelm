import pipes from '../encoding';

describe('Encoding and decoding functions', () => {
  it('should encode a string to Base64', () => {
    expect(pipes.b64enc('hello world')).toBe('aGVsbG8gd29ybGQ=');
  });

  it('should decode a Base64 string', () => {
    expect(pipes.b64dec('aGVsbG8gd29ybGQ=')).toBe('hello world');
  });

  it('should encode a string to Base32', () => {
    expect(pipes.b32enc('hello world')).toBe('NBSWY3DPEB3W64TMMQ======');
  });

  it('should decode a Base32 string', () => {
    expect(pipes.b32dec('NBSWY3DPEB3W64TMMQ======')).toBe('hello world');
  });
});
