'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance, employees } from '@/lib/db/schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function recordAttendance(data: {
  employeeId: number
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: string
  notes?: string
}) {
  const userId = await getUserId()
  
  // Verify employee ownership
  const employee = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, data.employeeId), eq(employees.userId, userId)))
    .limit(1)
  
  if (!employee.length) {
    throw new Error('Employee not found')
  }

  const result = await db
    .insert(attendance)
    .values(data)
    .onConflictDoUpdate({
      target: [attendance.employeeId, attendance.date],
      set: {
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        status: data.status,
        notes: data.notes,
      },
    })
    .returning()

  revalidatePath('/dashboard/attendance')
  return result[0]
}

export async function getAttendanceByDate(date: string) {
  const userId = await getUserId()
  
  const result = await db
    .select({
      attendance: attendance,
      employee: employees,
    })
    .from(attendance)
    .innerJoin(employees, eq(attendance.employeeId, employees.id))
    .where(and(eq(attendance.date, date), eq(employees.userId, userId)))
    .orderBy(employees.lastName)

  return result
}

export async function getAttendanceByEmployee(employeeId: number, startDate: string, endDate: string) {
  const userId = await getUserId()
  
  // Verify ownership
  const employee = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.userId, userId)))
    .limit(1)
  
  if (!employee.length) {
    throw new Error('Employee not found')
  }

  return db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.employeeId, employeeId),
        gte(attendance.date, startDate),
        lte(attendance.date, endDate)
      )
    )
    .orderBy(desc(attendance.date))
}

export async function getAttendanceStats(year: number, month: number) {
  const userId = await getUserId()
  
  const stats = await db
    .select({
      status: attendance.status,
      count: sql`count(*)`,
    })
    .from(attendance)
    .innerJoin(employees, eq(attendance.employeeId, employees.id))
    .where(
      and(
        eq(employees.userId, userId),
        sql`EXTRACT(YEAR FROM ${attendance.date}) = ${year}`,
        sql`EXTRACT(MONTH FROM ${attendance.date}) = ${month}`
      )
    )
    .groupBy(attendance.status)

  return stats
}
