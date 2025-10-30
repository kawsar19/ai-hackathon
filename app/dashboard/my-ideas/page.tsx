"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Edit,
  Eye,
  Trash2,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  ExternalLink,
  Loader2,
  Save,
  X,
  Github,
  Globe,
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
  score?: number
  feedback?: string
  githubUrl?: string
  demoUrl?: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string
  }
}

export default function MyIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null)
  
  // Project update state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [projectData, setProjectData] = useState({
    githubUrl: '',
    demoUrl: '',
    progress: 0,
    status: ''
  })
  const [isUpdatingProject, setIsUpdatingProject] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ideas')
      
      if (!response.ok) {
        throw new Error('Failed to fetch ideas')
      }
      
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(ideaId)
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete idea')
      }

      // Remove the idea from the local state
      setIdeas(ideas.filter(idea => idea.id !== ideaId))
      
      // Reload page after successful deletion to show updated state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error deleting idea:', error)
      alert('Failed to delete idea. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const openProjectUpdate = (idea: Idea) => {
    setEditingProjectId(idea.id)
    setProjectData({
      githubUrl: idea.githubUrl || '',
      demoUrl: idea.demoUrl || '',
      progress: idea.progress,
      status: idea.status
    })
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const closeProjectUpdate = () => {
    setEditingProjectId(null)
    setProjectData({
      githubUrl: '',
      demoUrl: '',
      progress: 0,
      status: ''
    })
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const handleProjectUpdate = async () => {
    if (!editingProjectId) return

    try {
      setIsUpdatingProject(true)
      setUpdateError(null)

      const response = await fetch(`/api/ideas/${editingProjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUrl: projectData.githubUrl,
          demoUrl: projectData.demoUrl,
          progress: projectData.progress,
          status: projectData.status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }

      // Update the idea in the local state
      setIdeas(ideas.map(idea => 
        idea.id === editingProjectId 
          ? { 
              ...idea, 
              githubUrl: projectData.githubUrl,
              demoUrl: projectData.demoUrl,
              progress: projectData.progress,
              status: projectData.status,
            }
          : idea
      ))

      setUpdateSuccess(true)
      setTimeout(() => {
        closeProjectUpdate()
      }, 2000)
    } catch (error) {
      console.error('Error updating project:', error)
      setUpdateError(error.message)
    } finally {
      setIsUpdatingProject(false)
    }
  }

  const filteredIdeas = ideas.filter(idea => 
    filterStatus === "all" || idea.status === filterStatus
  )

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "progress":
        return b.progress - a.progress
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "PENDING":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "COMPLETED":
        return <Award className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your ideas...</span>
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
            <h3 className="text-sm font-medium text-red-800">Error Loading Ideas</h3>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-1">Manage and track your submitted project ideas</p>
        </div>
        {ideas.length < 2 && (
          <button 
            onClick={() => window.location.href = '/dashboard/submit-idea'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Submit New Idea</span>
          </button>
        )}
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="progress">Sort by Progress</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {sortedIdeas.length} of {ideas.length} ideas
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{ideas.length}</div>
            <div className="text-sm text-gray-600">Total Ideas</div>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-6">
        {sortedIdeas.map((idea) => (
          <div key={idea.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mr-3">{idea.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                    {idea.score && (
                      <div className="ml-3 flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className={`text-sm font-medium ${getScoreColor(idea.score)}`}>
                          {idea.score}/10
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{idea.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{idea.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{new Date(idea.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{new Date(idea.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{idea.progress}% Complete</span>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {idea.techStack.map((tech, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{idea.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(idea.progress)}`}
                        style={{ width: `${idea.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Attachments */}
                  {idea.attachments && idea.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {idea.attachments.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {url.split('/').pop()}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center space-x-4 mb-4">
                    {idea.githubUrl && (
                      <a
                        href={idea.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        GitHub
                      </a>
                    )}
                    {idea.demoUrl && (
                      <a
                        href={idea.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Live Demo
                      </a>
                    )}
                  </div>

                  {/* Feedback */}
                  {idea.feedback && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback</h4>
                      <p className="text-sm text-gray-600">{idea.feedback}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {idea.status === "IN_PROGRESS" && (
                    <button 
                      onClick={() => openProjectUpdate(idea)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Update Project"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => window.location.href = `/dashboard/edit-idea/${idea.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Edit Idea"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewingIdea(idea)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteIdea(idea.id)}
                    disabled={deletingId === idea.id}
                    className={`p-2 text-gray-400 hover:text-red-600 ${
                      deletingId === idea.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Delete Idea"
                  >
                    {deletingId === idea.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedIdeas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === "all" 
              ? "You haven't submitted any ideas yet." 
              : `No ideas with status "${filterStatus}" found.`
            }
          </p>
          {ideas.length < 2 && (
            <button 
              onClick={() => window.location.href = '/dashboard/submit-idea'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Your First Idea
            </button>
          )}
        </div>
      )}

      {/* Project Update Modal */}
      {editingProjectId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Update Project Details</h3>
                <button
                  onClick={closeProjectUpdate}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Success Message */}
              {updateSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-800">Project updated successfully!</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {updateError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800">{updateError}</p>
                  </div>
                </div>
              )}

              {/* Update Form */}
              <div className="space-y-4">
                {/* GitHub URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Github className="h-4 w-4 inline mr-1" />
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={projectData.githubUrl}
                    onChange={(e) => setProjectData({...projectData, githubUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repository"
                  />
                </div>

                {/* Demo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={projectData.demoUrl}
                    onChange={(e) => setProjectData({...projectData, demoUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-project-demo.com"
                  />
                </div>

                {/* Progress */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projectData.progress}
                    onChange={(e) => setProjectData({...projectData, progress: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={projectData.status}
                    onChange={(e) => setProjectData({...projectData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeProjectUpdate}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProjectUpdate}
                    disabled={isUpdatingProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isUpdatingProject ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Idea Modal */}
      {viewingIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-xl rounded-lg bg-white">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{viewingIdea.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingIdea.status)}`}>
                    {viewingIdea.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Category: {viewingIdea.category}</p>
              </div>
              <button
                onClick={() => setViewingIdea(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  Submitted: {new Date(viewingIdea.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  Updated: {new Date(viewingIdea.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                  Progress: {viewingIdea.progress}%
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(viewingIdea.progress)}`}
                    style={{ width: `${viewingIdea.progress}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{viewingIdea.description}</p>
              </div>

              {/* Problem & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Problem Statement</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{viewingIdea.problemStatement}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Proposed Solution</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{viewingIdea.solution}</p>
                </div>
              </div>

              {/* Tech Stack */}
              {viewingIdea.techStack?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingIdea.techStack.map((tech, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Gallery */}
              {viewingIdea.attachments?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {viewingIdea.attachments.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group block">
                        <div className="aspect-video w-full overflow-hidden rounded border border-gray-200 bg-gray-50">
                          <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover group-hover:opacity-90" />
                        </div>
                        <div className="mt-1 text-xs text-gray-600 truncate flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {url.split('/').pop()}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(viewingIdea.githubUrl || viewingIdea.demoUrl) && (
                <div className="flex items-center gap-4">
                  {viewingIdea.githubUrl && (
                    <a href={viewingIdea.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> GitHub
                    </a>
                  )}
                  {viewingIdea.demoUrl && (
                    <a href={viewingIdea.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-green-600 hover:text-green-800 text-sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Live Demo
                    </a>
                  )}
                </div>
              )}

              {/* Feedback */}
              {viewingIdea.feedback && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback</h4>
                  <p className="text-sm text-gray-700">{viewingIdea.feedback}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button
                onClick={() => setViewingIdea(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingIdea(null)
                  window.location.href = `/dashboard/edit-idea/${viewingIdea.id}`
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
