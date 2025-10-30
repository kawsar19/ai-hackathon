"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Save,
  Camera,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { uploadToCloudinary } from '@/lib/cloudinary-client'

const departments = [
  "Engineering",
  "Product Management",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
]

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    employeeId: "",
    position: "",
    joinDate: "",
    location: "",
    bio: "",
    skills: [],
    avatar: null,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfileData({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        department: data.user.department || "",
        employeeId: data.user.employeeId || "",
        position: data.user.position || "",
        joinDate: data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : "",
        location: data.user.location || "",
        bio: data.user.bio || "",
        skills: data.user.skills || [],
        avatar: data.user.avatar || null,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setErrors({ fetch: 'Failed to load profile data' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !profileData.skills.includes(skill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }))
    }
  }

  const handleSkillRemove = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is an image
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!imageTypes.includes(file.type)) {
      setErrors({ avatar: 'Only image files are allowed for avatar' })
      return
    }

    try {
      setUploadingAvatar(true)
      const avatarUrl = await uploadToCloudinary(file)
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }))
      
      // Clear any previous avatar errors
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: "" }))
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setErrors({ avatar: 'Failed to upload avatar' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!profileData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!profileData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!profileData.email.trim()) newErrors.email = "Email is required"
    if (!profileData.phone.trim()) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          department: profileData.department,
          position: profileData.position,
          location: profileData.location,
          bio: profileData.bio,
          skills: profileData.skills,
          avatar: profileData.avatar,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      setIsSaving(false)
      setSaveSuccess(true)
      setIsEditing(false)
      
      // Update localStorage with new user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        department: data.user.department,
        position: data.user.position,
        location: data.user.location,
        bio: data.user.bio,
        skills: data.user.skills,
        avatar: data.user.avatar,
      }))
      
      // Notify other parts of the app (e.g., header) immediately
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: { user: data.user } }))
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setIsSaving(false)
      setErrors({ save: error.message })
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>
        <p className="text-gray-600">
          Manage your personal information and professional details.
        </p>
      </div>

      {/* Error Messages */}
      {errors.fetch && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{errors.fetch}</p>
          </div>
        </div>
      )}

      {errors.save && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{errors.save}</p>
          </div>
        </div>
      )}

      {errors.avatar && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{errors.avatar}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">Profile updated successfully!</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Profile Avatar"
                    className="h-24 w-24 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center mx-auto mb-4">
                    <div className="h-24 w-24 rounded-full bg-white/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  </div>
                )}
                {isEditing && (
                  <label className={`absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-700'}`}>
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600">{profileData.position}</p>
              <p className="text-sm text-gray-500">{profileData.department}</p>
              
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{profileData.employeeId}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleSkillRemove(skill)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSkillAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      } ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      } ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        } ${!isEditing ? "bg-gray-50" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        } ${!isEditing ? "bg-gray-50" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          "border-gray-300"
                        } ${!isEditing ? "bg-gray-50" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={profileData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        "border-gray-300"
                      } ${!isEditing ? "bg-gray-50" : ""}`}
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        "border-gray-300"
                      } ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    "border-gray-300"
                  } ${!isEditing ? "bg-gray-50" : ""}`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
