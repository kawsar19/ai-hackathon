// Cloudinary Configuration Template
// Replace these values with your actual Cloudinary credentials

export const CLOUDINARY_CONFIG = {
  cloud_name: 'your-cloud-name', // Get this from Cloudinary dashboard
  api_key: 'your-api-key',       // Get this from Cloudinary dashboard  
  api_secret: 'your-api-secret', // Get this from Cloudinary dashboard
}

// Example usage in API route:
/*
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloud_name,
  api_key: CLOUDINARY_CONFIG.api_key,
  api_secret: CLOUDINARY_CONFIG.api_secret,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString('base64')}`,
      {
        resource_type: 'auto',
        folder: 'hackathon-ideas',
      }
    )

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file' 
    }, { status: 500 })
  }
}
*/
