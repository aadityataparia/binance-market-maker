export const log = (...params: any[]) => {
  if (process.env.LOG || process.env.DEBUG) {
    console.log(...params);
  }
};

export const debug = (...params: any[]) => {
  if (process.env.DEBUG) {
    console.log(...params);
  }
};
