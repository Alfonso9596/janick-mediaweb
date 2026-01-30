import http from './http'
import { useAuthStore } from '@/stores/auth.store'
import { AUTHENTICATION_ENDPOINTS } from './networks/authentication.network'
import { globalRouter } from './globalRouter'

const isLoginRequest = (url?: string) => AUTHENTICATION_ENDPOINTS.loginRequest === String(url)
const isRegisterRequest = (url?: string) => AUTHENTICATION_ENDPOINTS.registerRequest === String(url)
const isRefreshTokenRequest = (url?: string) =>
  AUTHENTICATION_ENDPOINTS.refreshTokenRequest === String(url)

function httpInterceptor() {
  http.interceptors.request.use(async (config) => {
    const controller = new AbortController()
    const { url } = config
    if (isLoginRequest(url) || isRegisterRequest(url) || isRefreshTokenRequest(url)) {
      return {
        ...config,
      }
    }

    const authStore = useAuthStore()
    if (!isRefreshTokenRequest(url)) {
      const isUserTokenValid = await authStore.isAuthenticatedAsync()
      if (!isUserTokenValid && !isRefreshTokenRequest(url)) {
        controller.abort()
      }
    }
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
    return {
      ...config,
      signal: controller.signal,
    }
  })
  http.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      const authStore = useAuthStore()
      const { status } = error.response || {}
      if (status === 401 || status === 403) {
        authStore.logout()
        globalRouter.router?.push('/')
      }
      return Promise.reject(error)
    },
  )
}

export { httpInterceptor }
