import { type LocationQueryValue } from 'vue-router'

export const getParamsFromPath = (path: string | undefined) => {
  if (!path) {
    return ['']
  }
  return path
    ?.split(/\/|\?|&|=/)
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

export const convertParamsToURL = (params: any) => {
  let queryParams = ''
  for (const key in params) {
    if (params[key].length !== 0) {
      if (Array.isArray(params[key])) {
        params[key].forEach((item: { [x: string]: any }) => {
          for (const itemKey in item) {
            queryParams += `&${key}=${itemKey}=${item[itemKey]}`
          }
        })
      } else {
        queryParams += `&${key}=${params[key]}`
      }
    }
  }
  return queryParams.substring(1)
}
