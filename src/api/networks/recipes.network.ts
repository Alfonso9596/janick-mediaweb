import { http } from '@/api/http'
import { getParamsFromPath, getPathWithParams, convertParamsToURL } from '@/helpers/url.helper'
import type { RecipeInput } from '@/types/common'

const RECIPES_ENDPOINTS = {
  pageableRecipes: '/recipes',
  recipeById: '/recipes/:id',
  createRecipe: '/recipes',
  deleteRecipe: '/recipes/:id',
  editRecipe: '/recipes/:id',
  recipeFiles: '/recipes/:id/files',
  addRating: '/recipes/rating',
}

const getPageableRecipes = async (params?: Record<string, string | string[]>) => {
  try {
    let path = RECIPES_ENDPOINTS.pageableRecipes
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

const getRecipeById = async (id: string) => {
  try {
    let path = RECIPES_ENDPOINTS.recipeById
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

const createNewRecipe = async (body: RecipeInput) => {
  try {
    const response = await http.post(RECIPES_ENDPOINTS.createRecipe, body)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const deleteRecipe = async (id: number) => {
  try {
    let path = RECIPES_ENDPOINTS.deleteRecipe
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

const editRecipe = async (id: number, body: RecipeInput) => {
  try {
    let path = RECIPES_ENDPOINTS.editRecipe
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

const getRecipeFiles = async (id: string) => {
  try {
    let path = RECIPES_ENDPOINTS.recipeFiles
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
    const response = await http.post(RECIPES_ENDPOINTS.addRating, {
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
  getPageableRecipes,
  getRecipeById,
  createNewRecipe,
  deleteRecipe,
  editRecipe,
  getRecipeFiles,
  addRating,
  RECIPES_ENDPOINTS
}
export default { getPageableRecipes }
