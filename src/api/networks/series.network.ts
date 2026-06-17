import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'

const SERIES_ENDPOINTS = {
  pageableSeries: '/series',
  seriesById: '/series/:id',
  createSeries: '/series',
  seriesFiles: '/series/:id/files',
  addRating: '/series/rating',
}

const getPageableSeries = async (params?: any) => {
  try {
    let path = SERIES_ENDPOINTS.pageableSeries
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

const createNewSeries = async (body: any) => {
  try {
    const response = await http.post(SERIES_ENDPOINTS.createSeries, body)
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

export { getPageableSeries, getSeriesById, createNewSeries, getSeriesFiles, addRating, SERIES_ENDPOINTS }
export default { getPageableSeries }
