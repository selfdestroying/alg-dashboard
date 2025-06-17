'use server'

import { revalidatePath } from 'next/cache'

export async function createGroup(name: string, courseId: number) {
  const res = await fetch('http://localhost:5120/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, courseId }),
  })
  if (!res.ok) {
    return null
  }
  revalidatePath('/dashboard/groups')
  return await res.json()
}

export async function updateGroup(id: number, name: string, courseId: number) {
  const res = await fetch(`http://localhost:5120/api/groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, courseId }),
  })
  if (!res.ok) {
    return false
  }
  revalidatePath('/dashboard/groups')
  return true
}

export async function deleteGroup(id: number) {
  const res = await fetch(`http://localhost:5120/api/groups/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    return false
  }

  revalidatePath('/dashboard/groups')
  return true
}
