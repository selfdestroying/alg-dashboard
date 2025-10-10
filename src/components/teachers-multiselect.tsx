'use client'
import { updateTeacherGroup } from '@/actions/groups'
import { updateTeacherLesson } from '@/actions/lessons'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import MultipleSelector, { Option } from './ui/multiselect'

interface TeachersMultiSelectProps {
  teachers: Option[]
  currentTeachers: Option[]
  lessonId?: number
  groupId?: number
}

export default function TeachersMultiSelect({
  teachers,
  currentTeachers,
  lessonId,
  groupId,
}: TeachersMultiSelectProps) {
  const [newTeachers, setNewTeachers] = useState<Option[]>(currentTeachers)
  const [isModified, setIsModified] = useState<boolean>(false)

  useEffect(() => {
    const areArraysEqual = (arr1: Option[], arr2: Option[]) => {
      if (arr1.length !== arr2.length) return false
      const sortedArr1 = [...arr1].sort((a, b) => a.value.localeCompare(b.value))
      const sortedArr2 = [...arr2].sort((a, b) => a.value.localeCompare(b.value))
      return sortedArr1.every((item, index) => item.value === sortedArr2[index].value)
    }

    setIsModified(!areArraysEqual(newTeachers, currentTeachers))
  }, [newTeachers, currentTeachers])

  const handleUpdate = () => {
    if (lessonId) {
      const ok = updateTeacherLesson(lessonId, currentTeachers, newTeachers)
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Успешно',
        error: (err) => err.message,
      })
      return
    }
    if (groupId) {
      const ok = updateTeacherGroup(groupId, currentTeachers, newTeachers)
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Успешно',
        error: (err) => err.message,
      })
      return
    }
  }

  return (
    <div className="flex gap-2">
      <MultipleSelector
        commandProps={{
          label: 'Select frameworks',
        }}
        defaultOptions={teachers}
        value={newTeachers}
        placeholder="Select frameworks"
        hideClearAllButton
        maxSelected={2}
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
        className="text-sm font-semibold"
        onChange={setNewTeachers}
      />
      <Button disabled={!isModified} onClick={handleUpdate}>
        Сохранить
      </Button>
    </div>
  )
}
