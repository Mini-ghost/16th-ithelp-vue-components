export default (color: string): string => {
  const match = color.match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
  if (!match) return '#000000';

  let colorString = match[0];

  if (colorString.length === 3) {
    colorString = colorString
      .split('')
      .map(char =>  char + char)
      .join('');
  }

  return `#${colorString}`;
};
