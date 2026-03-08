# Code Review: alg-dashboard

> Дата: 13 февраля 2026  
> Проанализировано: server actions, компоненты, страницы, data layer, Prisma-схема, типы, схемы валидации, хуки, конфигурация

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### C1. Отсутствие аутентификации в server actions

Из 16 файлов серверных экшенов только **3 функции** проверяют сессию (`updateAttendance`, `cancelPayment`, `updateStudent`). Все остальные полностью открыты.

**Затронутые файлы:**

| Файл               | Функции без аутентификации                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `categories.ts`    | `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`                                                                                                    |
| `courses.ts`       | `getCourses`                                                                                                                                                             |
| `dismissed.ts`     | `getDismissed`, `createDismissed`, `removeDismissed`, `returnToGroup`, `getDismissedStatistics`                                                                          |
| `groups.ts`        | Все 10+ функций: `getGroups`, `createGroup`, `updateGroup`, `deleteGroup`, `createStudentGroup`, `deleteStudentGroup`, `createTeacherGroup`, `deleteTeacherGroup` и т.д. |
| `lessons.ts`       | `getLessons`, `getLesson`, `updateLesson`, `createLesson`, `createTeacherLesson`, `deleteTeacherLesson`, `updateTeacherLesson`                                           |
| `locations.ts`     | `getLocations`                                                                                                                                                           |
| `makeup.ts`        | `createMakeUp`                                                                                                                                                           |
| `members.ts`       | `getMembers`                                                                                                                                                             |
| `orders.ts`        | `getOrders`, `changeOrderStatus`                                                                                                                                         |
| `organizations.ts` | `createOrganization`, `addMember`                                                                                                                                        |
| `paycheck.ts`      | `getPaychecks`, `getPaycheck`, `createPaycheck`, `updatePaycheck`, `deletePaycheck`                                                                                      |
| `payments.ts`      | `getPayments`, `createPayment`, `deletePayment`, `createPaymentProduct`, `deletePaymentProduct` и т.д.                                                                   |
| `products.ts`      | `getProducts`, `createProduct`, `updateProduct`, `deleteProduct`                                                                                                         |
| `students.ts`      | `getStudents`, `getStudent`, `createStudent`, `deleteStudent`, `getActiveStudentStatistics`, `getStudentLessonsBalanceHistory`, `updateStudentBalanceHistory`            |
| `users.ts`         | `getUsers`, `getUser`, `updateUser`                                                                                                                                      |
| `attendance.ts`    | `createAttendance`, `updateAttendanceComment`, `deleteAttendance`, `getAbsentStatistics`                                                                                 |

**Рекомендация:** Создать middleware-функцию `requireAuth()`, которая проверяет сессию и возвращает `{ session, organizationId }`. Каждый server action должен начинаться с этого вызова.

---

### C2. Отсутствие авторизации (RBAC не применяется)

Роли с гранулярными разрешениями определены в `src/shared/organization-permissions.ts` (`teacher`, `manager`, `owner`), но **ни один server action не проверяет роль пользователя**.

Пользователь с ролью `teacher` (которому разрешено только `lesson: ['readSelf']`, `student: ['read']`) может вызвать:

- `deleteStudent()` - удалить ученика
- `deleteGroup()` - удалить группу
- `deletePaycheck()` - удалить начисление зарплаты
- `createUser()` - создать нового пользователя

---

### C3. Prisma Query Injection - клиент контролирует запросы к БД

Множество функций принимают **полные Prisma-аргументы** от клиента:

```typescript
// src/actions/groups.ts
export const getGroups = async <T extends Prisma.GroupFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.GroupFindManyArgs>,
) => {
  return await prisma.group.findMany<T>(payload)
}
```

Затронуто: `getGroups`, `getStudents`, `getLessons`, `getPayments`, `getUsers`, `getMembers`, `getLocations`, `getProducts`, `getOrders`, `getCourses`, `getCategories`.

Клиент может:

