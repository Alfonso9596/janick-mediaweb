import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export enum RECIPES_KEYS {
  RECIPES_PAGE = 'RECIPES_PAGE',
  RECIPES_PAGE_SIZE = 'RECIPES_PAGE_SIZE',
  RECIPES_SORT_BY = 'RECIPES_SORT_BY',
  RECIPES_SORT_DIR = 'RECIPES_SORT_DIR'
}

export const useRecipeStore = defineStore('recipes', () => {
  const recipesPage: Ref<number> = ref(
    Number(localStorage.getItem(RECIPES_KEYS.RECIPES_PAGE) ?? '0')
  )

  function setRecipesPage(page: number): void {
    localStorage.setItem(RECIPES_KEYS.RECIPES_PAGE, String(page))
    recipesPage.value = page
  }

  const recipesPageSize: Ref<number> = ref(
    Number(localStorage.getItem(RECIPES_KEYS.RECIPES_PAGE_SIZE) ?? '10')
  )

  function setRecipesPageSize(pageSize: number): void {
    localStorage.setItem(RECIPES_KEYS.RECIPES_PAGE_SIZE, String(pageSize))
    recipesPageSize.value = pageSize
  }

  const recipesSortBy: Ref<string> = ref(
    String(localStorage.getItem(RECIPES_KEYS.RECIPES_SORT_BY) ?? 'id')
  )

  function setRecipesSortBy(sortBy: string): void {
    localStorage.setItem(RECIPES_KEYS.RECIPES_SORT_BY, sortBy)
    recipesSortBy.value = sortBy
  }

  const recipesSortDir: Ref<string> = ref(
    String(localStorage.getItem(RECIPES_KEYS.RECIPES_SORT_DIR) ?? 'asc')
  )

  function setRecipesSortDir(sortDir: string): void {
    localStorage.setItem(RECIPES_KEYS.RECIPES_SORT_DIR, sortDir)
    recipesSortDir.value = sortDir
  }

  return {
    recipesPage,
    setRecipesPage,
    recipesPageSize,
    setRecipesPageSize,
    recipesSortBy,
    setRecipesSortBy,
    recipesSortDir,
    setRecipesSortDir
  }
})
