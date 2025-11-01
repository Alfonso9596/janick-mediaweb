import http from '@/api/http'

enum AUTHENTICATION_ENDPOINTS {
  loginRequest = '/auth/login',
  refreshTokenRequest = '/auth/refreshtoken',
}

const loginRequest = async (username: string, password: string) => {
  try {
    const response = await http.post(AUTHENTICATION_ENDPOINTS.loginRequest, {
      username,
      password,
    })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const refreshTokenRequest = async () => {
  try {
    const response = await http.post(AUTHENTICATION_ENDPOINTS.refreshTokenRequest)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export { loginRequest, refreshTokenRequest, AUTHENTICATION_ENDPOINTS }
export default { loginRequest, refreshTokenRequest }