- Произвольные `where`-фильтры для чтения данных других организаций
- Глубокие `include`/`select` для извлечения чувствительных данных
- Дорогие запросы с множественными вложенными `include` (DoS)

---

### C4. Отсутствие изоляции данных между организациями (Tenant Isolation)

Server actions не добавляют фильтр `organizationId` на стороне сервера. Клиент контролирует `where`-условия и может запрашивать данные чужой организации:

```typescript
// Клиент может вызвать:
await getStudents({ where: { organizationId: ЧУЖОЙ_ORG_ID } })
await deleteGroup({ where: { id: ЧУЖОЙ_GROUP_ID } })
```

Кроме того, `organizationId @default(1)` на всех моделях означает, что при пропуске поля данные попадут в организацию с `id=1`.

---

### C5. Небезопасная загрузка файлов

**Файл:** `src/actions/products.ts`

```typescript
export async function createProduct(payload: Prisma.ProductCreateArgs, image: File) {
  if (image) {
    const buffer = Buffer.from(await image.arrayBuffer())
    const ext = path.extname(image.name) // Расширение контролируется клиентом
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
    const filePath = path.join('/var/www/storage/images', fileName)
    await fs.writeFile(filePath, buffer)
  }
}
```

Проблемы:

1. Расширение файла не валидируется - можно загрузить `.html`, `.svg` (XSS), `.php`
2. Содержимое файла не проверяется (MIME-type, magic bytes)
3. Размер файла не ограничён
4. Используется HTTP вместо HTTPS для URL изображений
5. Код дублируется в `updateProduct`

---

### C6. Отсутствие Error Boundaries

Ни одного файла `error.tsx`, `global-error.tsx` или `loading.tsx` во всём проекте. При ошибке в серверном компоненте пользователь увидит белый экран.

**Рекомендация:** Добавить `global-error.tsx` в `src/app/`, а также `error.tsx` + `loading.tsx` в ключевые layout-группы.

---

### C7. Использование `next/router` в App Router

**Файл:** `src/app/auth/no-organization/page.tsx`

```tsx
import router from 'next/router' // Pages Router API - НЕ работает в App Router
```

Вызов `router.push('/')` приведёт к runtime-ошибке.

**Исправление:** `import { useRouter } from 'next/navigation'`

---

### C8. Двойное хеширование пароля

**Файл:** `src/data/member/member-create-mutation.ts`

```typescript
const createMember = async ({ userParams, memberRole, organizationId }) => {
  const hashedPassword = await hashPassword(userParams.password) // хешируется на клиенте
  const { data: newUser } = await authClient.admin.createUser({
    password: hashedPassword, // admin.createUser хеширует ЕЩЁ РАЗ
  })
}
```

Результат: двойное хеширование → аутентификация сломана. Кроме того, `better-auth/crypto` - серверный модуль, импортируемый в клиентский код.

---

### C9. Пароли студентов хранятся и отображаются в открытом виде

**Схема:** `prisma/schema.prisma` - `Student.password String` без хеширования.

**UI:** `src/app/s/[slug]/students/_components/students-table.tsx`:

```tsx
{
  header: 'Пароль',
  accessorKey: 'password', // пароль в открытом виде в таблице
}
```

---

## 🟠 СЕРЬЁЗНЫЕ ПРОБЛЕМЫ (Major)

### M1. Race conditions - операции без транзакций

**Файл:** `src/actions/orders.ts` - `changeOrderStatus`:

```typescript
await prisma.order.update({ where: { id: order.id }, data: { status: newStatus } })
// ↑ Статус уже обновлён
if (...) {
  await prisma.student.update({  // ← Если упадёт - данные рассогласованы
    data: { coins: { increment: order.product.price } },
  })
}
```

Также `order` принимается от клиента как полный объект - клиент может подменить `order.status` и `order.product.price`.

**Файл:** `src/actions/groups.ts` - `updateGroup`: обновление группы + обновление дат уроков (цикл из N запросов) без транзакции.

---

### M2. Небезопасный доступ `session.members[0]` без проверки

