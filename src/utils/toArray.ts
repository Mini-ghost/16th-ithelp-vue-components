import isNullOrUndefined from './isNullOrUndefined';

export default <T>(value: T | T[]): T[] => {
  if (isNullOrUndefined(value)) return [];
  return Array.isArray(value) ? value : [value];
};
