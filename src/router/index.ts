import AppLayout from '@/layout/AppLayout.vue'
import AdminLayout from '@/layout/admin/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'
import { useLayout } from '@/layout/composables/layout'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
      },
      // Data Management Routes
      {
        path: '/movies',
        name: 'Filme',
        component: () => import('@/views/movies/MoviesView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/movies/:id',
        name: 'movieDetails',
        component: () => import('@/views/movies/MoviesDetailView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/series',
        name: 'Serien',
        component: () => import('@/views/series/SeriesView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/series/:id',
        name: 'seriesDetails',
        component: () => import('@/views/series/SeriesDetailView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/games',
        name: 'Spiele',
        component: () => import('@/views/games/GamesView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/games/:id',
        name: 'gamesDetails',
        component: () => import('@/views/games/GamesDetailsView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/music',
        name: 'Musik',
        component: () => import('@/views/music/MusicView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: '/music/:id',
        name: 'musicDetails',
        component: () => import('@/views/music/MusicDetailsView.vue'),
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      }
    ],
  },
  // Administration Routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: '/admin',
        component: () => import('@/views/admin/AdminPanel.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] },
      },
      {
        path: '/admin/users/all',
        component: () => import('@/views/admin/users/AdminUsersView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] },
      },
      {
        path: '/admin/movies/genres',
        component: () => import('@/views/admin/movies/AdminMovieGenreView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] }
      },
      {
        path: '/admin/games/genres',
        component: () => import('@/views/admin/games/AdminGameGenreView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] }
      },
      {
        path: '/admin/games/platforms',
        component: () => import('@/views/admin/games/AdminGamePlatformView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] }
      },
      {
        path: '/admin/music/genres',
        component: () => import('@/views/admin/music/AdminMusicGenreView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] }
      }
    ],
  },
  // Error Pages
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/UnauthorizedPage.vue'),
  },
  {
    path: '/:notFound',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundPage.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, from, next) => {
  const { isAuthenticatedAsync, hasAnyRole } = useAuthStore()
  const { setPageLoading } = useLayout()

  setPageLoading(true)
  if (to.meta.requiresAuth && !isAuthenticatedAsync) {
    next({ name: 'Home' })
  } else if (to.meta.roles && !hasAnyRole(to.meta.roles as string[])) {
    next({ name: 'Unauthorized' })
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  const { setPageLoading } = useLayout()
  setPageLoading(false)
})

export { routes }

export default router
