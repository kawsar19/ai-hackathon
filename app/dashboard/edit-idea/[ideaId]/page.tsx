"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Lightbulb,
  FileText,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react"
import { uploadToCloudinary } from '@/lib/cloudinary-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const categories = [
  "Business Intelligence",
  "Customer Service",
  "Document Processing",
  "Productivity Tools",
  "Development Tools",
  "Marketing Automation",
  "Data Analytics",
  "Mobile Applications",
  "Web Applications",
  "Desktop Applications",
  "E-commerce Solutions",
  "Healthcare Technology",
  "Education Technology",
  "Financial Technology",
  "Social Media Tools",
  "Content Management",
  "Project Management",
  "Human Resources",
  "Supply Chain Management",
  "IoT Solutions",
  "Blockchain Applications",
  "Machine Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Robotics",
  "Gaming Applications",
  "Entertainment Platforms",
  "Travel & Tourism",
  "Real Estate",
  "Agriculture Technology",
  "Environmental Solutions",
  "Security & Privacy",
  "Communication Tools",
  "Collaboration Platforms",
  "Automation Tools",
  "Quality Assurance",
  "Testing Frameworks",
  "DevOps Solutions",
  "Cloud Computing",
  "Microservices",
  "API Development",
  "Database Management",
  "Backup & Recovery",
  "Monitoring & Analytics",
  "Performance Optimization",
  "Scalability Solutions",
  "Others",
]

const techStackOptions: Record<string, string[]> = {
  "Frontend": [
    "React",
    "Vue.js",
    "Angular",
    "Next.js",
    "Nuxt.js",
    "Svelte",
    "TypeScript",
    "JavaScript",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
    "Bootstrap",
    "Material-UI",
    "Chakra UI",
    "Ant Design",
    "Redux",
    "Zustand",
    "GraphQL",
    "Apollo Client",
    "Webpack",
    "Vite",
    "Parcel",
  ],
  "Backend": [
    "Node.js",
    "Express",
    "Fastify",
    "Python",
    "Django",
    "Flask",
    "FastAPI",
    "Java",
    "Spring Boot",
    "C#",
    ".NET",
    "ASP.NET Core",
    "Go",
    "Gin",
    "Echo",
    "PHP",
    "Laravel",
    "Symfony",
    "Ruby",
    "Ruby on Rails",
    "Rust",
    "Actix",
    "Rocket",
  ],
  "Database": [
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "Redis",
    "Elasticsearch",
    "Cassandra",
    "DynamoDB",
    "Firebase",
    "Supabase",
    "Prisma",
    "Sequelize",
    "TypeORM",
    "Mongoose",
  ],
  "AI/ML": [
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "OpenAI API",
    "Hugging Face",
    "LangChain",
    "Pandas",
    "NumPy",
    "Keras",
    "OpenCV",
    "NLTK",
    "spaCy",
    "Transformers",
    "Jupyter",
    "MLflow",
  ],
  "DevOps & Cloud": [
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Google Cloud",
    "Vercel",
    "Netlify",
    "Heroku",
    "DigitalOcean",
    "Linode",
    "Terraform",
    "Ansible",
    "Jenkins",
    "GitHub Actions",
    "GitLab CI",
    "Nginx",
    "Apache",
  ],
  "Mobile": [
    "React Native",
    "Flutter",
    "Ionic",
    "Xamarin",
    "Swift",
    "Kotlin",
    "Java (Android)",
    "Objective-C",
    "Expo",
    "Cordova",
    "PhoneGap",
  ],
  "Other": [
    "WebRTC",
    "Socket.io",
    "WebSockets",
    "REST API",
    "GraphQL",
    "Microservices",
    "Serverless",
    "Blockchain",
    "Web3",
    "Ethereum",
    "Solidity",
    "IPFS",
  ],
}

