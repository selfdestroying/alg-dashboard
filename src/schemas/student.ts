import { z } from 'zod/v4'

export const CreateStudentSchema = z.object({
  firstName: z.string('Укажите имя').min(2, 'Укажите имя'),
  lastName: z.string('Укажите фамилию').min(2, 'Укажите фамилию'),
  age: z
    .number('Укажите возраст')
    .gte(6, 'Укажите возраст не менее 6')
    .lte(17, 'Укажите возраст не более 17'),
  birthDate: z.date({ error: 'Укажите дату рождения' }),
  parentsName: z.string('Укажите имя родителя').min(2, 'Укажите имя родителя'),
  url: z.url('Укажите корректный URL'),
  // optional
  login: z.string('Укажите логин').min(2, 'Укажите логин'),
  password: z.string('Укажите пароль').min(2, 'Укажите пароль'),
  coins: z.number('Укажите количество монет').optional(),
})

export type CreateStudentSchemaType = z.infer<typeof CreateStudentSchema>