Минимум 15+ мест обращаются к `session.members[0].organizationId` без проверки на пустой массив:

- `src/app/page.tsx`
- `src/app/auth/page.tsx`
- `src/app/auth/sign-in/page.tsx`
- `src/app/s/[slug]/page.tsx`
- `src/actions/attendance.ts`
- `src/actions/payments.ts`
- `src/actions/students.ts`
- Практически все страницы в `src/app/s/[slug]/`

Если у пользователя нет организации - `TypeError: Cannot read properties of undefined`.

---

### M3. Отсутствие валидации входных данных

Zod-схемы определены в `src/schemas/` (auth.ts, student.ts, group.ts и т.д.), но **ни один server action их не использует**. Сырые Prisma-аргументы принимаются как есть.

```typescript
// Текущий код - НЕТ валидации:
export const createStudent = async (payload: Prisma.StudentCreateArgs) => {
  await prisma.student.create(payload)
}

// Должно быть:
export const createStudent = async (rawData: unknown) => {
  const { session, organizationId } = await requireAuth()
  const data = createStudentSchema.parse(rawData)
  await prisma.student.create({ data: { ...data, organizationId } })
}
```

---

### M4. Дублирование auth-проверки в каждой странице

Один и тот же блок повторяется в **15+ серверных страницах**:

```tsx
const requestHeaders = await headers()
const session = await auth.api.getSession({ headers: requestHeaders })
if (!session) {
  redirect(`${protocol}://auth.${rootDomain}/sign-in`)
}
```

Затронуты: `dashboard/page.tsx`, `groups/page.tsx`, `students/page.tsx`, `groups/[id]/page.tsx`, `students/[id]/page.tsx`, `lessons/[id]/page.tsx`, `payments/page.tsx`, `revenue/page.tsx`, `salaries/page.tsx`, `members/page.tsx`, `active/page.tsx`, `absent/page.tsx`, `dismissed/page.tsx`, `me/page.tsx`, `admin/page.tsx`.

**Рекомендация:** Вынести в middleware или layout.

---

### M5. Отсутствие индексов на внешних ключах

**Файл:** `prisma/schema.prisma` - FK-поля без `@@index`:

| Модель       | Поля без индекса                           |
| ------------ | ------------------------------------------ |
| `Student`    | `organizationId`                           |
| `Group`      | `organizationId`, `courseId`, `locationId` |
| `Lesson`     | `groupId`, `organizationId`                |
| `Attendance` | `lessonId`, `organizationId`               |
| `Payment`    | `studentId`, `organizationId`              |
| `PayCheck`   | `userId`, `organizationId`                 |
| `Dismissed`  | `studentId`, `groupId`                     |
| `CartItem`   | `cartId`, `productId`                      |
| `Product`    | `categoryId`                               |
| `Order`      | `productId`, `studentId`                   |

---

### M6. `Category.name @unique` - глобальная уникальность вместо per-org

```prisma
model Category {
  name           String @unique  // глобально уникально!
  organizationId Int    @default(1)
}
```

Одна организация не сможет создать категорию с тем же именем, что у другой.

**Исправление:** `@@unique([organizationId, name])`

---

### M7. Водопад запросов на серверных страницах

Последовательные `await` для независимых запросов вместо `Promise.all`:

```typescript
// groups/[id]/page.tsx - текущий код (ПОСЛЕДОВАТЕЛЬНО):
const group = await getGroup({...})
const students = await getStudents({...})
const canCreateLesson = await auth.api.hasPermission({...})
const canCreateStudentGroup = await auth.api.hasPermission({...})
const canCreateTeacherGroup = await auth.api.hasPermission({...})

// Должно быть (ПАРАЛЛЕЛЬНО):
const [group, students, canCreateLesson, canCreateStudentGroup, canCreateTeacherGroup] =
  await Promise.all([...])
