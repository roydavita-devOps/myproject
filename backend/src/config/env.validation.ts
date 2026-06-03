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
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed || PLACEHOLDER_VALUES.has(trimmed) || trimmed.startsWith('replace-with-')) {
    throw new Error(`${name} must be set to a non-placeholder value in production`);
  }

  if (trimmed.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production`);
  }
}
