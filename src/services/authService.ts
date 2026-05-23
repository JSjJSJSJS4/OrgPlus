import { supabase } from '../lib/supabaseClient'
import { Profile, UserRole } from '../types'
import { mockProfiles, saveStorage } from './mockData'

// Detect if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'https://placeholder-url.supabase.co')
}

// Global cached current user profile in Mock Mode
let mockSessionUser: Profile | null = null
const SESSION_KEY = 'ep_mock_session_user'

export const authService = {
  isMockMode: !isSupabaseConfigured(),

  async signUp(email: string, fullName: string, role: UserRole = 'applicant'): Promise<{ user: Profile | null; error: Error | null }> {
    if (this.isMockMode) {
      // Check if user already exists
      const profilesList: Profile[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      const exists = profilesList.some(p => p.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        return { user: null, error: new Error('User already exists') }
      }

      // Create new profile
      const newProfile: Profile = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        full_name: fullName,
        email: email,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      profilesList.push(newProfile)
      saveStorage('ep_mock_profiles', profilesList)
      
      // Store in session
      mockSessionUser = newProfile
      saveStorage(SESSION_KEY, newProfile)

      return { user: newProfile, error: null }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'password123', // Static placeholder for standard demo
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })

      if (error) return { user: null, error }
      if (!data.user) return { user: null, error: new Error('No user returned') }

      // Wait a moment for public.profiles trigger to sync
      const profile = await this.getProfile(data.user.id)
      return { user: profile, error: null }
    }
  },

  async signIn(email: string): Promise<{ user: Profile | null; error: Error | null }> {
    if (this.isMockMode) {
      const profilesList: Profile[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      const found = profilesList.find(p => p.email.toLowerCase() === email.toLowerCase())
      
      if (!found) {
        return { user: null, error: new Error('User not found. Try admin@eventplan.org or officer@eventplan.org!') }
      }

      mockSessionUser = found
      saveStorage(SESSION_KEY, found)
      return { user: found, error: null }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123' // default password for seeded accounts
      })

      if (error) return { user: null, error }
      if (!data.user) return { user: null, error: new Error('No user returned') }

      const profile = await this.getProfile(data.user.id)
      return { user: profile, error: null }
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    if (this.isMockMode) {
      mockSessionUser = null
      localStorage.removeItem(SESSION_KEY)
      return { error: null }
    } else {
      const { error } = await supabase.auth.signOut()
      return { error }
    }
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (this.isMockMode) {
      const profilesList: Profile[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      return profilesList.find(p => p.id === userId) || null
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data as Profile
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: Error | null }> {
    if (this.isMockMode) {
      const profilesList: Profile[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      const index = profilesList.findIndex(p => p.id === userId)
      if (index === -1) return { profile: null, error: new Error('Profile not found') }

      const updated = { ...profilesList[index], ...updates, updated_at: new Date().toISOString() }
      profilesList[index] = updated
      saveStorage('ep_mock_profiles', profilesList)

      // If current user, update session
      if (mockSessionUser && mockSessionUser.id === userId) {
        mockSessionUser = updated
        saveStorage(SESSION_KEY, updated)
      }

      return { profile: updated, error: null }
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) return { profile: null, error }
      return { profile: data as Profile, error: null }
    }
  },

  async getCurrentUser(): Promise<Profile | null> {
    if (this.isMockMode) {
      if (!mockSessionUser) {
        const stored = localStorage.getItem(SESSION_KEY)
        if (stored) {
          mockSessionUser = JSON.parse(stored)
        }
      }
      return mockSessionUser
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      return this.getProfile(user.id)
    }
  },

  async getProfiles(): Promise<Profile[]> {
    if (this.isMockMode) {
      return this.getMockProfiles()
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      if (error) {
        console.error('Error fetching profiles:', error)
        return []
      }
      return data as Profile[]
    }
  },

  // Developer utility to list all mock profiles
  getMockProfiles(): Profile[] {
    return JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
  }
}
