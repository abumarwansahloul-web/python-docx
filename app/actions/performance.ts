'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { performanceReviews, employees } from '@/lib/db/schema'
import { eq, and, desc, avg } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createPerformanceReview(data: {
  employeeId: number
  reviewDate: string
  rater: string
  rating: number
  comments?: string
  strengths?: string
  areasForImprovement?: string
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

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  const result = await db
    .insert(performanceReviews)
    .values(data)
    .returning()

  revalidatePath('/dashboard/performance')
  return result[0]
}

export async function getPerformanceReviewsByEmployee(employeeId: number) {
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
    .from(performanceReviews)
    .where(eq(performanceReviews.employeeId, employeeId))
    .orderBy(desc(performanceReviews.reviewDate))
}

export async function getAllPerformanceReviews() {
  const userId = await getUserId()
  
  const result = await db
    .select({
      review: performanceReviews,
      employee: employees,
    })
    .from(performanceReviews)
    .innerJoin(employees, eq(performanceReviews.employeeId, employees.id))
    .where(eq(employees.userId, userId))
    .orderBy(desc(performanceReviews.reviewDate))

  return result
}

export async function getPerformanceStats() {
  const userId = await getUserId()
  
  const stats = await db
    .select({
      rating: performanceReviews.rating,
    })
    .from(performanceReviews)
    .innerJoin(employees, eq(performanceReviews.employeeId, employees.id))
    .where(eq(employees.userId, userId))

  if (!stats.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
    }
  }

  const sum = stats.reduce((acc, s) => acc + s.rating, 0)
  const average = sum / stats.length

  return {
    averageRating: parseFloat(average.toFixed(2)),
    totalReviews: stats.length,
  }
}

export async function updatePerformanceReview(
  id: number,
  data: {
    rating?: number
    comments?: string
    strengths?: string
    areasForImprovement?: string
  }
) {
  const userId = await getUserId()
  
  // Verify ownership
  const review = await db
    .select()
    .from(performanceReviews)
    .innerJoin(employees, eq(performanceReviews.employeeId, employees.id))
    .where(eq(performanceReviews.id, id))
    .limit(1)
  
  if (!review.length || review[0].employees.userId !== userId) {
    throw new Error('Unauthorized')
  }

  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5')
  }

  const result = await db
    .update(performanceReviews)
    .set(data)
    .where(eq(performanceReviews.id, id))
    .returning()

  revalidatePath('/dashboard/performance')
  return result[0]
}
