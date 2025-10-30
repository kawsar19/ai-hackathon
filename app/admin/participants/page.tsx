"use client"

import { useState, useEffect } from "react"
import {
  Search,
  User,
  Shield,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'USER' | 'ADMIN'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Update user role
  const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      setUpdatingRole(userId)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user role')
      }

      const data = await response.json()
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      setSuccessMessage(`${data.user.firstName || data.user.email} role updated to ${newRole}`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error updating user role:', error)
      setError('Failed to update user role')
      setTimeout(() => setError(""), 3000)
    } finally {
      setUpdatingRole(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users & Participants</h1>
            <p className="text-gray-600 text-xs">Manage users and admins - promote/demote roles</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {filteredUsers.length} results
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {successMessage && (
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role === 'ADMIN' ? (
                        <ShieldCheck className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' 
                          ? 'text-purple-600 bg-purple-50' 
                          : 'text-gray-600 bg-gray-50'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => updateUserRole(user.id, user.role === 'USER' ? 'ADMIN' : 'USER')}
                      disabled={updatingRole === user.id}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        user.role === 'USER'
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${updatingRole === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {updatingRole === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : user.role === 'USER' ? (
                        'Promote to Admin'
                      ) : (
                        'Demote to User'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === "ADMIN").length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === "USER").length}
          </div>
          <div className="text-sm text-gray-600">Users</div>
        </div>
      </div>
    </div>
  )
}
