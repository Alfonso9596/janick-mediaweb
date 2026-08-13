import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export enum MUSIC_KEYS {
  MUSIC_PAGE = 'MUSIC_PAGE',
  MUSIC_PAGE_SIZE = 'MUSIC_PAGE_SIZE',
  MUSIC_SORT_BY = 'MUSIC_SORT_BY',
  MUSIC_SORT_DIR = 'MUSIC_SORT_DIR',
}

export const useMusicStore = defineStore('music', () => {
  const musicPage: Ref<number> = ref(Number(localStorage.getItem(MUSIC_KEYS.MUSIC_PAGE) ?? '0'))

  function setMusicPage(page: number): void {
    localStorage.setItem(MUSIC_KEYS.MUSIC_PAGE, String(page))
    musicPage.value = page
  }

  const musicPageSize: Ref<number> = ref(
    Number(localStorage.getItem(MUSIC_KEYS.MUSIC_PAGE_SIZE) ?? '10'),
  )

  function setMusicPageSize(pageSize: number): void {
    localStorage.setItem(MUSIC_KEYS.MUSIC_PAGE_SIZE, String(pageSize))
    musicPageSize.value = pageSize
  }

  const musicSortBy: Ref<string> = ref(
    String(localStorage.getItem(MUSIC_KEYS.MUSIC_SORT_BY) ?? 'id'),
  )

  function setMusicSortBy(sortBy: string): void {
    localStorage.setItem(MUSIC_KEYS.MUSIC_SORT_BY, sortBy)
    musicSortBy.value = sortBy
  }

  const musicSortDir: Ref<string> = ref(
    String(localStorage.getItem(MUSIC_KEYS.MUSIC_SORT_DIR) ?? 'asc'),
  )

  function setMusicSortDir(sortDir: string): void {
    localStorage.setItem(MUSIC_KEYS.MUSIC_SORT_DIR, sortDir)
    musicSortDir.value = sortDir
  }

  return {
    musicPage,
    setMusicPage,
    musicPageSize,
    setMusicPageSize,
    musicSortBy,
    setMusicSortBy,
    musicSortDir,
    setMusicSortDir,
  }
})
