'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salaries, employees } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Decimal } from 'decimal.js'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createSalaryRecord(data: {
  employeeId: number
  month: number
  year: number
  baseSalary: string
  allowances?: string
  deductions?: string
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

  const base = new Decimal(data.baseSalary)
  const allowances = new Decimal(data.allowances || '0')
  const deductions = new Decimal(data.deductions || '0')
  const net = base.plus(allowances).minus(deductions)

  const result = await db
    .insert(salaries)
    .values({
      ...data,
      baseSalary: base.toString(),
      allowances: allowances.toString(),
      deductions: deductions.toString(),
      netSalary: net.toString(),
    })
    .onConflictDoUpdate({
      target: [salaries.employeeId, salaries.month, salaries.year],
      set: {
        baseSalary: base.toString(),
        allowances: allowances.toString(),
        deductions: deductions.toString(),
        netSalary: net.toString(),
      },
    })
    .returning()

  revalidatePath('/dashboard/salaries')
  return result[0]
}

export async function getSalariesByMonth(year: number, month: number) {
  const userId = await getUserId()
  
  const result = await db
    .select({
      salary: salaries,
      employee: employees,
    })
    .from(salaries)
    .innerJoin(employees, eq(salaries.employeeId, employees.id))
    .where(
      and(
        eq(employees.userId, userId),
        eq(salaries.year, year),
        eq(salaries.month, month)
      )
    )
    .orderBy(employees.lastName)

  return result
}

export async function getSalariesByEmployee(employeeId: number) {
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
    .from(salaries)
    .where(eq(salaries.employeeId, employeeId))
    .orderBy(desc(salaries.year), desc(salaries.month))
}

export async function updateSalaryStatus(id: number, status: string) {
  const userId = await getUserId()
  
  // Verify ownership
  const salary = await db
    .select()
    .from(salaries)
    .innerJoin(employees, eq(salaries.employeeId, employees.id))
    .where(eq(salaries.id, id))
    .limit(1)
  
  if (!salary.length || salary[0].employees.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const result = await db
    .update(salaries)
    .set({ status })
    .where(eq(salaries.id, id))
    .returning()

  revalidatePath('/dashboard/salaries')
  return result[0]
}
