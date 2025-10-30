"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  Settings as SettingsIcon,
  Bell,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Home,
} from "lucide-react"
import { logout } from '@/lib/logout'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users & Admins", href: "/admin/participants", icon: Users },
  { name: "Projects", href: "/admin/projects", icon: FileText },
  { name: "Submitted Ideas", href: "/admin/submitted", icon: FileText },
  { name: "Approved Projects", href: "/admin/approved", icon: Award },
  { name: "Ongoing Projects", href: "/admin/ongoing", icon: Award },
  { name: "Completed Projects", href: "/admin/completed", icon: Award },
  { name: "Marks", href: "/admin/marks", icon: Award },
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; email?: string; avatar?: string } | null>(null)
  const [notifCount, setNotifCount] = useState<number>(0)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [ideaCounts, setIdeaCounts] = useState<{ submitted: number; approved: number; ongoing: number; completed: number }>({ submitted: 0, approved: 0, ongoing: 0, completed: 0 })

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
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/ideas', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const ideas = Array.isArray(data?.ideas) ? data.ideas : []
        const toStatus = (s: any) => String(s || '').toUpperCase()
        const submitted = ideas.filter((i: any) => toStatus(i.status) === 'PENDING').length
        const approved = ideas.filter((i: any) => toStatus(i.status) === 'APPROVED').length
        const ongoing = ideas.filter((i: any) => toStatus(i.status) === 'IN_PROGRESS').length
        const completed = ideas.filter((i: any) => toStatus(i.status) === 'COMPLETED').length
        setIdeaCounts({ submitted, approved, ongoing, completed })
      } catch (_) {
        // ignore
      }
    }
    fetchCounts()
    
    const onProfileUpdated = (e: any) => {
      if (e?.detail?.user) {
        setProfile(e.detail.user)
        setAvatarVersion((v) => v + 1)
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
            Admin Panel
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const count =
              item.href === '/admin/submitted' ? ideaCounts.submitted :
              item.href === '/admin/approved' ? ideaCounts.approved :
              item.href === '/admin/ongoing' ? ideaCounts.ongoing :
              item.href === '/admin/completed' ? ideaCounts.completed :
              undefined
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
                <span className="flex-1 flex items-center justify-between">
                  <span>{item.name}</span>
                  {typeof count === 'number' && (
                    <span className="ml-3 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200">
                      {count}
                    </span>
                  )}
                </span>
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
            <div className="text-lg font-bold text-blue-600">Admin Panel</div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const count =
                item.href === '/admin/submitted' ? ideaCounts.submitted :
                item.href === '/admin/approved' ? ideaCounts.approved :
                item.href === '/admin/ongoing' ? ideaCounts.ongoing :
                item.href === '/admin/completed' ? ideaCounts.completed :
                undefined
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
                  <span className="flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                    {typeof count === 'number' && (
                      <span className="ml-3 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200">
                        {count}
                      </span>
                    )}
                  </span>
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
              {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>

            <div className="flex items-center space-x-4">
              {/* Profile with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                  {profile?.avatar ? (
                    <img src={`${profile.avatar}?v=${avatarVersion}`} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      {profile?.avatar ? (
                        <img src={`${profile.avatar}?v=${avatarVersion}`} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="text-sm">
                        <div className="font-medium">{profile?.firstName} {profile?.lastName}</div>
                        <div className="text-gray-500 text-xs">{profile?.email}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/admin/settings">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-600">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
