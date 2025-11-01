import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import AuthenticationNetwork from '@/api/networks/authentication.network'

enum AUTH_KEYS {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

const parseJwt = (token: string | undefined) => {
  if (!token) {
    return
  }
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken: Ref<string | undefined> = ref(
    localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN) || undefined,
  )
  const refreshToken: Ref<string | undefined> = ref(
    localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN) || undefined,
  )

  const decodedToken: Ref<Record<string, unknown> | undefined> = ref(parseJwt(accessToken.value))
  const decodedRefreshToken: Ref<Record<string, unknown> | undefined> = ref(
    parseJwt(refreshToken.value),
  )

  const getDecodedToken = computed(() => {
    return decodedToken.value
  })

  async function isAuthenticatedAsync() {
    if (!accessToken.value && !refreshToken.value) {
      await logout()
      return false
    } else if (!isTokenValid(decodedToken.value)) {
      const response = await fetchRefreshToken()
      if (!response) {
        await logout()
      }
      return response
    } else {
      return true
    }
  }

  async function logout() {
    removeTokens()
  }

  function isTokenValid(dt: Record<string, unknown> | undefined) {
    if (!dt) {
      return false
    }
    return Date.now() < (dt.exp as number) * 1000
  }

  function setTokens(t: string, rt: string): void {
    if (!t || !rt) {
      console.error('No access token or refresh token')
      return
    }
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, t)
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, rt)

    accessToken.value = t
    refreshToken.value = rt
    decodedToken.value = parseJwt(t)
    decodedRefreshToken.value = parseJwt(rt)
  }

  function removeTokens(): void {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN)
    accessToken.value = undefined
    refreshToken.value = undefined
    decodedToken.value = undefined
    decodedRefreshToken.value = undefined
  }

  async function login(username: string | undefined, password: string | undefined) {
    if (!username || !password) {
      return false
    }
    const response = await AuthenticationNetwork.loginRequest(username, password)
    if (!response) {
      return false
    }
    return true
  }

  async function fetchRefreshToken() {
    if (!isTokenValid(decodedRefreshToken.value)) {
      return false
    }
    const response = await AuthenticationNetwork.refreshTokenRequest()
    if (!response) {
      return false
    }
  }

  return {
    accessToken,
    decodedToken,
    login,
  }
})
