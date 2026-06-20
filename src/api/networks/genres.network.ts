import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { GenreInput } from '@/types/common'

const GENRES_ENDPOINTS = {
  pageableMovieGenres: '/genres/movies',
  pageableGameGenres: '/genres/games',
  allMovieGenres: '/genres/movies/list',
  allGameGenres: '/genres/games/list',
  createMovieGenre: '/genres/movies',
  createGameGenre: '/genres/games',
  editMovieGenre: '/genres/movies/:id',
  editGameGenre: '/genres/games/:id',
  deleteMovieGenre: '/genres/movies/:id',
  deleteGameGenre: '/genres/games/:id'
}

const getPageableMovieGenres = async (params?: Record<string, string | string[]>) => {
  try {
    let path = GENRES_ENDPOINTS.pageableMovieGenres
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

const getPageableGameGenres = async (params?: Record<string, string | string[]>) => {
  try {
    let path = GENRES_ENDPOINTS.pageableGameGenres
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

const getAllMovieGenres = async () => {
  try {
    const response = await http.get(GENRES_ENDPOINTS.allMovieGenres)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getAllGameGenres = async () => {
  try {
    const response = await http.get(GENRES_ENDPOINTS.allGameGenres)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const createMovieGenre = async (body: GenreInput) => {
  try {
    const response = await http.post(GENRES_ENDPOINTS.createMovieGenre, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const createGameGenre = async (body: GenreInput) => {
  try {
    const response = await http.post(GENRES_ENDPOINTS.createGameGenre, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editMovieGenre = async (id: number, body: GenreInput) => {
  try {
    let path = GENRES_ENDPOINTS.editMovieGenre
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        id: String(id),
      })
    }
    const response = await http.put(path, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editGameGenre = async (id: number, body: GenreInput) => {
  try {
    let path = GENRES_ENDPOINTS.editGameGenre
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

const deleteMovieGenre = async (id: number) => {
  try {
    let path = GENRES_ENDPOINTS.deleteMovieGenre
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

const deleteGameGenre = async (id: number) => {
  try {
    let path = GENRES_ENDPOINTS.deleteGameGenre
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

export { getPageableMovieGenres, getPageableGameGenres, getAllMovieGenres, getAllGameGenres, createMovieGenre, createGameGenre, editMovieGenre, editGameGenre, deleteMovieGenre, deleteGameGenre }
