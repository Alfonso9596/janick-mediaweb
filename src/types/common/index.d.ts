type MediaType = 'MOVIE' | 'SERIES' | 'GAME' | 'MUSIC' | 'RECIPE'

type User = {
  id: number
  username: string
  roles?: string[]
  enabled: boolean
}

type UserInput = {
  username?: string
  password?: string
  roles?: string[]
  isEnabled?: boolean
}

type Role = {
  id: number
  name: string
}

type RoleInput = {
  name: string
}

type FileItem = {
  key?: string
  name: string
  size: number | string
  fileType: 'FOLDER' | 'VIDEO' | 'ZIP' | 'TEXT' | string
  url?: string
  children?: FileItem[]
}

type Movie = {
  id: number
  name: string
  year: number
  posterFilepath?: string
  description?: string
  length?: number
  genres?: string[]
  ratingAmount: number
  ratingValue: number
  user?: User
}

type Series = {
  id: number
  name: string
  yearStart: number
  yearEnd?: number
  posterFilepath?: string
  description?: string
  episodeLength?: number
  genres?: string[]
  ratingAmount: number
  ratingValue: number
  user?: User
}

type Game = {
  id: number
  name: string
  year: number
  posterFilepath?: string
  description?: string
  genres?: string[]
  platforms?: string[]
  ratingAmount: number
  ratingValue: number
  user?: User
}

type Music = {
  id: number
  name: string
  artist: string
  year: number
  posterFilepath?: string
  description?: string
  genres?: string[]
  ratingAmount: number
  ratingValue: number
  user?: User
}

type Recipe = {
  id: number
  name: string
  posterFilepath?: string
  description?: string
  mealTypes?: string[]
  vegetarian: boolean
  vegan: boolean
  glutenfree: boolean
  lactosefree: boolean
  ratingAmount: number
  ratingValue: number
  user?: User
}

type MovieInput = {
  name: string
  year: number
  description?: string
  length?: number
  genres?: string[]
}

type SeriesInput = {
  name: string
  yearStart: number
  yearEnd?: number
  description?: string
  episodeLength?: number
  genres?: string[]
}

type GameInput = {
  name: string
  year: number
  description?: string
  genres?: string[]
  platforms?: string[]
}

type MusicInput = {
  name: string
  year: number
  description?: string
  genres?: string[]
}

type RecipeInput = {
  name: string
  description?: string
  mealTypes?: string[]
  vegetarian: boolean
  vegan: boolean
  glutenfree: boolean
  lactosefree: boolean
}

type Genre = {
  id: number
  name: string
}

type Platform = {
  id: number
  name: string
}

type MealType = {
  id: number
  name: string
}

type GenreInput = {
  name: string
}

type PlatformInput = {
  name: string
}

type MealTypeInput = {
  name: string
}

type ContextMenuInstance = InstanceType<typeof ContextMenu> & {
  show: (event: Event) => void
}

export { MediaType, User, UserInput, Role, RoleInput, FileItem, Movie, Series, Game, Music, Recipe, MovieInput, SeriesInput, GameInput, MusicInput, RecipeInput, Genre, Platform, MealType, GenreInput, PlatformInput, MealTypeInput, ContextMenuInstance }
