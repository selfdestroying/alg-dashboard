'use server'

import { revalidatePath } from 'next/cache'

export async function createStudent(name: string, age: number) {
  const res = await fetch('http://localhost:5120/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age }),
  })
  if (!res.ok) {
    return null
  }
  revalidatePath('/dashboard/students')
  return await res.json()
}

export async function deleteStudent(id: number) {
  const res = await fetch(`http://localhost:5120/api/students/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    return false
  }

  revalidatePath('/dashboard/students')
  return true
}
