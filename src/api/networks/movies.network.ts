import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'

const MOVIES_ENDPOINTS = {
  pageableMovies: '/movies',
  movieById: '/movies/:id',
  allGenres: '/genres/movies',
  createMovie: '/movies',
}

const getPageableMovies = async (params?: any) => {
  try {
    let path = MOVIES_ENDPOINTS.pageableMovies
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

const getAllGenres = async () => {
  try {
    const response = await http.get(MOVIES_ENDPOINTS.allGenres)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const createNewMovie = async (body: any) => {
  try {
    const response = await http.post(MOVIES_ENDPOINTS.createMovie, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getPageableMovies, getMovieById, getAllGenres, createNewMovie, MOVIES_ENDPOINTS }
export default { getPageableMovies }
