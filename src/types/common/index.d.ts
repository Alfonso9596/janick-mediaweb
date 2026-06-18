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

type FileItem = {
  key?: string
  name: string
  size: number | string
  fileType: 'FOLDER' | 'VIDEO' | 'ZIP' | string
  url?: string
  children?: FileItem[]
}

type Movie = {
  id: string | number
  name: string
  year: number
  posterFilepath?: string
  description?: string
  length?: number
  genres?: string[]
  ratingAmount: number
  ratingValue: number
}

type Series = {
  id: string | number
  name: string
  yearStart: number
  yearEnd?: number
  posterFilepath?: string
  description?: string
  episodeLength?: number
  genres?: string[]
  ratingAmount: number
  ratingValue: number
}

type Game = {
  id: string | number
  name: string
  year: number
  posterFilepath?: string
  description?: string
  genres?: string[]
  platforms?: string[]
  ratingAmount: number
  ratingValue: number
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

type Genre = {
  id: number
  name: string
}

type Platform = {
  id: number
  name: string
}

export { User, UserInput, Role, FileItem, Movie, Series, Game, MovieInput, SeriesInput, GameInput, Genre, Platform }