```

Аналогично в: `students/[id]/page.tsx`, `lessons/[id]/page.tsx`, `payments/page.tsx`.

---

### M8. `Float` для денежных сумм

```prisma
model Product {
  price         Float   // ошибки округления (0.1 + 0.2 ≠ 0.3)
  originalPrice Float?
}
```

При этом в `Payment` уже используется `Int` - несогласованность.

**Исправление:** `Decimal` или `Int` (хранить в копейках).

---

### M9. Некорректный queryKey для permission-запросов

**Файл:** `src/data/organization/organization-permission-query.ts`

```typescript
queryKey: organizationKeys.permission(), // одинаковый для всех permission!
```

Разные проверки прав в разных компонентах вернут кешированный результат первого запроса.

**Исправление:** `queryKey: organizationKeys.permission(permission)`

---

### M10. Тяжёлые аналитические запросы без агрегации

- `attendance.ts` → `getAbsentStatistics`: загружает **все** `ABSENT`-записи + все платежи, обрабатывает в памяти
- `dismissed.ts` → `getDismissedStatistics`: загружает **все** отчисления + все группы
- `students.ts` → `getActiveStudentStatistics`: загружает **все** student-group связи

Для крупных организаций → OOM или таймауты.

**Рекомендация:** SQL-агрегации (`groupBy`, `_count`, `_sum`) или raw SQL.

---

### M11. `getDismissed` - несоответствие типа и реализации

**Файл:** `src/actions/dismissed.ts`

```typescript
export async function getDismissed(payload: Prisma.DismissedFindFirstArgs) {
  return await prisma.dismissed.findMany(payload) // findMany, но тип FindFirstArgs
}
```

---

### M12. Дублирование типа `StudentWithGroupsAndAttendance`

Определён в двух местах с **разными** include-структурами:

- `src/types/student.ts` - включает `course`, `location`
- `src/actions/students.ts` - **не** включает `course`, `location`

---

### M13. `updateAttendanceComment` - экшен с полным доступом к update

**Файл:** `src/actions/attendance.ts`

```typescript
export const updateAttendanceComment = async (payload: Prisma.AttendanceUpdateArgs) => {
  await prisma.attendance.update(payload) // принимает ЛЮБЫЕ поля, не только комментарий
}
```

Без auth-проверки. Можно изменить любое поле любой записи посещения.

---

### M14. Дублирование компонента `Filters`

`src/app/s/[slug]/_components/.tsx` и `src/app/s/[slug]/groups/_components/groups-table.tsx` содержат почти идентичные компоненты `Filters` с одинаковыми query-хуками, обработчиками и Skeleton-загрузками.

---

### M15. Дублирование DataTable - две реализации

1. `src/components/data-table.tsx` - общий компонент
2. Локальная реализация внутри `dashboard.tsx` - ~90% совпадения кода

---

### M16. Прямые Prisma-запросы в серверных компонентах

Часть страниц использует server actions, часть - прямой `prisma.*`:

- `lessons/[id]/page.tsx` → `prisma.lesson.findFirst({...})`
- `me/page.tsx` → `prisma.payCheck.findMany({...})`
- `members/page.tsx` → `prisma.member.findMany({...})`
- `active/page.tsx` → `prisma.studentGroup.findMany({...})`
- `absent/page.tsx` → `prisma.attendance.findMany({...})`
- `dismissed/page.tsx` → `prisma.dismissed.findMany({...})`

Нарушает единообразие. Inline-запросы сложнее тестировать и переиспользовать.

---

### M17. `useLessonListQuery` вызывается с `organizationId!`

**Файл:** `src/app/s/[slug]/_components/.tsx`

```tsx
const organizationId = session?.members?.[0]?.organizationId
const { data: lessons } = useLessonListQuery(organizationId!, dayKey)
```

`organizationId` может быть `undefined`, а `!` подавляет предупреждение. Запрос уйдёт с `undefined` вместо ID.

---

### M18. Утечка пароля ученика - отображение в таблице

**Файл:** `src/app/s/[slug]/students/_components/students-table.tsx`

```tsx
{
  header: 'Пароль',
  accessorKey: 'password',
}
```

---

## 🟡 НЕЗНАЧИТЕЛЬНЫЕ ПРОБЛЕМЫ (Minor)

### m1. `lang="en"` для русскоязычного приложения

**Файл:** `src/app/layout.tsx`

```tsx
<html lang="en" suppressHydrationWarning className={inter.variable}>
```

**Исправление:** `lang="ru"`

---

### m2. Mock-функция в продакшн-коде

**Файл:** `src/actions/attendance.ts`

```typescript
export const updateDataMock = async (time: number) => {
  await new Promise((resolve) => setTimeout(resolve, time))
}
```

---

### m3. Смешение языков в UI и сообщениях валидации

- `sign-up-form.tsx`: `'First name is required.'`, `'Passwords do not match.'`
- `sign-in-form.tsx`: `'Please enter a valid email address.'`
- `change-password-form.tsx`: `'Текущий пароль is required'` ← смешение в одной строке!
- `create-user-dialog.tsx`: `'Имя обязательно'`
- `sign-out-mutation.ts`: `'Successfully signed out!'`
- `table-filter.tsx`: `'No items found.'`

---

### m4. `changePasswordSchema` не проверяет совпадение паролей

**Файл:** `src/schemas/auth.ts`

```typescript
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
  // нет .refine() для newPassword === confirmPassword
})
```

---

### m5. Тайпо: `makeUpAttendaceId` (пропущена `n`)

**Файлы:** `prisma/schema.prisma`, `src/types/makeup.ts`

```prisma
makeUpAttendaceId Int @unique  // должно быть makeUpAttendanceId
```

---

### m6. `Organization.createdAt` без `@default(now())`

```prisma
model Organization {
  createdAt DateTime  // нет @default(now()), хотя у всех остальных моделей есть
}
```

---

### m7. Enum `UserStatus` определён, но нигде не используется

```prisma
enum UserStatus {
  ACTIVE
  INACTIVE
}
```

Ни одна модель не использует этот enum.

---

### m8. Осиротевший тип `RoleDTO`

**Файл:** `src/types/role.ts` - содержит поля `code`, `description`, но в Prisma-схеме модели `Role` нет.

---

### m9. Несогласованные `revalidatePath`

```typescript
// С ведущим `/`:
revalidatePath('/categories')
revalidatePath('/groups/${id}')

