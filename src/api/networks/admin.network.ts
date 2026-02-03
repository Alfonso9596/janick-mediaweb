import { http } from '@/api/http'

const ADMIN_ENDPOINTS = {
  allUsers: '/admin/users',
  userById: '/admin/users/:id',
  deleteUser: '/admin/users/:id',
  allMovies: '/admin/movies',
  allSeries: '/admin/series',
  allGames: '/admin/games',
}

const getAllMovies = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allMovies)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getAllSeries = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allSeries)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

const getAllGames = async () => {
  try {
    const response = await http.get(ADMIN_ENDPOINTS.allGames)
    return response?.data
  } catch (e) {
    console.error(e)
    return false
  }
}

export { getAllMovies, getAllSeries, getAllGames }