export default function EditIdeaPage() {
  const params = useParams()
  const router = useRouter()
  const ideaId = params.ideaId as string

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    problemStatement: "",
    solution: "",
    targetAudience: "",
    techStack: [],
    expectedOutcome: "",
    timeline: "",
    resources: "",
    attachments: [],
    attachmentUrls: [], // Store uploaded URLs
    githubUrl: "",
    demoUrl: "",
  })

  const [existingAttachments, setExistingAttachments] = useState<string[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchIdea()
  }, [ideaId])

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch idea')
      }
      
      const data = await response.json()
      const idea = data.idea
      
      setFormData({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        problemStatement: idea.problemStatement,
        solution: idea.solution,
        targetAudience: idea.targetAudience || "",
        techStack: idea.techStack || [],
        expectedOutcome: idea.expectedOutcome || "",
        timeline: idea.timeline || "",
        resources: idea.resources || "",
        attachments: [],
        attachmentUrls: [],
        githubUrl: idea.githubUrl || "",
        demoUrl: idea.demoUrl || "",
      })
      
      setExistingAttachments(idea.attachments || [])
    } catch (error) {
      console.error('Error fetching idea:', error)
      setErrors({ fetch: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleTechStackToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check if all files are images
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const invalidFiles = files.filter(file => !imageTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setErrors({ upload: 'Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed.' })
      return
    }

    setUploadingFiles(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        const url = await uploadToCloudinary(file)
        uploadedUrls.push(url)
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
        attachmentUrls: [...(prev.attachmentUrls || []), ...uploadedUrls]
      }))
      
      // Clear any previous upload errors
      if (errors.upload) {
        setErrors(prev => ({ ...prev, upload: "" }))
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      setErrors({ upload: 'Failed to upload some files. Please try again.' })
    } finally {
      setUploadingFiles(false)
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
      attachmentUrls: (prev.attachmentUrls || []).filter((_, i) => i !== index)
    }))
  }

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Project title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.problemStatement.trim()) newErrors.problemStatement = "Problem statement is required"
    if (!formData.solution.trim()) newErrors.solution = "Solution is required"
    if (formData.techStack.length === 0) newErrors.techStack = "At least one technology is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          problemStatement: formData.problemStatement,
          solution: formData.solution,
          targetAudience: formData.targetAudience,
          techStack: formData.techStack,
          expectedOutcome: formData.expectedOutcome,
          timeline: formData.timeline,
          resources: formData.resources,
          attachments: [...existingAttachments, ...(formData.attachmentUrls || [])], // Combine existing and new URLs
          // Intentionally omit githubUrl and demoUrl here so API performs a full idea update
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update idea')
      }

      const data = await response.json()
      setIsSubmitting(false)
      setSubmitSuccess(true)
      
    } catch (error) {
      console.error('Error updating idea:', error)
      setIsSubmitting(false)
      setErrors({ submit: error.message })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading idea...</span>
        </div>
      </div>
    )
  }

  if (errors.fetch) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Idea</h3>
            <div className="mt-2 text-sm text-red-700">
              {errors.fetch}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Idea Updated Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your idea "{formData.title}" has been updated successfully.
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/my-ideas')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Ideas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Your Idea</h1>
          </div>
        </div>
        <p className="text-gray-600">
          Update your idea details. Make sure to provide comprehensive information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your project title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className={`w-full ${
                  errors.category ? "border-red-300" : "border-gray-300"
                }`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe your project in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem & Solution</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Statement *
              </label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => handleInputChange("problemStatement", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.problemStatement ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="What problem does your project solve?"
              />
              {errors.problemStatement && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.problemStatement}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Solution *
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => handleInputChange("solution", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.solution ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="How does your project solve this problem?"
              />
              {errors.solution && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.solution}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Who will benefit from your solution?"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technology Stack *
              </label>
              <div className="space-y-4">
                {Object.entries(techStackOptions).map(([category, technologies]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {technologies.map((tech) => (
                        <label key={tech} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.techStack.includes(tech)}
                            onChange={() => handleTechStackToggle(tech)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{tech}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.techStack && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.techStack}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Timeline
                </label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange("timeline", value)}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                    <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                    <SelectItem value="5-6 weeks">5-6 weeks</SelectItem>
                    <SelectItem value="More than 6 weeks">More than 6 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Resources
                </label>
                <input
                  type="text"
                  value={formData.resources}
                  onChange={(e) => handleInputChange("resources", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What resources do you need?"
                />
              </div>
            </div>

            {/* Project Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => handleInputChange("demoUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-project-demo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Outcome
              </label>
              <textarea
                value={formData.expectedOutcome}
                onChange={(e) => handleInputChange("expectedOutcome", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What do you expect to achieve with this project?"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
          
          <div className="space-y-4">
            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Files:</h4>
                <div className="space-y-2">
                  {existingAttachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {url.split('/').pop()}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadingFiles ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-600">Uploading images...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop images here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Supported formats: JPEG, PNG, GIF, WebP, SVG
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={uploadingFiles}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer ${
                        uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Choose Files
                    </label>
                  </>
                )}
              </div>
              {errors.upload && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.upload}
                </p>
              )}
            </div>

            {formData.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">New Files:</h4>
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Update Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {errors.submit}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Idea</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
