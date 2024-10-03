// Source: https://github.com/Qix-/color-convert/blob/6b7dee5a168f76bf42c084fefa7bbe1a0941ad7e/conversions.js#L630-L650
export default (color: any): [r: number, g: number, b: number] => {
  const string = color.toString(16) as string;
  const match = string.match(/[a-f0-9]{6}|[a-f0-9]{3}/i);

  if (!match) return [0, 0, 0];

  let colorString = match[0];

  if (colorString.length === 3) {
    colorString = colorString
      .split('')
      .map(char =>  char + char)
      .join('');
  }

  const integer = parseInt(colorString, 16);
  const r = (integer >> 16) & 0xff;
  const g = (integer >> 8) & 0xff;
  const b = integer & 0xff;

  return [r, g, b];
};
