'use server'

import { auth } from '@clerk/nextjs/server'
import { UserMessages } from './app/db/schema'
import { db } from './app/db'
import { eq } from 'drizzle-orm'

// Función para crear un mensaje
export async function createUserMessage(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Usuario no encontrado')

  const message = formData.get('message') as string
  await db.insert(UserMessages).values({
    user_id: userId,
    message,
  })
}

// Función para eliminar un mensaje
export async function deleteUserMessage() {
  const { userId } = await auth()
  if (!userId) throw new Error('Usuario no encontrado')

  await db.delete(UserMessages).where(eq(UserMessages.user_id, userId))
} 