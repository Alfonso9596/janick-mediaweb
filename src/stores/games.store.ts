import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export enum GAMES_KEYS {
  GAMES_PAGE = 'GAMES_PAGE',
  GAMES_PAGE_SIZE = 'GAMES_PAGE_SIZE',
  GAMES_SORT_BY = 'GAMES_SORT_BY',
  GAMES_SORT_DIR = 'GAMES_SORT_DIR',
}

export const useGameStore = defineStore('games', () => {
  const gamesPage: Ref<number> = ref(Number(localStorage.getItem(GAMES_KEYS.GAMES_PAGE) ?? '0'))

  function setGamesPage(page: number): void {
    localStorage.setItem(GAMES_KEYS.GAMES_PAGE, String(page))
    gamesPage.value = page
  }

  const gamesPageSize: Ref<number> = ref(
    Number(localStorage.getItem(GAMES_KEYS.GAMES_PAGE_SIZE) ?? '10'),
  )

  function setGamesPageSize(pageSize: number): void {
    localStorage.setItem(GAMES_KEYS.GAMES_PAGE_SIZE, String(pageSize))
    gamesPageSize.value = pageSize
  }

  const gamesSortBy: Ref<string> = ref(
    String(localStorage.getItem(GAMES_KEYS.GAMES_SORT_BY) ?? 'id'),
  )

  function setGamesSortBy(sortBy: string): void {
    localStorage.setItem(GAMES_KEYS.GAMES_SORT_BY, sortBy)
    gamesSortBy.value = sortBy
  }

  const gamesSortDir: Ref<string> = ref(
    String(localStorage.getItem(GAMES_KEYS.GAMES_SORT_DIR) ?? 'asc'),
  )

  function setGamesSortDir(sortDir: string): void {
    localStorage.setItem(GAMES_KEYS.GAMES_SORT_DIR, sortDir)
    gamesSortDir.value = sortDir
  }

  return {
    gamesPage,
    setGamesPage,
    gamesPageSize,
    setGamesPageSize,
    gamesSortBy,
    setGamesSortBy,
    gamesSortDir,
    setGamesSortDir,
  }
})
