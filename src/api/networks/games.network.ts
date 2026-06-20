import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { GameInput } from '@/types/common'

const GAMES_ENDPOINTS = {
  pageabelGames: '/games',
  gameById: '/games/:id',
  createGame: '/games',
  deleteGame: '/games/:id',
  editGame: '/games/:id',
  gameFiles: '/games/:id/files',
  addRating: '/games/rating',
}

const getPageableGames = async (params?: Record<string, string | string[]>) => {
  try {
    let path = GAMES_ENDPOINTS.pageabelGames
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, params as Record<string, string | string[]>)
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

const createNewGame = async (body: GameInput) => {
  try {
    const response = await http.post(GAMES_ENDPOINTS.createGame, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const deleteGame = async (id: number) => {
  try {
    let path = GAMES_ENDPOINTS.deleteGame
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        id: String(id)
      })
    }
    const response = await http.delete(path)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editGame = async (id: number, body: GameInput) => {
  try {
    let path = GAMES_ENDPOINTS.editGame
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        id: String(id)
      })
    }
    const response = await http.put(path, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const getGameFiles = async (id: string) => {
  try {
    let path = GAMES_ENDPOINTS.gameFiles
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

const addRating = async (id: number, rating: number) => {
  try {
    const response = await http.post(GAMES_ENDPOINTS.addRating, {
      id,
      rating,
    })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getPageableGames, getGameById, createNewGame, deleteGame, editGame, getGameFiles, addRating, GAMES_ENDPOINTS }
export default { getPageableGames }
