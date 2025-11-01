import AppLayout from '@/layout/AppLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: '/movies',
        name: 'movies',
        component: () => import('@/views/movies/MoviesView.vue'),
      },
      {
        path: '/movies/:id',
        name: 'movieDetails',
        component: () => import('@/views/movies/MoviesDetailView.vue'),
      },
      {
        path: '/series',
        name: 'series',
        component: () => import('@/views/series/SeriesView.vue'),
      },
      {
        path: '/series/:id',
        name: 'seriesDetails',
        component: () => import('@/views/series/SeriesDetailView.vue'),
      },
      {
        path: '/games',
        name: 'games',
        component: () => import('@/views/games/GamesView.vue'),
      },
      {
        path: '/games/:id',
        name: 'gamesDetails',
        component: () => import('@/views/games/GamesDetailsView.vue'),
      },
    ],
  },
]

/*const routes = [
  {
    name: 'Movies',
    label: 'Filme',
    items: [
      {
        name: 'AllMovies',
        label: 'Alle Filme',
        route: '/movies',
        component: () => import('@/views/MoviesView.vue'),
      },
      {
        name: 'BestRated',
        label: 'Best bewertet',
        route: '/movies?sort=ratingValue:desc',
      },
      {
        name: 'Genres',
        label: 'Genres',
        items: [
          {
            name: 'Action',
            label: 'Action',
            route: '/movies?genre=action',
          },
        ],
      },
    ],
  },
  {
    name: 'Series',
    label: 'Serien',
    items: [
      {
        name: 'AllSeries',
        label: 'Alle Serien',
        route: '/series',
      },
      {
        name: 'BestRated',
        label: 'Best bewertet',
        route: '/series?sort=ratingValue:desc',
      },
      {
        name: 'Genres',
        label: 'Genres',
        items: [
          {
            name: 'Action',
            label: 'Action',
            route: '/series?genre=action',
          },
        ],
      },
    ],
  },
  {
    name: 'Games',
    label: 'Spiele',
    items: [
      {
        name: 'AllGames',
        label: 'Alle Spiele',
        route: '/games',
      },
      {
        name: 'BestRated',
        label: 'Best bewertet',
        route: '/games?sort=ratingValue:desc',
      },
      {
        name: 'Genres',
        label: 'Genres',
        items: [
          {
            name: 'Action',
            label: 'Action',
            route: '/games?genre=action',
          },
        ],
      },
      {
        name: 'Platform',
        label: 'Plattform',
        items: [
          {
            name: 'PC',
            label: 'PC',
            route: '/games?platform=PC',
          },
          {
            name: 'PSP',
            label: 'PSP',
            route: '/games?platform=PSP',
          },
        ],
      },
    ],
  },
]

const homeRoute = {
  name: 'Home',
  label: 'Home',
  route: '/',
  component: () => import('@/views/HomeView.vue'),
  icon: 'pi-home',
}*/

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export { routes }

export default router
