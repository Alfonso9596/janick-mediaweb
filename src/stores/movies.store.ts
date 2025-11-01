import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export enum MOVIES_KEYS {
  MOVIES_PAGE = 'MOVIES_PAGE',
  MOVIES_PAGE_SIZE = 'MOVIES_PAGE_SIZE',
  MOVIES_SORT_BY = 'MOVIES_SORT_BY',
  MOVIES_SORT_DIR = 'MOVIES_SORT_DIR',
}

export const useMovieStore = defineStore('movies', () => {
  const moviesPage: Ref<number> = ref(Number(localStorage.getItem(MOVIES_KEYS.MOVIES_PAGE) ?? '0'))

  function setMoviesPage(page: number): void {
    localStorage.setItem(MOVIES_KEYS.MOVIES_PAGE, String(page))
    moviesPage.value = page
  }

  const moviesPageSize: Ref<number> = ref(
    Number(localStorage.getItem(MOVIES_KEYS.MOVIES_PAGE_SIZE) ?? '10'),
  )

  function setMoviesPageSize(pageSize: number): void {
    localStorage.setItem(MOVIES_KEYS.MOVIES_PAGE_SIZE, String(pageSize))
    moviesPageSize.value = pageSize
  }

  const moviesSortBy: Ref<string> = ref(
    String(localStorage.getItem(MOVIES_KEYS.MOVIES_SORT_BY) ?? 'id'),
  )

  function setMoviesSortBy(sortBy: string): void {
    localStorage.setItem(MOVIES_KEYS.MOVIES_SORT_BY, sortBy)
    moviesSortBy.value = sortBy
  }

  const moviesSortDir: Ref<string> = ref(
    String(localStorage.getItem(MOVIES_KEYS.MOVIES_SORT_DIR) ?? 'asc'),
  )

  function setMoviesSortDir(sortDir: string): void {
    localStorage.setItem(MOVIES_KEYS.MOVIES_SORT_DIR, sortDir)
    moviesSortDir.value = sortDir
  }

  return {
    moviesPage,
    setMoviesPage,
    moviesPageSize,
    setMoviesPageSize,
    moviesSortBy,
    setMoviesSortBy,
    moviesSortDir,
    setMoviesSortDir,
  }
})
