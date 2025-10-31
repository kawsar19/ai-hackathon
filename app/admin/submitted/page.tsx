"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Eye,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Award,
  ExternalLink,
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
  githubUrl?: string | null
  demoUrl?: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string
  }
}

export default function SubmittedIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedProject, setSelectedProject] = useState<Idea | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/ideas')
      if (!response.ok) throw new Error('Failed to fetch ideas')
      const data = await response.json()
      const allIdeas: Idea[] = data.ideas || []
      const pendingOnly = allIdeas.filter((i) => String(i.status).toUpperCase() === 'PENDING')
      setIdeas(pendingOnly)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const openView = (idea: Idea) => {
    setSelectedProject(idea)
    setIsViewModalOpen(true)
  }

  const closeView = () => {
    setSelectedProject(null)
    setIsViewModalOpen(false)
  }

  const approveIdea = async (ideaId: string) => {
    try {
      setApprovingId(ideaId)
      const res = await fetch(`/api/admin/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to approve idea')
      }
      // Remove from list (no longer pending)
      setIdeas(prev => prev.filter(i => i.id !== ideaId))
      // Notify layout to refresh sidebar counts
      window.dispatchEvent(new Event('ideas-updated'))
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to approve idea')
    } finally {
      setApprovingId(null)
    }
  }

  const filtered = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${idea.user.firstName} ${idea.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Submitted Ideas</h1>
          <p className="text-gray-600 text-xs">Only ideas with Pending status</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search submitted ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
              </div>

              <div className="flex items-center mb-3 text-sm text-gray-600">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                {project.user.firstName} {project.user.lastName}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">{project.category}</span>
                <span className="text-xs text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openView(project)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 inline mr-1" /> View
                </button>
                <button
                  onClick={() => approveIdea(project.id)}
                  disabled={approvingId === project.id}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approvingId === project.id ? (
                    <>
                      <Loader2 className="h-4 w-4 inline animate-spin mr-1" /> Approving
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 inline mr-1" /> Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      

      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Submitted by {selectedProject.user.firstName} {selectedProject.user.lastName}</p>
                </div>
                <button onClick={closeView} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-8 w-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" /> Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-600" /> Problem Statement
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.problemStatement}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> Proposed Solution
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.solution}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" /> Target Audience
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.targetAudience}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-600" /> Project Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-gray-600">Category:</span><span className="font-medium text-gray-900">{selectedProject.category}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Timeline:</span><span className="font-medium text-gray-900">{selectedProject.timeline}</span></div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" /> Technology Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-green-600" /> Expected Outcome
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.expectedOutcome}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" /> Required Resources
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProject.resources}</p>
                  </div>
                  {(selectedProject.githubUrl || selectedProject.demoUrl) && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ExternalLink className="h-5 w-5 mr-2 text-gray-600" /> Project Links
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {selectedProject.githubUrl && (
                          <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                            <FileText className="h-4 w-4 mr-2" /> GitHub Repository
                          </a>
                        )}
                        {selectedProject.demoUrl && (
                          <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <ExternalLink className="h-4 w-4 mr-2" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedProject.attachments && selectedProject.attachments.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-600" /> Attachments ({selectedProject.attachments.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedProject.attachments.map((attachment, index) => (
                          <div key={index} className="relative">
                            <img
                              src={attachment}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-28 object-cover rounded border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                              onClick={() => window.open(attachment, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA0MEM3MS4xNjM0IDQwIDc3IDQ1LjgzNjYgNzcgNTNDNzcgNjAuMTYzNCA3MS4xNjM0IDY2IDY0IDY2QzU2LjgzNjYgNjYgNTEgNjAuMTYzNCA1MSA1M0M1MSA0NS44MzY2IDU2LjgzNjYgNDAgNjQgNDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zOCA5MEw0OCA4MEw1OCA5MEw3OCA3MEw4OCA4MFY5MEgzOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                                target.alt = 'Image failed to load'
                              }}
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


