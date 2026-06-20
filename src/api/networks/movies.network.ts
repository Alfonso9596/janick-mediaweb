import { http } from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { MovieInput } from '@/types/common'

const MOVIES_ENDPOINTS = {
  pageableMovies: '/movies',
  movieById: '/movies/:id',
  createMovie: '/movies',
  deleteMovie: '/movies/:id',
  editMovie: '/movies/:id',
  movieFiles: '/movies/:id/files',
  addRating: '/movies/rating',
}

const getPageableMovies = async (params?: Record<string, string | string[]>) => {
  try {
    let path = MOVIES_ENDPOINTS.pageableMovies
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

const getMovieById = async (id: string) => {
  try {
    let path = MOVIES_ENDPOINTS.movieById
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

const createNewMovie = async (body: MovieInput) => {
  try {
    const response = await http.post(MOVIES_ENDPOINTS.createMovie, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const deleteMovie = async (id: number) => {
  try {
    let path = MOVIES_ENDPOINTS.deleteMovie
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

const editMovie = async (id: number, body: MovieInput) => {
  try {
    let path = MOVIES_ENDPOINTS.editMovie
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

const getMovieFiles = async (id: string) => {
  try {
    let path = MOVIES_ENDPOINTS.movieFiles
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
    const response = await http.post(MOVIES_ENDPOINTS.addRating, {
      id,
      rating,
    })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export {
  getPageableMovies,
  getMovieById,
  createNewMovie,
  deleteMovie,
  editMovie,
  getMovieFiles,
  addRating,
  MOVIES_ENDPOINTS,
}
export default { getPageableMovies }
