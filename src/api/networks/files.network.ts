import { httpForm } from '@/api/http'
import { getParamsFromPath, getPathWithParams } from '@/helpers/url.helper'

const FILES_ENDPOINTS = {
  uploadPoster: '/files/uploadPoster?mediaType=:mediaType',
}

const uploadNewPoster = async (file: File, mediaType: string, title: string, year: string) => {
  try {
    let path = FILES_ENDPOINTS.uploadPoster
    if (getParamsFromPath(path)?.length) {
      path = getPathWithParams(path, {
        mediaType,
      })
    }
    const formData = new FormData()

    formData.append('filename', title)
    formData.append('year', year)
    formData.append('file', file)

    const response = await httpForm.post(path, formData)
    return response
  } catch (e) {
    console.error(e)
    return false
  }
}

export { uploadNewPoster, FILES_ENDPOINTS }
export default { uploadNewPoster }
