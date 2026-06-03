const PLACEHOLDER_VALUES = new Set([
  '',
  'change-me-access',
  'change-me-refresh',
  'change-me-long-random-access-secret',
  'change-me-long-random-refresh-secret',
]);

export function validateEnv(config: Record<string, unknown>) {
  if (config.NODE_ENV !== 'production') return config;

  assertSecret(config.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET');
  assertSecret(config.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');

  return config;
}

function assertSecret(value: unknown, name: string) {
  if (typeof value !== 'string' || PLACEHOLDER_VALUES.has(value.trim())) {
    throw new Error(`${name} must be set to a non-placeholder value in production`);
  }

  if (value.trim().length < 32) {
    throw new Error(`${name} must be at least 32 characters in production`);
  }
}
