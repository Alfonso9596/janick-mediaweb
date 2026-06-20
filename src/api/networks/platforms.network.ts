import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { PlatformInput } from '@/types/common'

const PLATFORMS_ENDPOINTS = {
  pageableGamePlatforms: '/platforms',
  allGamePlatforms: '/platforms/list',
  createGamePlatform: '/platforms',
  editGamePlatform: '/platforms/:id',
  deleteGamePlatform: '/platforms/:id'
}

const getPageableGamePlatforms = async (params?: Record<string, string | string[]>) => {
  try {
    let path = PLATFORMS_ENDPOINTS.pageableGamePlatforms
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

const getAllGamePlatforms = async () => {
  try {
    const response = await http.get(PLATFORMS_ENDPOINTS.allGamePlatforms)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const createGamePlatform = async (body: PlatformInput) => {
  try {
    const response = await http.post(PLATFORMS_ENDPOINTS.createGamePlatform, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editGamePlatform = async (id: number, body: PlatformInput) => {
  try {
    let path = PLATFORMS_ENDPOINTS.editGamePlatform
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

const deleteGamePlatform = async (id: number) => {
  try {
    let path = PLATFORMS_ENDPOINTS.deleteGamePlatform
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

export { getPageableGamePlatforms, getAllGamePlatforms, createGamePlatform, editGamePlatform, deleteGamePlatform }
