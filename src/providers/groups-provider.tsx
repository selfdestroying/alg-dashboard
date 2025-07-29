'use client'

import { Group } from '@prisma/client'
import { createContext, ReactNode, useContext } from 'react'

type GroupsContextType = {
  groups: Group[]
}
type GroupsProviderType = {
  groups: Group[]
  children: ReactNode
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined)

export const GroupsProvider = ({ groups, children }: GroupsProviderType) => {
  return <GroupsContext.Provider value={{ groups }}>{children}</GroupsContext.Provider>
}

export const useGroups = () => {
  return useContext(GroupsContext)
}
