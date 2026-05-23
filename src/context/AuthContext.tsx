import React, { createContext, useContext, useState, useEffect } from 'react'
import { Profile, UserRole } from '../types'
import { authService } from '../services/authService'

interface AuthContextType {
  user: Profile | null
  loading: boolean
  isMockMode: boolean
  signIn: (email: string) => Promise<{ success: boolean; error: string | null }>
  signUp: (email: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isMockMode, setIsMockMode] = useState<boolean>(authService.isMockMode)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to restore auth session:', err)
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const signIn = async (email: string) => {
    setLoading(true)
    try {
      const { user: profile, error } = await authService.signIn(email)
      if (error) {
        return { success: false, error: error.message }
      }
      setUser(profile)
      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during sign in' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, fullName: string, role?: UserRole) => {
    setLoading(true)
    try {
      const { user: profile, error } = await authService.signUp(email, fullName, role)
      if (error) {
        return { success: false, error: error.message }
      }
      setUser(profile)
      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during sign up' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (err) {
      console.error('Error during sign out:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Error refreshing user:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isMockMode, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
