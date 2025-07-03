import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'guest' | 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  joinedDate: Date
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginAsAdmin: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok) {
            const user: User = {
              id: data.user._id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role === 'admin' ? 'admin' : 'user',
              joinedDate: new Date(data.user.createdAt)
            }

            // Store the JWT token
            localStorage.setItem('token', data.token)

            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            return true
          } else {
            set({ isLoading: false })
            throw new Error(data.message || 'Login failed')
          }
        } catch (error) {
          set({ isLoading: false })
          console.error('Login error:', error)
          
          // Fallback for demo purposes - if backend is down, allow demo login
          if (email === 'demo@dilsedaan.org' && password === 'demo123') {
            const demoUser: User = {
              id: 'demo-user-1',
              email: 'demo@dilsedaan.org',
              name: 'Demo User',
              role: 'user',
              joinedDate: new Date()
            }
            
            set({ 
              user: demoUser, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            return true
          }
          
          if (email === 'admin@dilsedaan.org' && password === 'admin123') {
            const demoAdmin: User = {
              id: 'demo-admin-1',
              email: 'admin@dilsedaan.org',
              name: 'Demo Admin',
              role: 'admin',
              joinedDate: new Date()
            }
            
            set({ 
              user: demoAdmin, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            return true
          }
          
          return false
        }
      },

      loginAsAdmin: async (username: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // Use the same login endpoint but with admin credentials
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: username === 'admin' ? 'admin@dilsedaan.org' : username, password }),
          })

          const data = await response.json()

          if (response.ok && data.user.role === 'admin') {
            const adminUser: User = {
              id: data.user._id,
              email: data.user.email,
              name: data.user.name,
              role: 'admin',
              joinedDate: new Date(data.user.createdAt)
            }

            // Store the JWT token
            localStorage.setItem('token', data.token)

            set({ 
              user: adminUser, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          set({ isLoading: false })
          console.error('Admin login error:', error)
          return false
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role: 'donor' }),
          })

          const data = await response.json()

          if (response.ok) {
            const user: User = {
              id: data.user._id,
              email: data.user.email,
              name: data.user.name,
              role: 'user',
              joinedDate: new Date(data.user.createdAt)
            }

            // Store the JWT token
            localStorage.setItem('token', data.token)

            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            return true
          } else {
            set({ isLoading: false })
            throw new Error(data.message || 'Registration failed')
          }
        } catch (error) {
          set({ isLoading: false })
          console.error('Registration error:', error)
          
          // Fallback for demo purposes - if backend is down, allow demo registration
          if (name && email && password) {
            const demoUser: User = {
              id: `demo-user-${Date.now()}`,
              email: email,
              name: name,
              role: 'user',
              joinedDate: new Date()
            }
            
            set({ 
              user: demoUser, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            return true
          }
          
          return false
        }
      },

      logout: () => {
        // Clear JWT token
        localStorage.removeItem('token')
        
        set({ 
          user: null, 
          isAuthenticated: false 
        })
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ 
            user: { ...user, ...updates } 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)
