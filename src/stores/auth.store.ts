import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import AuthenticationNetwork from '@/api/networks/authentication.network'

enum AUTH_KEYS {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  USER = 'USER',
  ROLES = 'ROLES',
}

const parseJwt = (token: string | undefined) => {
  if (!token) {
    return
  }
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/')
  const jsonPayload = decodeURIComponent(
    globalThis
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.codePointAt(0)!.toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

async function register(username: string | undefined, password: string | undefined) {
  if (!username || !password) {
    return false
  }
  const response = await AuthenticationNetwork.registerReqeust(username, password)
  if (!response) {
    return false
  }

  return true
}

async function changePassword(currentPassword: string, newPassword: string) {
  if (!currentPassword || !newPassword) {
    return false
  }
  const response = await AuthenticationNetwork.changePasswordRequest(currentPassword, newPassword)
  if (!response) {
    return false
  }

  return true
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken: Ref<string | undefined> = ref(
    localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN) || undefined,
  )
  const refreshToken: Ref<string | undefined> = ref(
    localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN) || undefined,
  )
  const user: Ref<string | undefined> = ref(localStorage.getItem(AUTH_KEYS.USER) || undefined)
  const roles: Ref<string[] | undefined> = ref(
    localStorage.getItem(AUTH_KEYS.ROLES)?.split(',') || undefined,
  )

  const decodedToken: Ref<Record<string, unknown> | undefined> = ref(parseJwt(accessToken.value))
  const decodedRefreshToken: Ref<Record<string, unknown> | undefined> = ref(
    parseJwt(refreshToken.value),
  )

  async function isAuthenticatedAsync() {
    if (!accessToken.value && !refreshToken.value) {
      await logout()
      return false
    }

    if (isTokenValid(decodedToken.value)) {
      return true
    }

    const response = await fetchRefreshToken()
    if (!response) {
      await logout()
    }
    return response
  }

  const hasRole = (role: string) => {
    return roles.value?.includes(role)
  }

  const hasAnyRole = (roleList: string[]) => {
    return roleList.some((role) => hasRole(role))
  }

  async function logout() {
    removeTokens()
  }

  function isUserAdmin() {
    if (!user.value) {
      return false
    }

    if (user.value && typeof user.value === 'string') {
      const userData = JSON.parse(user.value)
      if (userData.roles?.includes('ADMIN')) {
        return true
      }
    }
    return false
  }

  function isTokenValid(dt: Record<string, unknown> | undefined) {
    if (!dt) {
      return false
    }
    return Date.now() < (dt.exp as number) * 1000
  }

  function setTokens(t: string, rt: string, userValue: string): void {
    if (!t || !rt) {
      return
    }
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, t)
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, rt)
    localStorage.setItem(AUTH_KEYS.USER, userValue)
    localStorage.setItem(AUTH_KEYS.ROLES, JSON.parse(userValue).roles.join(','))

    accessToken.value = t
    refreshToken.value = rt
    decodedToken.value = parseJwt(t)
    decodedRefreshToken.value = parseJwt(rt)
    user.value = userValue
    roles.value = JSON.parse(userValue).roles
  }

  function removeTokens(): void {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_KEYS.USER)
    accessToken.value = undefined
    refreshToken.value = undefined
    decodedToken.value = undefined
    decodedRefreshToken.value = undefined
    user.value = undefined
    roles.value = undefined
  }

  async function login(username: string | undefined, password: string | undefined) {
    if (!username || !password) {
      return false
    }
    const response = await AuthenticationNetwork.loginRequest(username, password)
    if (!response) {
      return false
    }

    if (response.data.accessToken) {
      setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        JSON.stringify(response.data),
      )
    }

    return true
  }

  async function fetchRefreshToken() {
    if (!isTokenValid(decodedRefreshToken.value)) {
      return false
    }
    const response = await AuthenticationNetwork.refreshTokenRequest(refreshToken.value)
    if (!response) {
      return false
    }
    setTokens(response.data.accessToken, response.data.refreshToken, JSON.stringify(response.data))
    return true
  }

  return {
    accessToken,
    refreshToken,
    decodedToken,
    decodedRefreshToken,
    user,
    roles,
    login,
    register,
    changePassword,
    logout,
    isAuthenticatedAsync,
    hasRole,
    hasAnyRole,
  }
})
