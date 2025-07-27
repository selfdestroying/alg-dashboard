'use server'
import nodemailer from 'nodemailer'

export const sendEmail = async (name: string, feedback: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `ALG Dashboard<${process.env.EMAIL_USER}>`,
    to: 'max.f99@yandex.ru',
    subject: `Feedback from ${name}`,
    text: feedback,
  })
}
