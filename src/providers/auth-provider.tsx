'use client'

import { UserData } from '@/actions/users'
import { createContext, useContext } from 'react'

interface AuthProviderProps {
  user: UserData
  children: React.ReactNode
}

export const AuthContext = createContext<UserData | null>(null)

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
