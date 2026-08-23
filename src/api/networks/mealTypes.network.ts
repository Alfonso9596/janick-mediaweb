import http from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { MealTypeInput } from '@/types/common'

const MEAL_TYPES_ENDPOINTS = {
  pageableMealTypes: '/mealTypes',
  allMealTypes: '/mealTypes/list',
  createMealType: '/mealTypes',
  editMealType: '/mealTypes/:id',
  deleteMealType: '/mealTypes/:id'
}

const getPageableMealTypes = async (params?: Record<string, string | string[]>) => {
  try {
    let path = MEAL_TYPES_ENDPOINTS.pageableMealTypes
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

const getAllMealTypes = async () => {
  try {
    const response = await http.get(MEAL_TYPES_ENDPOINTS.allMealTypes)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const createMealType = async (body: MealTypeInput) => {
  try {
    const response = await http.post(MEAL_TYPES_ENDPOINTS.createMealType, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const editMealType = async (id: number, body: MealTypeInput) => {
  try {
    let path = MEAL_TYPES_ENDPOINTS.editMealType
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

const deleteMealType = async (id: number) => {
  try {
    let path = MEAL_TYPES_ENDPOINTS.deleteMealType
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

export { getPageableMealTypes, getAllMealTypes, createMealType, editMealType, deleteMealType }
