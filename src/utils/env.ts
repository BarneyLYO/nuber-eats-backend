import * as Joi from 'joi'

export const isENV = (env: 'dev' | 'prod' | 'test') => {
  console.log(process.env.NODE_ENV)
  return process.env.NODE_ENV === env
}

export const getFromProcessEnvByPrefix = (
  prefix: string,
  keyNameTransform?: (originKey: string) => string
) => {
  return Object.keys(process.env).reduce((prev, curr) => {
    if (!curr.startsWith(prefix)) return prev
    const value = process.env[curr]
    const key = keyNameTransform
      ? keyNameTransform(curr)
      : curr
    return {
      ...prev,
      [key]: value
    }
  }, {})
}

export const generateEnvSchemaValidate = (
  list: string[],
  prefix: string
) =>
  list.reduce((prev, key) => {
    return {
      ...prev,
      [(prefix + key).toUpperCase()]:
        Joi.string().required()
    }
  }, {})
