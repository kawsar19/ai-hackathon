import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with your actual credentials
// Replace these with your real Cloudinary credentials from the dashboard
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name-here',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key-here',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret-here',
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name-here') {
      // Fallback to mock upload if Cloudinary not configured
      const mockUrl = `https://via.placeholder.com/300x200/0066cc/ffffff?text=${encodeURIComponent(file.name)}`
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json({ 
        success: true, 
        url: mockUrl,
        message: 'File uploaded successfully (mock - configure Cloudinary for real uploads)'
      })
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
      url: result.secure_url,
      message: 'File uploaded successfully to Cloudinary'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error.message 
    }, { status: 500 })
  }
}
