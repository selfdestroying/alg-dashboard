import * as XLSX from 'xlsx'
import type { RevenueData } from './types'

function formatCurrency(value: number) {
  return Math.round(value)
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Присутствовал',
  ABSENT: 'Отсутствовал',
  UNSPECIFIED: 'Не указан',
}

const LESSON_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активный',
  CANCELLED: 'Отменён',
}

export function exportRevenueToXlsx(data: RevenueData, dateRangeLabel: string) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Детализация ───────────────────────────────────────────────
  const detailRows: Record<string, unknown>[] = []

  for (const day of data.days) {
    for (const lesson of day.lessons) {
      const teachers = lesson.group.teachers.map((t) => t.teacher.name).join(', ')
      for (const att of lesson.attendance) {
        detailRows.push({
          Дата: formatDate(lesson.date),
          Время: lesson.time,
          Курс: lesson.group.course.name,
          Локация: lesson.group.location?.name ?? '',
          Тип: lesson.group.groupType?.name ?? '',
          Преподаватели: teachers,
          'Статус урока': LESSON_STATUS_LABELS[lesson.status] ?? lesson.status,
          Ученик: `${att.student.lastName} ${att.student.firstName}`,
          'Статус посещения': STATUS_LABELS[att.status] ?? att.status,
          Предупредил: att.isWarned ? 'Да' : 'Нет',
          'Стоимость (₽)': formatCurrency(att.visitCost),
          'Комментарий к расчёту': att.costReason.replace(/\n/g, ' '),
        })
      }
    }
  }

  const wsDetail = XLSX.utils.json_to_sheet(detailRows)
  // Auto-width columns
  const colWidths = Object.keys(detailRows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...detailRows.map((r) => String(r[key] ?? '').length), 10),
  }))
  wsDetail['!cols'] = colWidths
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Детализация')

  // ── Sheet 2: Сводка по дням ────────────────────────────────────────────
  const daySummaryRows = data.days.map((day) => ({
    Дата: formatDate(day.date),
    'День недели': day.dayOfWeek,
    'Кол-во уроков': day.lessons.length,
    'Выручка (₽)': formatCurrency(day.dayRevenue),
  }))

  const wsDays = XLSX.utils.json_to_sheet(daySummaryRows)
  wsDays['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsDays, 'По дням')

  // ── Sheet 3: Итоги ────────────────────────────────────────────────────
  const { stats } = data
  const summaryRows = [
    { Показатель: 'Всего уроков', Значение: stats.totalLessons },
    { Показатель: 'Проведено уроков', Значение: stats.doneLessons },
    { Показатель: 'Всего посещений', Значение: stats.totalStudentVisits },
    { Показатель: 'Присутствовало', Значение: stats.presentCount },
    { Показатель: 'Посещаемость (%)', Значение: stats.attendanceRate },
    { Показатель: 'Платных посещений', Значение: stats.chargedVisits },
    { Показатель: 'Общая выручка (₽)', Значение: formatCurrency(stats.totalRevenue) },
    { Показатель: 'Ср. за посещение (₽)', Значение: formatCurrency(stats.avgPerVisit) },
    { Показатель: 'Ср. за урок (₽)', Значение: formatCurrency(stats.avgPerLesson) },
  ]

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
  wsSummary['!cols'] = [{ wch: 22 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Итоги')

  // ── Download ──────────────────────────────────────────────────────────
  const sanitizedLabel = dateRangeLabel.replace(/[\\/:*?"<>|]/g, '_')
  XLSX.writeFile(wb, `Выручка_${sanitizedLabel}.xlsx`)
}
