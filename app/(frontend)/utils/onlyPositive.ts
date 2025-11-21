export const onlyPositive = (value: string | number) => {
  const num = Number(value);
  return num < 0 ? 0 : num;
};
