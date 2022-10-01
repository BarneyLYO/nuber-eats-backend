export const randString = () =>
  Math.random().toString(36).substring(2)

export const base64 = (str: string) =>
  Buffer.from(str).toString('base64')
