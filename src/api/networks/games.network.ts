import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'

const GAMES_ENDPOINTS = {
  pageabelGames: '/games',
  gameById: '/games/:id',
}

const getPageableGames = async (params?: any) => {
  try {
    let path = GAMES_ENDPOINTS.pageabelGames
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        ...params,
      })
    }
    if (params) {
      const convertedParams = convertParamsToURL(params)
      path = `${path}?${convertedParams}`
    }
    const response = await http.get(path)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getGameById = async (id: string) => {
  try {
    let path = GAMES_ENDPOINTS.gameById
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        id,
      })
    }
    const response = await http.get(path)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getPageableGames, getGameById, GAMES_ENDPOINTS }
export default { getPageableGames }
