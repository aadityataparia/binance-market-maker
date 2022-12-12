export const wait = async (timeInMs: number) => {
  return new Promise((res) => {
    setTimeout(res, timeInMs);
  });
};
