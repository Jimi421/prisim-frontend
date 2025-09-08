export function getEnv<T = Record<string, unknown>>(req?: Request | any, ctx?: { env?: T }): T | undefined {
  return (req as any)?.cf?.env ?? ctx?.env ?? (globalThis as any)?.env;
}
