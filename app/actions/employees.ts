'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { employees } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getEmployees() {
  const userId = await getUserId()
  return db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .orderBy(desc(employees.createdAt))
}

export async function getEmployeeById(id: number) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id))
    .limit(1)
  
  if (!result.length || result[0].userId !== userId) {
    throw new Error('Employee not found')
  }
  return result[0]
}

export async function createEmployee(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  baseSalary: string
}) {
  const userId = await getUserId()
  
  const result = await db
    .insert(employees)
    .values({
      ...data,
      userId,
      baseSalary: parseFloat(data.baseSalary),
    })
    .returning()
  
  revalidatePath('/dashboard/employees')
  return result[0]
}

export async function updateEmployee(
  id: number,
  data: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    position?: string
    department?: string
    baseSalary?: string
    status?: string
  }
) {
  const userId = await getUserId()
  
  // Verify ownership
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id))
    .limit(1)
  
  if (!employee.length || employee[0].userId !== userId) {
    throw new Error('Unauthorized')
  }

  const updateData: any = { ...data }
  if (data.baseSalary) {
    updateData.baseSalary = parseFloat(data.baseSalary)
  }
  updateData.updatedAt = new Date()

  const result = await db
    .update(employees)
    .set(updateData)
    .where(eq(employees.id, id))
    .returning()
  
  revalidatePath('/dashboard/employees')
  return result[0]
}

export async function deleteEmployee(id: number) {
  const userId = await getUserId()
  
  // Verify ownership
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id))
    .limit(1)
  
  if (!employee.length || employee[0].userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db.delete(employees).where(eq(employees.id, id))
  revalidatePath('/dashboard/employees')
}

export async function getEmployeeStats() {
  const userId = await getUserId()
  
  const total = await db
    .select({ count: sql`count(*)` })
    .from(employees)
    .where(eq(employees.userId, userId))

  const active = await db
    .select({ count: sql`count(*)` })
    .from(employees)
    .where(eq(employees.status, 'active'))

  return {
    total: Number(total[0].count),
    active: Number(active[0].count),
  }
}
