"use client"

import { useState, useEffect } from "react"
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalAdmins: number
  totalIdeas: number
  pendingIdeas: number
  approvedIdeas: number
  inProgressIdeas: number
  completedIdeas: number
  rejectedIdeas: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalIdeas: 0,
    pendingIdeas: 0,
    approvedIdeas: 0,
    inProgressIdeas: 0,
    completedIdeas: 0,
    rejectedIdeas: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard-stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 text-xs">Loading dashboard statistics...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-red-600 text-xs">Error loading dashboard: {error}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load dashboard statistics. Please try again.</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Total Admins",
      value: stats.totalAdmins.toString(),
      icon: Trophy,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      name: "Total Projects",
      value: stats.totalIdeas.toString(),
      icon: FileText,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Pending Review",
      value: stats.pendingIdeas.toString(),
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      name: "Approved",
      value: stats.approvedIdeas.toString(),
      icon: CheckCircle,
      color: "emerald",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      name: "In Progress",
      value: stats.inProgressIdeas.toString(),
      icon: AlertCircle,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Completed",
      value: stats.completedIdeas.toString(),
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Rejected",
      value: stats.rejectedIdeas.toString(),
      icon: AlertCircle,
      color: "red",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ]

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 text-xs">Real-time hackathon statistics and project counts</p>
        </div>
      
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Status Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingIdeas}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approvedIdeas}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressIdeas}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.completedIdeas}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
