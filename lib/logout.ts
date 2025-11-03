export function logout() {
  // Clear token cookie
  const isProduction = process.env.NODE_ENV === 'production'
  document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${isProduction ? 'secure; samesite=lax' : ''}`
  
  // Clear localStorage
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  
  // Redirect to login
  window.location.href = '/login'
}
