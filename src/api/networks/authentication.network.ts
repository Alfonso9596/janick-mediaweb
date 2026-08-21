import http from '@/api/http'

enum AUTHENTICATION_ENDPOINTS {
  loginRequest = '/auth/login',
  logoutRequest = '/auth/logout',
  registerRequest = '/auth/register',
  changePasswordRequest = '/auth/changepassword',
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

const refreshTokenRequest = async (refreshToken: string | undefined) => {
  try {
    const response = await http.post(AUTHENTICATION_ENDPOINTS.refreshTokenRequest, { refreshToken })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const logoutRequest = async () => {
  try {
    const response = await http.post(AUTHENTICATION_ENDPOINTS.logoutRequest)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const registerReqeust = async (username: string, password: string) => {
  try {
    const response = await http.post(AUTHENTICATION_ENDPOINTS.registerRequest, {
      username,
      password,
    })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const changePasswordRequest = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await http.put(AUTHENTICATION_ENDPOINTS.changePasswordRequest, {
      currentPassword,
      newPassword
    })
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export {
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
  registerReqeust,
  AUTHENTICATION_ENDPOINTS,
}
export default { loginRequest, logoutRequest, refreshTokenRequest, changePasswordRequest, registerReqeust }
