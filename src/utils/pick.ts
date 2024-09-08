export default function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
) {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}
