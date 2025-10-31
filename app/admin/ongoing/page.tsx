"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Award,
  ExternalLink,
  X,
  CheckCircle,
  Github,
  Globe,
  PlayCircle,
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
  documentationUrl?: string | null
  videoUrl?: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    department: string
  }
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 inline mr-1">
      <path d="M3 3a1 1 0 0 1 1 1v15h16a1 1 0 1 1 0 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1zm6 10a1 1 0 0 1 1 1v4H8v-4a1 1 0 0 1 1-1zm6-4a1 1 0 0 1 1 1v8h-2V10a1 1 0 0 1 1-1zM9 7a1 1 0 0 1 1-1h2v12h-2V7zm8-4a1 1 0 0 1 1 1v4h-2V4a1 1 0 0 1 1-1z"/>
    </svg>
  )
}

export default function OngoingProjectsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [completingId, setCompletingId] = useState<string | null>(null)

  const [selectedProject, setSelectedProject] = useState<Idea | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [commits, setCommits] = useState<any[]>([])
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null)
  const [selectedCommitFiles, setSelectedCommitFiles] = useState<any[] | null>(null)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/ideas')
      if (!response.ok) throw new Error('Failed to fetch ideas')
      const data = await response.json()
      const ongoingOnly: Idea[] = (data.ideas || []).filter((i: Idea) => String(i.status).toUpperCase() === 'IN_PROGRESS')
      setIdeas(ongoingOnly)
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

  const filtered = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${idea.user.firstName} ${idea.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const hasMinCompletionLinks = (idea: Idea) => {
    const links = [idea.demoUrl, idea.documentationUrl, idea.videoUrl]
    return links.filter((u) => typeof u === 'string' && u && u.trim().length > 0).length >= 2
  }

  const parseRepoFromUrl = (url?: string | null) => {
    if (!url) return null
    try {
      const u = new URL(url)
      if (u.hostname !== 'github.com') return null
      const parts = u.pathname.replace(/\.git$/, '').split('/').filter(Boolean)
      if (parts.length < 2) return null
      return { owner: parts[0], repo: parts[1] }
    } catch {
      return null
    }
  }

  const fetchCommits = async (idea: Idea) => {
    const repo = parseRepoFromUrl(idea.githubUrl)
    if (!repo) {
      setGithubError('Invalid GitHub repository URL')
      return
    }
    setGithubLoading(true)
    setGithubError(null)
    setCommits([])
    setSelectedCommitSha(null)
    setSelectedCommitFiles(null)
    try {
      const headers: any = { 'Accept': 'application/vnd.github+json' }
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?per_page=20`, { headers })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch commits')
      }
      const data = await res.json()
      setCommits(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setGithubError(e?.message || 'Failed to fetch commits')
    } finally {
      setGithubLoading(false)
    }
  }

  const fetchCommitFiles = async (sha: string) => {
    if (!selectedProject) return
    const repo = parseRepoFromUrl(selectedProject.githubUrl)
    if (!repo) return
    setSelectedCommitSha(sha)
    setSelectedCommitFiles(null)
    try {
      const headers: any = { 'Accept': 'application/vnd.github+json' }
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/commits/${sha}`, { headers })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch commit details')
      }
      const data = await res.json()
      setSelectedCommitFiles(Array.isArray(data?.files) ? data.files : [])
    } catch (e) {
      // silently ignore per-file errors; commit list still visible
      setSelectedCommitFiles([])
    }
  }

  const openGithubModal = async (idea: Idea) => {
    setSelectedProject(idea)
    setIsGithubModalOpen(true)
    await fetchCommits(idea)
  }
  const closeGithubModal = () => {
    setIsGithubModalOpen(false)
    setCommits([])
    setGithubError(null)
    setSelectedCommitSha(null)
    setSelectedCommitFiles(null)
  }

  const openChartModal = async (idea: Idea) => {
    setSelectedProject(idea)
    setIsChartModalOpen(true)
    await fetchActivityData(idea)
  }

  const closeChartModal = () => {
    setIsChartModalOpen(false)
    setActivityData([])
    setChartError(null)
  }

  const fetchActivityData = async (idea: Idea) => {
    const repo = parseRepoFromUrl(idea.githubUrl)
    if (!repo) {
      setChartError('Invalid GitHub repository URL')
      return
    }
    setChartLoading(true)
    setChartError(null)
    try {
      const headers: any = { 'Accept': 'application/vnd.github+json' }
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
      if (token) headers['Authorization'] = `Bearer ${token}`
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?since=${encodeURIComponent(since)}&per_page=100`, { headers })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch activity')
      }
      const data = await res.json()
      const commitsArr = Array.isArray(data) ? data : []
      const counts: Record<string, number> = {}
      for (const c of commitsArr) {
        const dateStr = c?.commit?.author?.date
        if (!dateStr) continue
        const d = new Date(dateStr)
        const key = d.toISOString().slice(0, 10)
        counts[key] = (counts[key] || 0) + 1
      }
      // build last 14 days timeline for chart
      const days = 14
      const series: { date: string; count: number }[] = []
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        series.push({ date: key, count: counts[key] || 0 })
      }
      setActivityData(series)
    } catch (e: any) {
      setChartError(e?.message || 'Failed to load activity')
    } finally {
      setChartLoading(false)
    }
  }

  const markCompleted = async (ideaId: string) => {
    try {
      const current = ideas.find(i => i.id === ideaId)
      if (!current) return
      if (!hasMinCompletionLinks(current)) {
        alert('To mark as Completed, provide at least two of: Live Demo, Documentation, Video.')
        return
      }
      setCompletingId(ideaId)
      const res = await fetch(`/api/admin/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to mark as Completed')
      }
      setIdeas(prev => prev.filter(i => i.id !== ideaId))
      window.dispatchEvent(new Event('ideas-updated'))
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to mark as Completed')
    } finally {
      setCompletingId(null)
    }
  }

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
          <h1 className="text-xl font-bold text-gray-900">Ongoing Projects</h1>
          <p className="text-gray-600 text-xs">Projects currently in progress</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ongoing projects..."
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

              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">{project.category}</span>
                <span className="text-xs text-gray-500">Started on {new Date(project.updatedAt).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700 font-medium">Progress</span>
                <span className="text-sm text-gray-700 font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${project.progress}%` }} />
              </div>

              <div className="flex space-x-2 mt-1">
                <button
                  onClick={() => openView(project)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 inline mr-1" /> View
                </button>
                {project.githubUrl && (
                  <button
                    onClick={() => openGithubModal(project)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-4 w-4 inline mr-1" /> GitHub Activity
                  </button>
                )}
                {project.githubUrl && (
                  <button
                    onClick={() => openChartModal(project)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <ChartIcon /> Activity Chart
                  </button>
                )}
                {hasMinCompletionLinks(project) && (
                  <button
                    onClick={() => markCompleted(project.id)}
                    disabled={completingId === project.id}
                    className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completingId === project.id ? (
                      <>
                        <Loader2 className="h-4 w-4 inline animate-spin mr-1" /> Completing
                      </>
                    ) : (
                      <>Mark as Completed</>
                    )}
                  </button>
                )}
              </div>
              {(project.githubUrl || project.demoUrl || project.documentationUrl || project.videoUrl) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1.5 text-xs bg-gray-800 text-white rounded hover:bg-gray-900"
                    >
                      <Github className="h-3 w-3 mr-1.5" /> GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Globe className="h-3 w-3 mr-1.5" /> Live Demo
                    </a>
                  )}
                  {project.documentationUrl && (
                    <a
                      href={project.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      <FileText className="h-3 w-3 mr-1.5" /> Docs
                    </a>
                  )}
                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <PlayCircle className="h-3 w-3 mr-1.5" /> Video
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-gray-500">No ongoing projects.</div>
        )}
      </div>

      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Started on {new Date(selectedProject.updatedAt).toLocaleString()}</p>
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
                      <div className="flex justify-between"><span className="text-gray-600">Progress:</span><span className="font-medium text-gray-900">{selectedProject.progress}%</span></div>
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

      {isGithubModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">GitHub Activity</h3>
                  <p className="text-xs text-gray-500 break-all">{selectedProject.githubUrl}</p>
                </div>
                <button onClick={closeGithubModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {githubError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> {githubError}
                </div>
              )}

              {githubLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-md">
                    <div className="px-3 py-2 border-b border-gray-200 text-sm font-medium text-gray-700">Recent Commits</div>
                    <div className="max-h-96 overflow-y-auto divide-y">
                      {commits.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">No commits found.</div>
                      )}
                      {commits.map((c) => {
                        const sha = c?.sha
                        const msg = c?.commit?.message?.split('\n')[0] || 'No message'
                        const author = c?.commit?.author?.name || c?.author?.login || 'Unknown'
                        const date = c?.commit?.author?.date ? new Date(c.commit.author.date).toLocaleString() : ''
                        return (
                          <button key={sha} onClick={() => fetchCommitFiles(sha)} className={`w-full text-left p-3 hover:bg-gray-50 ${selectedCommitSha === sha ? 'bg-blue-50' : ''}`}>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">{msg}</div>
                            <div className="text-xs text-gray-600 mt-1">{author} • {date}</div>
                            <div className="text-xs text-gray-400 mt-1">{sha?.slice(0, 7)}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-md">
                    <div className="px-3 py-2 border-b border-gray-200 text-sm font-medium text-gray-700">Files Changed {selectedCommitSha ? `(${selectedCommitSha.slice(0,7)})` : ''}</div>
                    <div className="max-h-96 overflow-y-auto">
                      {!selectedCommitSha && (
                        <div className="p-4 text-sm text-gray-500">Select a commit to view changed files.</div>
                      )}
                      {selectedCommitSha && selectedCommitFiles === null && (
                        <div className="p-4 text-sm text-gray-500 flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2"/>Loading files…</div>
                      )}
                      {selectedCommitSha && Array.isArray(selectedCommitFiles) && selectedCommitFiles.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">No file data available for this commit.</div>
                      )}
                      {Array.isArray(selectedCommitFiles) && selectedCommitFiles.length > 0 && (
                        <ul className="divide-y">
                          {selectedCommitFiles.map((f: any, idx: number) => (
                            <li key={`${f.filename}-${idx}`} className="p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 break-all">{f.filename}</span>
                                <span className="text-xs rounded px-1.5 py-0.5 border border-gray-200 text-gray-600">{f.status}</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-600">+{f.additions} / -{f.deletions} • {f.changes} changes</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isChartModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Commit Activity (Last 14 Days)</h3>
                  <p className="text-xs text-gray-500 break-all">{selectedProject.githubUrl}</p>
                </div>
                <button onClick={closeChartModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {chartError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> {chartError}
                </div>
              )}

              {chartLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div>
                  {(() => {
                    const maxCount = Math.max(1, ...activityData.map((d) => d.count || 0))
                    return (
                      <div className="grid grid-cols-14 gap-3 items-end border-t border-b border-gray-100 py-6">
                        {activityData.map((d, idx) => {
                          const height = Math.round((d.count / maxCount) * 120) // up to 120px
                          const showTick = idx % 2 === 0
                          return (
                            <div key={d.date} className="flex flex-col items-center relative group">
                              <div
                                className="w-3 sm:w-4 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t shadow-sm transition transform hover:-translate-y-1 hover:shadow-md"
                                style={{ height: `${height}px` }}
                              />
                              {/* count bubble (on hover) */}
                              <div className="absolute -top-5 opacity-0 group-hover:opacity-100 transition text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                                {d.count}
                              </div>
                              {/* date label */}
                              <div className={`mt-2 text-[10px] text-gray-500 ${showTick ? '' : 'opacity-30'} rotate-[-45deg] origin-top-left whitespace-nowrap`}>
                                {d.date.slice(5)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                  <div className="mt-3 text-xs text-gray-600">Bars show daily commits (last 14 days). Hover bars to see counts.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


