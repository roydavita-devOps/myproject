import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('allows development without production secrets', () => {
    expect(validateEnv({ NODE_ENV: 'development' })).toEqual({ NODE_ENV: 'development' });
  });

  it('rejects blank production access secrets', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: '',
        JWT_REFRESH_SECRET: 'a'.repeat(32),
      }),
    ).toThrow('JWT_ACCESS_SECRET');
  });

  it('rejects placeholder production refresh secrets', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'change-me-long-random-refresh-secret',
      }),
    ).toThrow('JWT_REFRESH_SECRET');
  });

  it('allows strong production secrets', () => {
    const config = {
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
    };

    expect(validateEnv(config)).toBe(config);
  });
});