// Без ведущего `/`:
revalidatePath('dashboard/groups')
revalidatePath('dashboard/students')
revalidatePath('dashboard/users/${id}')
```

---

### m10. Экспорт типов из файлов `'use server'`

Файлы с `'use server'` экспортируют TypeScript-типы - они предназначены только для серверных функций:

```typescript
// attendance.ts
'use server'
export type AttendanceWithStudents = Prisma.AttendanceGetPayload<{...}>
```

Затронуты: `attendance.ts`, `lessons.ts`, `orders.ts`, `students.ts`, `dismissed.ts`.

---

### m11. `columns` определены внутри компонента

**Файлы:** `users-table.tsx`, `members-table.tsx` - массив `columns` определён внутри компонента без мемоизации → пересоздание при каждом рендере.

При этом в `dashboard.tsx` есть бесполезный `useMemo(() => LESSON_COLUMNS, [])` - мемоизация уже-константы.

---

### m12. `UAParser` создаётся 3 раза для одного userAgent

**Файл:** `src/app/s/[slug]/me/_components/user-card.tsx`

```tsx
{new UAParser(session.userAgent || '').getDevice().type === 'mobile' ? ...}
{new UAParser(session.userAgent || '').getOS().name || session.userAgent},{' '}
{new UAParser(session.userAgent || '').getBrowser().name}
```

---

### m13. `useIsMobile` - потенциальный hydration mismatch

**Файл:** `src/hooks/use-mobile.ts` - начальное значение `undefined`, возвращает `!!isMobile` (false). При SSR может не совпасть с клиентом.

---

### m14. `getGroupName` падает при `dayOfWeek === null`

**Файл:** `src/lib/utils.ts`

```typescript
return `${group.course.name} ${DaysOfWeek.short[group.dayOfWeek!]} ${group.time}`
//                                                ^ non-null assertion на nullable поле
```

---

### m15. Захардкоженный пароль в seed

**Файл:** `prisma/seed.ts`

```typescript
const pass = await hashPassword('Sunaza.45')
```

---

### m16. Неверная ошибка `'Please select a student'` для `groupId`

**Файл:** `src/schemas/group.ts`

```typescript
export const GroupsStudentSchema = z.object({
  groupId: z.number({
    error: 'Please select a student.', // должно быть "select a group"
  }),
})
```

---

### m17. `OrganizationActiveParams` - copy-paste название

**Файл:** `src/data/user/user-set-password-mutation.ts`

```typescript
export interface OrganizationActiveParams {
  // должно быть SetUserPasswordParams
  userId: number
  newPassword: string
}
```

---

### m18. N+1 запросы в циклах

**Файл:** `src/actions/groups.ts` - `updateGroup`:

```typescript
for (const lesson of lessons) {
  await prisma.lesson.update({ where: { id: lesson.id }, data: { ... } })
}
```

**Файл:** `src/actions/dismissed.ts` - `returnToGroup`:

```typescript
for (const lesson of lessons) {
  await tx.attendance.create({ data: { ... } })
}
```

Можно заменить на `createMany` / batch-update.

---

### m19. `NavOrganization` - DropdownMenu без содержимого

**Файл:** `src/components/sidebar/nav-organization.tsx` - `DropdownMenu` с `DropdownMenuTrigger`, но без `DropdownMenuContent`.

---

### m20. Несогласованный нейминг

- Схемы: `CreateGroupSchema` (PascalCase) vs `editGroupSchema` (camelCase)
- Функции: arrow functions vs function declarations - смешение стилей
- Query keys: `locationsKeys.ts` (мн.ч.) vs `keys.ts` (ед.ч.)

---

### m21. Некорректный revalidatePath в `deletePaycheck`

**Файл:** `src/actions/paycheck.ts`

```typescript
export async function deletePaycheck(payload: Prisma.PayCheckDeleteArgs) {
  await prisma.payCheck.delete(payload)
  revalidatePath(`/users/${payload.where.userId}`)
  // payload.where может содержать id, а не userId → путь undefined
}
```

---

### m22. `signOutMutation` использует `getQueryClient()` вместо `useQueryClient()`

**Файл:** `src/data/user/sign-out-mutation.ts` - не через контекст React, может неправильно взаимодействовать с React-деревом.

---

### m23. `try/catch` вокруг `mutate()` бесполезен

**Файл:** `src/components/create-organization-form.tsx`

```typescript
try {
  createMutation.mutate({ ... }, { onSuccess, onError })
} catch (error) {
  onError?.(error instanceof Error ? error.message : 'Failed to process image')
}
```

`mutate()` не бросает исключений. Сообщение `'Failed to process image'` - copy-paste.

---

### m24. `useDebounce` хук не используется

**Файл:** `src/hooks/use-debounce.ts` - в `groups-table.tsx` и `students-table.tsx` используется `debounce` из `es-toolkit` вместо этого хука.

---

## СВОДНАЯ ТАБЛИЦА

### 🔴 CRITICAL

- [ ] **C1** - Нет аутентификации · Все 16 файлов actions
- [ ] **C2** - Нет авторизации (RBAC) · Все 16 файлов actions
- [ ] **C3** - Prisma query injection · 12+ функций get\*
- [ ] **C4** - Нет tenant isolation · Все CRUD + `@default(1)`
- [ ] **C5** - Unsafe file upload · `products.ts`
- [ ] **C6** - Нет Error Boundaries · Все маршруты `src/app/`
- [x] **C7** - `next/router` в App Router · `no-organization/page.tsx`
- [x] **C8** - Двойное хеширование пароля · `member-create-mutation.ts`
- [ ] **C9** - Пароли студентов в открытом виде · `schema.prisma`, `students-table.tsx`

### 🟠 MAJOR

- [ ] **M1** - Race condition (no tx) · `orders.ts`, `groups.ts`
- [x] **M2** - Unsafe `members[0]` · 15+ файлов
- [ ] **M3** - Нет валидации входных данных · Все actions
- [ ] **M4** - Auth-проверка дублирована · 15+ страниц
- [x] **M5** - Нет индексов на FK · `schema.prisma` (10+ полей)
- [x] **M6** - `Category @unique` глобально · `schema.prisma`
- [ ] **M7** - Waterfall-запросы · 5+ страниц
- [x] **M8** - `Float` для денег · `schema.prisma`
- [ ] **M9** - Одинаковый queryKey для permissions · `organization-permission-query.ts`
- [ ] **M10** - Тяжёлые запросы без агрегации · `attendance.ts`, `dismissed.ts`, `students.ts`
- [ ] **M11** - Type mismatch `FindFirst/findMany` · `dismissed.ts`
- [ ] **M12** - Дублирование типа `StudentWith...` · `types/student.ts`, `actions/students.ts`
- [ ] **M13** - Unrestricted update `attendance` · `attendance.ts`
- [ ] **M14** - Дублирование `Filters` компонента · `dashboard.tsx`, `groups-table.tsx`
- [ ] **M15** - Дублирование `DataTable` · `data-table.tsx`, `dashboard.tsx`
- [ ] **M16** - Смешение actions и inline prisma · 6+ страниц
- [ ] **M17** - `organizationId!` non-null assertion · `dashboard.tsx`
- [ ] **M18** - Пароль в таблице · `students-table.tsx`

### 🟡 MINOR

- [ ] **m1–m24** - UI/нейминг/стиль/copy-paste · Разные файлы

---

## РЕКОМЕНДУЕМЫЙ ПЛАН ИСПРАВЛЕНИЙ

### Приоритет 1 - Безопасность (C1–C5, C8–C9)

- [ ] **Создать `requireAuth()` middleware:**
  - Проверяет сессию
  - Извлекает `organizationId` из сессии (не от клиента)
  - Проверяет роль и разрешения
  - Возвращает `{ session, organizationId, userId }`

- [ ] **Заменить приём сырых Prisma-аргументов** на конкретные параметры с Zod-валидацией:

  ```typescript
  // Вместо: getStudents(payload: Prisma.StudentFindManyArgs)
  // Сделать: getStudents(filters: { search?: string, groupId?: number })
  ```

- [ ] **Принудительно добавлять `organizationId`** из сессии во все запросы. Убрать `@default(1)`.

- [ ] **Валидировать файлы:** whitelist расширений (`.jpg`, `.png`, `.webp`), проверка MIME-type, ограничение размера.

- [x] **Убрать `hashPassword` из клиента.** Перенести создание пользователя в server action.

- [ ] **Хешировать пароли студентов.** Убрать колонку `password` из UI.

### Приоритет 2 - Целостность данных (M1, M5–M6, M8–M9)

- [ ] Обернуть связанные операции в `prisma.$transaction`
- [x] Добавить `@@index` на все FK-поля
- [x] `Category`: `@@unique([organizationId, name])`
- [x] `Product.price`: `Decimal` или `Int`
- [ ] Включить `permission` в queryKey

### Приоритет 3 - Архитектура (C6–C7, M4, M7, M10)

- [ ] Добавить `global-error.tsx`, `error.tsx`, `loading.tsx`
- [x] Исправить `next/router` → `next/navigation`
- [ ] Вынести auth-проверку в middleware
- [ ] Параллелизировать запросы через `Promise.all`
- [ ] Заменить in-memory агрегации на SQL-агрегации

### Приоритет 4 - Качество кода (M11–M18, m1–m24)

- [ ] Унифицировать язык (i18n или единый язык)
- [ ] Вынести типы из `'use server'` файлов
- [ ] Устранить дублирование компонентов и типов
- [ ] Убрать mock-функции
- [ ] Исправить тайпо, нейминг, revalidatePath
