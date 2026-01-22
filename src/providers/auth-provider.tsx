'use client'

import { UserDTO } from '@/types/user'
import { createContext, useContext } from 'react'

interface AuthProviderProps {
  user: UserDTO
  children: React.ReactNode
}

export const AuthContext = createContext<UserDTO | null>(null)

export function AuthProvider({ user, children }: AuthProviderProps) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return ctx
}
