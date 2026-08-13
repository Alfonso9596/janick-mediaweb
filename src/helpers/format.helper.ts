export function formatSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return sizeInBytes + ' B'
  } else if (sizeInBytes < 1024 * 1024) {
    return (sizeInBytes / 1024).toFixed(2) + ' KB'
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

export function formatSpeed(speedInBytes: number) {
  if (speedInBytes < 1024) {
    return speedInBytes + ' B/s'
  } else if (speedInBytes < 1024 * 1024) {
    return (speedInBytes / 1024).toFixed(2) + ' KB/s'
  } else if (speedInBytes < 1024 * 1024 * 1024) {
    return (speedInBytes / (1024 * 1024)).toFixed(2) + ' MB/s'
  } else {
    return (speedInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB/s'
  }
}
