import isNumberish from './isNumberish';
import isString from './isString';

export default (value: number | string, unit = 'px') => {
  if (isNumberish(value)) {
    return `${value}${unit}`;
  } else if (isString(value)) {
    return value;
  }
};
