import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { MusicInput } from '@/types/common'

const MUSIC_ENDPOINTS = {
  pageableMusic: '/music',
  musicById: '/music/:id',
  createMusic: '/music',
  deleteMusic: '/music/:id',
  editMusic: '/music/:id',
  musicFiles: '/music/:id/files',
  addRating: '/music/rating',
}

const getPageableMusic = async (params?: Record<string, string | string[]>) => {
  try {
    let path = MUSIC_ENDPOINTS.pageableMusic
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

const getMusicById = async (id: string) => {
  try {
    let path = MUSIC_ENDPOINTS.musicById
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

const createNewMusic = async (body: MusicInput) => {
  try {
    const response = await http.post(MUSIC_ENDPOINTS.createMusic, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const deleteMusic = async (id: number) => {
  try {
    let path = MUSIC_ENDPOINTS.deleteMusic
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

const editMusic = async (id: number, body: MusicInput) => {
  try {
    let path = MUSIC_ENDPOINTS.editMusic
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

const getMusicFiles = async (id: string) => {
  try {
    let path = MUSIC_ENDPOINTS.musicFiles
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
    const response = await http.post(MUSIC_ENDPOINTS.addRating, {
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
  getPageableMusic,
  getMusicById,
  createNewMusic,
  deleteMusic,
  editMusic,
  getMusicFiles,
  addRating,
  MUSIC_ENDPOINTS,
}
export default { getPageableMusic }
