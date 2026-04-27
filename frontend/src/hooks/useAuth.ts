import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export interface User {
  id: number
  username: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.login(username, password)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    setIsAuthenticated(true)
    return response
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    return await api.changePassword(oldPassword, newPassword)
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    changePassword,
  }
}