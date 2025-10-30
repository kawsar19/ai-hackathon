"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  Zap,
  Trophy,
  Code,
  Menu,
  X,
  Bell,
  ExternalLink,
  CheckCircle,
  XCircle,
  Lightbulb,
  Rocket,
  Award,
  Handshake,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react"

export default function HackathonLanding() {
  const [hoveredPrize, setHoveredPrize] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [avatarVersion, setAvatarVersion] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    
    // Update user/avatar immediately after profile saves elsewhere
    const onProfileUpdated = (e) => {
      if (e?.detail?.user) {
        setUser(e.detail.user)
        setAvatarVersion((v) => v + 1)
      }
    }

    window.addEventListener('profile-updated', onProfileUpdated)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('profile-updated', onProfileUpdated)
    }
  }, [userDropdownOpen])

  const handleLogout = () => {
    // Clear token cookie
    const isProduction = process.env.NODE_ENV === 'production'
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${isProduction ? 'secure; samesite=strict' : ''}`
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Reset user state
    setUser(null)
    setUserDropdownOpen(false)
    
    // Redirect to home
    window.location.href = '/'
  }

  const notifications = [
    {
      id: 1,
      date: "Nov 1, 2025",
      title: "Hackathon Overview & Guidelines",
      description: "Read the complete hackathon overview and guidelines document",
      link: "https://docs.google.com/document/d/1bFt3Hm98wo6Ktg2tWhI20oKNN1zcpAYhR1bWL-BwdN8/edit?tab=t.g69axi3sh0h2#heading=h.e9cyyu71fe98",
      type: "overview",
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Share Ideas",
      description: "Research real business problems and submit your project idea",
      details: [
        "Research real business problems or explore ideas from Product Hunt",
        "Find a problem you understand well and believe you can improve",
        "Check if similar ideas exist and identify how yours can be different",
        "Choose one realistic and doable idea within the given time",
        "Submit through Google Form",
      ],
      canDo: ["Research thoroughly", "Explore multiple ideas", "Be creative"],
      cantDo: ["Submit unrealistic ideas", "Choose ideas too big to complete"],
    },
    {
      number: 2,
      title: "Idea Selection",
      description: "Management team reviews and selects ideas to move forward",
      details: [
        "Wait for management team to review all ideas",
        "You can explain why your idea is important",
        "Management will select one idea per person",
        "If similar ideas exist, management may request changes to avoid overlap",
      ],
      canDo: ["Explain your idea", "Provide context"],
      cantDo: ["Submit duplicate ideas"],
    },
    {
      number: 3,
      title: "Senior Developer Session",
      description: "Learn AI tools, best practices, and project guidelines",
      details: [
        "Senior developer provides overview of AI tools you can use",
        "Share best practices and guidelines for building projects",
        "Q&A session to clarify doubts about tools and requirements",
        "Align on expectations and improve your project approach",
      ],
      canDo: ["Attend actively", "Take notes", "Ask questions", "Follow up afterward"],
      cantDo: ["Miss the session", "Ignore guidance shared"],
    },
    {
      number: 4,
      title: "Build the Project",
      description: "Create full-stack solutions using AI tools and APIs",
      details: [
        "Build using v0.dev, Cursor AI, or any AI development tool",
        "Use AI models or APIs for smart features",
        "Make a full working project with both frontend and backend",
        "Keep the design simple and easy to use",
      ],
      canDo: ["Use AI tools", "Integrate APIs", "Build full-stack", "Keep design simple"],
      cantDo: ["Build only frontend", "Deviate from selected idea"],
    },
    {
      number: 5,
      title: "Test & Improve",
      description: "Polish your project and optimize performance",
      details: [
        "Fix bugs and polish your project - clean UI, consistent UX",
        "Optimize performance if the app feels slow or glitchy",
        "Test on different devices (mobile, tablet, desktop)",
        "Make small feature refinements for better usability",
      ],
      canDo: ["Fix bugs", "Polish UI", "Optimize performance", "Test devices"],
      cantDo: ["Add big new features at last moment"],
    },
    {
      number: 6,
      title: "Final Presentation",
      description: "Prepare documentation and submit your project",
      details: [
        "Host your project live on any platform",
        "Prepare proper documentation for your project",
        "Submit live project link, GitHub link, and explanation video or documentation",
        "Make sure everything is ready for judges",
      ],
      canDo: ["Host live", "Document well", "Create video or docs"],
      cantDo: [],
    },
    {
      number: 7,
      title: "Winner Selection",
      description: "Projects judged on multiple criteria",
      details: [
        "Usefulness in solving a real problem",
        "Smart and creative use of AI tools",
        "Simplicity and nice design (UI and UX)",
        "Newness and completeness of the solution",
        "Clean and easy-to-understand code",
        "Fast and smooth performance",
        "Scalability and stability",
        "Clear and helpful instructions and presentation",
      ],
      canDo: [],
      cantDo: [],
    },
    {
      number: 8,
      title: "Prizes & Rewards",
      description: "Celebrate your achievement and potential partnership",
      details: [
        "First Prize: 10,000 BDT",
        "Second Prize: 5,000 BDT",
        "Third Prize: 3,000 BDT",
        "Certificate for all participants",
        "Potential partnership opportunity with Qtec Solution Ltd for exceptional projects",
      ],
      canDo: [],
      cantDo: [],
    },
  ]

  const judgingCriteria = [
    { title: "Real Problem Solving", description: "Usefulness in solving a real business problem" },
    { title: "AI Integration", description: "Smart and creative use of AI tools and models" },
    { title: "Design & UX", description: "Simplicity and nice design for users" },
    { title: "Innovation", description: "Newness and completeness of the solution" },
    { title: "Code Quality", description: "Clean and easy-to-understand code" },
    { title: "Performance", description: "Fast and smooth performance" },
    { title: "Scalability", description: "Ability to handle more users" },
    { title: "Presentation", description: "Clear and helpful instructions and documentation" },
  ]

  const googleDocLink =
    "https://docs.google.com/document/d/1bFt3Hm98wo6Ktg2tWhI20oKNN1zcpAYhR1bWL-BwdN8/edit?tab=t.g69axi3sh0h2#heading=h.e9cyyu71fe98"

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-lg sm:text-2xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            QSL AI Hackathon
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <a
                  href={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
                </a>
                <a
                  href={googleDocLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  View Overview
                </a>
                
                {/* User Dropdown */}
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={`${user.avatar}?v=${avatarVersion}`} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <span className="hidden lg:block">{user.name || user.email.split('@')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name || user.email.split('@')[0]}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <a
                        href={user.role === 'ADMIN' ? '/admin/settings' : '/dashboard/profile'}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </a>
                      {user.role !== 'ADMIN' && (
                        <a
                          href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </a>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Register
                </a>
                <a
                  href={googleDocLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  View Overview
                </a>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100 mb-3">
                  <p className="text-sm font-medium text-gray-900">{user.name || user.email.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <a
                  href={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  className="w-full px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
                </a>
                <a
                  href={user.role === 'ADMIN' ? '/admin/settings' : '/dashboard/profile'}
                  className="w-full px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </a>
                {user.role !== 'ADMIN' && (
                  <a
                    href="/dashboard/settings"
                    className="w-full px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors block text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </a>
                )}
                <a
                  href={googleDocLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 block text-center"
                >
                  View Overview
                </a>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full px-6 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors block text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="w-full px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="w-full px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </a>
                <a
                  href={googleDocLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 block text-center"
                >
                  View Overview
                </a>
              </>
            )}
          </div>
        )}
      </nav>

      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 sm:mb-8 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full text-blue-700 text-xs sm:text-sm font-medium">
            🚀 5-6 Weeks of Innovation
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight text-balance text-gray-900">
            Build the Future with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AI Agents</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform real business problems into intelligent solutions. Compete for prizes, learn cutting-edge AI
            tools, and showcase your innovation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 sm:mb-20">
            <a
              href={googleDocLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              View Overview <ChevronRight size={20} />
            </a>
            <button className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-gray-300 hover:border-blue-600 text-gray-900 font-bold rounded-full transition-all duration-300 hover:bg-gray-50 text-base sm:text-lg">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-20">
            <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">18,000 BDT</div>
              <div className="text-sm sm:text-base text-gray-600">Total Prize Pool</div>
            </div>
            <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">5-6 Weeks</div>
              <div className="text-sm sm:text-base text-gray-600">Build Duration</div>
            </div>
            <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">AI-Powered</div>
              <div className="text-sm sm:text-base text-gray-600">Innovation Focus</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Eligibility
            </span>
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-10 mb-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Employees Only</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  This hackathon is exclusively for employees of{" "}
                  <span className="font-semibold text-blue-600">Qtec Solution Ltd</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
              <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-3 text-lg">
                <Zap size={20} /> Time Commitment
              </h4>
              <p className="text-base text-gray-600 leading-relaxed">
                All hackathon work must be done outside of regular office hours. Manage your time responsibly.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
              <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-3 text-lg">
                <Lightbulb size={20} /> One Idea Per Person
              </h4>
              <p className="text-base text-gray-600 leading-relaxed">
                Each participant can submit one project idea. Management will select one idea per person to move
                forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            Hackathon{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Goals</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-8 sm:p-10 bg-gray-50 border border-gray-200 rounded-lg">
              <Rocket className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Build Something Useful</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Create powerful solutions using AI agents that solve real business problems and can adapt to actual
                needs.
              </p>
            </div>

            <div className="p-8 sm:p-10 bg-gray-50 border border-gray-200 rounded-lg">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Learn AI Tools Effectively</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Master how to use AI tools effectively in real projects and understand best practices for AI
                integration.
              </p>
            </div>

            <div className="p-8 sm:p-10 bg-gray-50 border border-gray-200 rounded-lg">
              <Code className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Improve Problem-Solving</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Enhance your project knowledge and develop stronger problem-solving skills through hands-on experience.
              </p>
            </div>

            <div className="p-8 sm:p-10 bg-gray-50 border border-gray-200 rounded-lg">
              <Award className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Showcase Innovation</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Demonstrate your creativity and technical skills to the company and compete for recognition and prizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-12 sm:mb-16">
            <Bell className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Latest{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Updates</span>
            </h2>
          </div>

          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-4 sm:gap-6 min-w-min">
              {notifications.map((notif) => (
                <a
                  key={notif.id}
                  href={notif.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-72 sm:w-80 md:w-96 p-6 sm:p-8 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {notif.date}
                    </span>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {notif.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{notif.description}</p>

                  <div className="flex items-center gap-2 text-blue-600 text-sm sm:text-base font-semibold group-hover:gap-3 transition-all">
                    View Details
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="md:hidden text-center mt-6">
            <p className="text-sm text-gray-500">← Swipe to see more updates →</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            Compete for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Amazing Prizes
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { place: "🥇 First Prize", amount: "10,000 BDT", icon: Trophy, color: "from-yellow-600 to-yellow-500" },
              { place: "🥈 Second Prize", amount: "5,000 BDT", icon: Trophy, color: "from-gray-600 to-gray-500" },
              { place: "🥉 Third Prize", amount: "3,000 BDT", icon: Trophy, color: "from-orange-600 to-orange-500" },
            ].map((prize, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPrize(idx)}
                onMouseLeave={() => setHoveredPrize(null)}
                className={`p-8 sm:p-10 rounded-lg border transition-all duration-300 ${
                  hoveredPrize === idx
                    ? "bg-blue-50 border-blue-400 scale-105 shadow-lg shadow-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="text-4xl sm:text-5xl mb-4">{prize.place}</div>
                <div
                  className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${prize.color} bg-clip-text text-transparent mb-3`}
                >
                  {prize.amount}
                </div>
                <p className="text-base text-gray-600">+ Certificate of Excellence</p>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 p-8 sm:p-10 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              <span className="font-bold text-blue-600">Bonus:</span> All participants receive a certificate.
              Exceptional projects may get a partnership opportunity with Qtec Solution Ltd!
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            The Complete{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              8-Step Process
            </span>
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 sm:gap-6 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                      <span className="text-xl sm:text-2xl font-bold text-white">{step.number}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{step.title}</h3>
                      <p className="text-base sm:text-lg text-gray-600">{step.description}</p>
                    </div>
                  </div>

                  {step.details.length > 0 && (
                    <div className="mt-6 sm:mt-8 ml-0 sm:ml-16">
                      <ul className="space-y-3 sm:space-y-4">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-gray-700">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(step.canDo.length > 0 || step.cantDo.length > 0) && (
                    <div className="mt-8 sm:mt-10 ml-0 sm:ml-16 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      {step.canDo.length > 0 && (
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                            <CheckCircle size={20} /> You Can Do
                          </h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {step.canDo.map((item, i) => (
                              <li key={i} className="text-sm sm:text-base text-gray-700">
                                ✓ {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.cantDo.length > 0 && (
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                            <XCircle size={20} /> You Can't Do
                          </h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {step.cantDo.map((item, i) => (
                              <li key={i} className="text-sm sm:text-base text-gray-700">
                                ✗ {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            How Projects Will Be{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Judged</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {judgingCriteria.map((criteria, idx) => (
              <div key={idx} className="p-6 sm:p-8 bg-white border border-gray-200 rounded-lg">
                <Award className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">{criteria.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{criteria.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-8 sm:p-10 md:p-12">
            <div className="flex items-start gap-4 sm:gap-6">
              <Handshake className="w-12 h-12 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Partnership Opportunity
                </h3>
                <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                  If your project is exceptional and shows strong potential to grow as a business, you may get a chance
                  to work together with <span className="font-semibold text-blue-600">Qtec Solution Ltd</span> to make
                  the project bigger and better!
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  This is a unique opportunity to turn your hackathon project into a real business venture with
                  professional support and resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
            Final{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Notes</span>
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-10">
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8">
              This hackathon is your chance to build something{" "}
              <span className="font-bold text-blue-600">real, intelligent, and practical</span> with AI.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
                <p className="text-base sm:text-lg font-bold text-blue-600 mb-3">Create Meaningful Solutions</p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Focus on solving real problems that matter
                </p>
              </div>
              <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
                <p className="text-base sm:text-lg font-bold text-blue-600 mb-3">Learn Deeply</p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Master AI tools and development practices
                </p>
              </div>
              <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
                <p className="text-base sm:text-lg font-bold text-blue-600 mb-3">Innovate Boldly</p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Be creative and push the boundaries
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-cyan-50 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-gray-900">
            Ready to Build the{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Future?</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed">
            Join Qtec Solution Ltd employees in this exciting 5-6 week AI hackathon. Learn, build, and compete for
            amazing prizes!
          </p>
          <a
            href={googleDocLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 text-lg sm:text-xl"
          >
            View Hackathon Overview
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 sm:py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p className="text-base sm:text-lg">© 2025 QSL AI Hackathon. Powered by Qtec Solution Ltd.</p>
          <p className="mt-3 text-sm sm:text-base">Build something useful. Learn deeply. Innovate boldly.</p>
        </div>
      </footer>
    </div>
  )
}
