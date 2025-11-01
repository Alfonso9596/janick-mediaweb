import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export enum SERIES_KEYS {
  SERIES_PAGE = 'SERIES_PAGE',
  SERIES_PAGE_SIZE = 'SERIES_PAGE_SIZE',
  SERIES_SORT_BY = 'SERIES_SORT_BY',
  SERIES_SORT_DIR = 'SERIES_SORT_DIR',
}

export const useSeriesStore = defineStore('series', () => {
  const seriesPage: Ref<number> = ref(Number(localStorage.getItem(SERIES_KEYS.SERIES_PAGE) ?? '0'))

  function setSeriesPage(page: number): void {
    localStorage.setItem(SERIES_KEYS.SERIES_PAGE, String(page))
    seriesPage.value = page
  }

  const seriesPageSize: Ref<number> = ref(
    Number(localStorage.getItem(SERIES_KEYS.SERIES_PAGE_SIZE) ?? '10'),
  )

  function setSeriesPageSize(pageSize: number): void {
    localStorage.setItem(SERIES_KEYS.SERIES_PAGE_SIZE, String(pageSize))
    seriesPageSize.value = pageSize
  }

  const seriesSortBy: Ref<string> = ref(
    String(localStorage.getItem(SERIES_KEYS.SERIES_SORT_BY) ?? 'id'),
  )

  function setSeriesSortBy(sortBy: string): void {
    localStorage.setItem(SERIES_KEYS.SERIES_SORT_BY, sortBy)
    seriesSortBy.value = sortBy
  }

  const seriesSortDir: Ref<string> = ref(
    String(localStorage.getItem(SERIES_KEYS.SERIES_SORT_DIR) ?? 'asc'),
  )

  function setSeriesSortDir(sortDir: string): void {
    localStorage.setItem(SERIES_KEYS.SERIES_SORT_DIR, sortDir)
    seriesSortDir.value = sortDir
  }

  return {
    seriesPage,
    setSeriesPage,
    seriesPageSize,
    setSeriesPageSize,
    seriesSortBy,
    setSeriesSortBy,
    seriesSortDir,
    setSeriesSortDir,
  }
})
