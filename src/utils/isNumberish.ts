import isNumber from './isNumber';
import isString from './isString';

export default (value: unknown): value is number | `${number}` => {
  return isNumber(value) || (isString(value) && !isNaN(Number(value)));
};
