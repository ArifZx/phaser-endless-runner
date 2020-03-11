export function zeroAppend(number: number, digit = 5) {
  let temp = number.toString();
  const length = Math.max(0, digit - temp.length);
  for (let i = 0; i < length; i++) {
    temp = "0" + temp;
  }

  return temp;
}
