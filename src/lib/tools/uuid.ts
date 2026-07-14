const MIN_COUNT = 1;
const MAX_COUNT = 100;

export function generateUuid(): string {
  return crypto.randomUUID();
}

export function generateUuids(count: number): string[] {
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    throw new Error(`Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}.`);
  }

  return Array.from({ length: count }, () => generateUuid());
}

export const UUID_COUNT_LIMITS = { min: MIN_COUNT, max: MAX_COUNT };
