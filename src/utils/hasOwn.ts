const hasOwnProperty = Object.prototype.hasOwnProperty;
export default (val: object, key: string | symbol): key is keyof typeof val =>
  hasOwnProperty.call(val, key);
