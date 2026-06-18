import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { SeriesInput } from '@/types/common'

const SERIES_ENDPOINTS = {
  pageableSeries: '/series',
  seriesById: '/series/:id',
  createSeries: '/series',
  editSeries: '/series/:id',
  seriesFiles: '/series/:id/files',
  addRating: '/series/rating',
}

const getPageableSeries = async (params?: Record<string, string | string[]>) => {
  try {
    let path = SERIES_ENDPOINTS.pageableSeries
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

const getSeriesById = async (id: string) => {
  try {
    let path = SERIES_ENDPOINTS.seriesById
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

const createNewSeries = async (body: SeriesInput) => {
  try {
    const response = await http.post(SERIES_ENDPOINTS.createSeries, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editSeries = async (id: number, body: SeriesInput) => {
  try {
    let path = SERIES_ENDPOINTS.editSeries
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

const getSeriesFiles = async (id: string) => {
  try {
    let path = SERIES_ENDPOINTS.seriesFiles
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
    const response = await http.post(SERIES_ENDPOINTS.addRating, {
      id,
      rating,
    })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getPageableSeries, getSeriesById, createNewSeries, editSeries, getSeriesFiles, addRating, SERIES_ENDPOINTS }
export default { getPageableSeries }
