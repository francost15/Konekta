import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { UserMessages } from './schema'

// Comprobamos que existe la URL de conexión
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL debe ser una cadena de conexión de Neon PostgreSQL')
}

// Creamos la conexión con Neon
const sql = neon(process.env.DATABASE_URL)

// Exportamos la instancia de Drizzle
export const db = drizzle(sql, {
  schema: { UserMessages },
}) 