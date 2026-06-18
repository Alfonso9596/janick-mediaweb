import { type LocationQueryValue } from 'vue-router'

export const getParamsFromPath = (path: string | undefined) => {
  if (!path) {
    return ['']
  }
  return path
    ?.split(/[/?&=]/)
    .filter((i) => i.includes(':'))
    .map((i) => i.slice(1))
}

export const getPathWithParams = (
  path: string,
  params: {
    [x: string]: string | string[] | LocationQueryValue | LocationQueryValue[]
  },
) => {
  let newPath = path
  Object.entries(params).forEach((param) => {
    newPath = newPath.replace(`:${param[0]}`, param[1] as string)
  })
  return newPath
}

export const convertParamsToURL = (params: Record<string, string | string[]>) => {
  let queryParams = ''
  for (const key in params) {
    const value = params[key]
    if (value !== null && value.length !== 0) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          queryParams += `&${key}=${item}`
        })
      } else {
        queryParams += `&${key}=${value}`
      }
    }
  }
  return queryParams.substring(1)
}
