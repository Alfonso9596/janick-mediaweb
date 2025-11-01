import axios from 'axios'
import type { AxiosInstance } from 'axios'
const http: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const httpForm: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

export { http, httpForm }
export default http
