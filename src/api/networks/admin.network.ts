import { http } from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { UserInput } from '@/types/common'

const ADMIN_ENDPOINTS = {
  pageableUsers: '/admin/users',
  userById: '/admin/users/:id',
  createUser: '/admin/users',
  deleteUser: '/admin/users/:id',
  editUser: '/admin/users/:id',
  allRoles: '/admin/roles/list',
  allMovies: '/admin/movies',
  allSeries: '/admin/series',
  allGames: '/admin/games',
  allMusic: '/admin/music'
}

const getPageableUsers = async (params?: Record<string, string | string[]>) => {
  try {
    let path = ADMIN_ENDPOINTS.pageableUsers
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

const createUser = async (body: UserInput) => {
  try {
    const response = await http.post(ADMIN_ENDPOINTS.createUser, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const deleteUser = async (id: number) => {
  try {
    let path = ADMIN_ENDPOINTS.deleteUser
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        id: String(id),
      })
    }
    const response = await http.delete(path)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editUser = async (id: number, body: UserInput) => {
  try {
    let path = ADMIN_ENDPOINTS.editUser
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

const getAllMusic = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allMusic)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getPageableUsers, createUser, deleteUser, editUser, getAllRoles, getAllMovies, getAllSeries, getAllGames, getAllMusic }
