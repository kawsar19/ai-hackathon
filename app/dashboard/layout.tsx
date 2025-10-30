"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Lightbulb,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Edit,
  Save,
  Eye,
  Trash2,
  Home,
} from "lucide-react"
import { logout } from '@/lib/logout'

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
  { name: "Submit Idea", href: "/dashboard/submit-idea", icon: Lightbulb },
  { name: "My Ideas", href: "/dashboard/my-ideas", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userIdeasCount, setUserIdeasCount] = useState(0)
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true)
  const pathname = usePathname()
  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; email?: string; avatar?: string } | null>(null)

  // Fetch user's idea count
  useEffect(() => {
    const fetchIdeasCount = async () => {
      try {
        const response = await fetch('/api/ideas')
        if (response.ok) {
          const data = await response.json()
          setUserIdeasCount(data.ideas?.length || 0)
        }
      } catch (error) {
        console.error('Error fetching ideas count:', error)
      } finally {
        setIsLoadingIdeas(false)
      }
    }

    fetchIdeasCount()
  }, [])

  // Filter navigation based on idea count
  const filteredNavigation = navigation.filter(item => {
    if (item.name === "Submit Idea" && userIdeasCount >= 2) {
      return false
    }
    return true
  })

  // Fetch current user profile (for avatar)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        setProfile(data.user)
      } catch (_) {
        // ignore
      }
    }
    fetchProfile()
    
    // Listen for profile updates (e.g., avatar changed)
    const onProfileUpdated = (e: any) => {
      if (e?.detail?.user) {
        setProfile(e.detail.user)
      }
    }
    window.addEventListener('profile-updated', onProfileUpdated as EventListener)
    return () => {
      window.removeEventListener('profile-updated', onProfileUpdated as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-4 border-b border-gray-100">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            User Dashboard
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? "bg-blue-50 border-r-4 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <item.icon
                  className={`${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                  } mr-3 h-5 w-5`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to logout?")) {
                logout()
              }
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex flex-col w-64 bg-white h-full shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <div className="text-lg font-bold text-blue-600">User Dashboard</div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-blue-50 border-r-4 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`${
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                    } mr-3 h-5 w-5`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile Logout Button */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                setSidebarOpen(false)
                if (confirm("Are you sure you want to logout?")) {
                  logout()
                }
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="text-lg font-semibold text-gray-900">
              {filteredNavigation.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>

            <div className="flex items-center space-x-4">
              {/* Profile avatar */}
              <div className="relative">
                <button className="flex items-center space-x-2">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
