"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  User,
  Award,
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Save,
  MessageSquare,
} from "lucide-react"

interface Idea {
  id: string
  title: string
  description: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
  progress: number
  techStack: string[]
  problemStatement: string
  solution: string
  targetAudience: string
  expectedOutcome: string
  timeline: string
  resources: string
  attachments: string[]
  score?: number | null
  feedback?: string | null
  githubUrl?: string | null
  demoUrl?: string | null
  lastUpdated?: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string
  }
}

export default function ProjectsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Review modal state
  const [selectedProject, setSelectedProject] = useState<Idea | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: '',
    score: '',
    feedback: '',
    progress: ''
  })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/ideas')
      
      if (!response.ok) {
        throw new Error('Failed to fetch ideas')
      }
      
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (project: Idea) => {
    setSelectedProject(project)
    setReviewData({
      status: project.status,
      score: project.score?.toString() || '',
      feedback: project.feedback || '',
      progress: project.progress.toString()
    })
    setIsReviewModalOpen(true)
    setReviewError(null)
  }

  const openViewModal = (project: Idea) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const closeReviewModal = () => {
    setIsReviewModalOpen(false)
    setSelectedProject(null)
    setReviewData({
      status: '',
      score: '',
      feedback: '',
      progress: ''
    })
    setReviewError(null)
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedProject(null)
  }

  const handleReviewSubmit = async () => {
    if (!selectedProject) return

    try {
      setIsSubmittingReview(true)
      setReviewError(null)

      const response = await fetch(`/api/admin/ideas/${selectedProject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewData.status,
          score: reviewData.score ? parseFloat(reviewData.score) : null,
          feedback: reviewData.feedback,
          progress: parseInt(reviewData.progress) || 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }

      // Update the project in the local state
      setIdeas(ideas.map(idea => 
        idea.id === selectedProject.id 
          ? { 
              ...idea, 
              status: reviewData.status,
              score: reviewData.score ? parseFloat(reviewData.score) : null,
              feedback: reviewData.feedback,
              progress: parseInt(reviewData.progress) || 0,
            }
          : idea
      ))

      closeReviewModal()
    } catch (error) {
      console.error('Error updating project:', error)
      setReviewError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const filteredProjects = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${idea.user.firstName} ${idea.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || idea.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading projects...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Projects</h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
            <div className="mt-4">
              <button
                onClick={fetchIdeas}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "COMPLETED":
        return <Award className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "text-green-600 bg-green-50"
      case "REJECTED":
        return "text-red-600 bg-red-50"
      case "PENDING":
        return "text-yellow-600 bg-yellow-50"
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-50"
      case "COMPLETED":
        return "text-purple-600 bg-purple-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500"
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 text-xs">Review and manage hackathon projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{ideas.length}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {ideas.filter(p => p.status === "PENDING").length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {ideas.filter(p => p.status === "APPROVED").length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {ideas.filter(p => p.status === "IN_PROGRESS").length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {ideas.filter(p => p.status === "COMPLETED").length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Participant */}
              <div className="flex items-center mb-4">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{`${project.user.firstName} ${project.user.lastName}`}</span>
              </div>

              {/* Status and Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(project.status)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
              </div>

              {/* Category and Score */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {project.category}
                </span>
                {project.score && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className={`text-sm font-medium ${getScoreColor(project.score)}`}>
                      {project.score}/10
                    </span>
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 3).map((tech, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                      +{project.techStack.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <span className="text-xs text-gray-500">{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => openViewModal(project)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  View
                </button>
                <button 
                  onClick={() => openReviewModal(project)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    

      {/* View Modal */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted by {selectedProject.user.firstName} {selectedProject.user.lastName}
                  </p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-8 w-8" />
                </button>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                  </div>

                  {/* Problem Statement */}
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                      Problem Statement
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.problemStatement}</p>
                  </div>

                  {/* Solution */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Proposed Solution
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.solution}</p>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Target Audience
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.targetAudience}</p>
                  </div>
                </div>

                {/* Right Column - Technical Details */}
                <div className="space-y-6">
                  {/* Project Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-600" />
                      Project Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium text-gray-900">{selectedProject.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeline:</span>
                        <span className="font-medium text-gray-900">{selectedProject.timeline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProject.status)}`}>
                          {selectedProject.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(selectedProject.progress)}`}
                              style={{ width: `${selectedProject.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{selectedProject.progress}%</span>
                        </div>
                      </div>
                      {selectedProject.score && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Score:</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className={`font-medium ${getScoreColor(selectedProject.score)}`}>
                              {selectedProject.score}/10
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Technology Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expected Outcome */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-green-600" />
                      Expected Outcome
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.expectedOutcome}</p>
                  </div>

                  {/* Resources */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Required Resources
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.resources}</p>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              {(selectedProject.githubUrl || selectedProject.demoUrl) && (
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-gray-600" />
                    Project Links
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        GitHub Repository
                      </a>
                    )}
                    {selectedProject.demoUrl && (
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedProject.attachments && selectedProject.attachments.length > 0 && (
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Attachments ({selectedProject.attachments.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedProject.attachments.map((attachment, index) => (
                      <div key={index} className="relative">
                        <img
                          src={attachment}
                          alt={`Project attachment ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                          onClick={() => window.open(attachment, '_blank')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA0MEM3MS4xNjM0IDQwIDc3IDQ1LjgzNjYgNzcgNTNDNzcgNjAuMTYzNCA3MS4xNjM0IDY2IDY0IDY2QzU2LjgzNjYgNjYgNTEgNjAuMTYzNCA1MSA1M0M1MSA0NS44MzY2IDU2LjgzNjYgNDAgNjQgNDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zOCA5MEw0OCA4MEw1OCA5MEw3OCA3MEw4OCA4MFY5MEgzOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                            target.alt = 'Image failed to load';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedProject.feedback && (
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
                    Admin Feedback
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.feedback}</p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
                <button
                  onClick={closeViewModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeViewModal()
                    openReviewModal(selectedProject)
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Review Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Project</h3>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Project Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedProject.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedProject.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>{`${selectedProject.user.firstName} ${selectedProject.user.lastName}`}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedProject.category}</span>
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Score and Progress */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={reviewData.score}
                      onChange={(e) => setReviewData({...reviewData, score: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reviewData.progress}
                      onChange={(e) => setReviewData({...reviewData, progress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="75"
                    />
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide detailed feedback about the project..."
                  />
                </div>

                {/* Error Message */}
                {reviewError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{reviewError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeReviewModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
