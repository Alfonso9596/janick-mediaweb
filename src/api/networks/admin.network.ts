import { http } from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'

const ADMIN_ENDPOINTS = {
  pageableUsers: '/admin/users',
  userById: '/admin/users/:id',
  deleteUser: '/admin/users/:id',
  allRoles: '/admin/roles',
  allMovies: '/admin/movies',
  allSeries: '/admin/series',
  allGames: '/admin/games',
}

const getPageableUsers = async (params?: any) => {
  try {
    let path = ADMIN_ENDPOINTS.pageableUsers
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

const getAllRoles = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allRoles)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getAllMovies = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allMovies)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getAllSeries = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allSeries)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getAllGames = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allGames)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getPageableUsers, getAllRoles, getAllMovies, getAllSeries, getAllGames }
