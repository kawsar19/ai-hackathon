"use client"

import { useState, useEffect } from "react"
import {
  User,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Trash2,
  Plus,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Loader2,
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
  attachments: string[]
  githubUrl?: string | null
  demoUrl?: string | null
}

export default function UserDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
            <p className="text-gray-600">Manage and track your submitted project ideas</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Ideas</p>
            <p className="text-2xl font-bold text-blue-600">{ideas.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{ideas.length}</div>
          <div className="text-sm text-gray-600">Total Ideas</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {ideas.filter(idea => idea.status === "APPROVED").length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {ideas.filter(idea => idea.status === "PENDING").length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {ideas.filter(idea => idea.status === "COMPLETED").length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {ideas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas submitted yet</h3>
            <p className="text-gray-600 mb-6">Start by submitting your first project idea!</p>
            <a
              href="/dashboard/submit-idea"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit New Idea
            </a>
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{idea.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                      {idea.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{idea.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  </div>

                  {/* Tech Stack */}
                  {idea.techStack && idea.techStack.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {idea.techStack.slice(0, 5).map((tech, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                            {tech}
                          </span>
                        ))}
                        {idea.techStack.length > 5 && (
                          <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                            +{idea.techStack.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(idea.progress)}`}
                          style={{ width: `${idea.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{idea.progress}%</span>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/dashboard/edit-idea/${idea.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Idea"
                      >
                        <Edit className="h-4 w-4" />
                      </a>
                      <a
                        href="/dashboard/my-ideas"
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
