import AppLayout from '@/layout/AppLayout.vue'
import AdminLayout from '@/layout/admin/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'

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
    ],
  },
  // Administration Routes
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '/admin',
        component: () => import('@/views/admin/AdminPanel.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'] },
      },
    ],
  },
  // Error Pages
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/UnauthorizedPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, from, next) => {
  const { isAuthenticatedAsync, hasAnyRole } = useAuthStore()

  if (to.meta.requiresAuth && !isAuthenticatedAsync) {
    next({ name: 'Home' })
  } else if (to.meta.roles && !hasAnyRole(to.meta.roles as string[])) {
    next({ name: 'Unauthorized' })
  } else {
    next()
  }
})

export { routes }

export default router
