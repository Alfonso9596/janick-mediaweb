import { httpForm } from '@/api/http'
import { getParamsFromPath, getPathWithParams } from '@/helpers/url.helper'
import type { AxiosRequestConfig } from 'axios'

const FILES_ENDPOINTS = {
  uploadPoster: '/files/uploadPoster?mediaType=:mediaType',
  uploadFile: '/files?mediaType=:mediaType'
}

const uploadNewPoster = async (file: File, mediaType: string, title: string, artist: string, year: string) => {
  try {
    let path = FILES_ENDPOINTS.uploadPoster
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        mediaType,
      })
    }
    const formData = new FormData()

    formData.append('filename', title)
    formData.append('artist', artist)
    formData.append('year', year)
    formData.append('file', file)

    const response = await httpForm.post(path, formData)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

const uploadFile = async (file: File, mediaType: string, mediaId: number, config?: AxiosRequestConfig) => {
  let path = FILES_ENDPOINTS.uploadFile
  if (getParamsFromPath(path)?.length) {
    path = getPathWithParams(path, {
      mediaType
    })
  }
  const formData = new FormData()

  formData.append('mediaId', String(mediaId))
  formData.append('file', file)

  let response = null
  if (config) {
    response = await httpForm.post(path, formData, config)
  } else {
    response = await httpForm.post(path, formData)
  }
  return response
}

export { uploadNewPoster, uploadFile, FILES_ENDPOINTS }
export default { uploadNewPoster }
