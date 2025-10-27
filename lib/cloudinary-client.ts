// Client-side Cloudinary upload function using server-side API
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Upload error:', errorData)
      throw new Error('Failed to upload file')
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('Failed to upload file')
  }
}
