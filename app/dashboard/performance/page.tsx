'use client'

import { useState, useEffect } from 'react'
import { getAllPerformanceReviews, createPerformanceReview, updatePerformanceReview } from '@/app/actions/performance'
import { getEmployees } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function PerformancePage() {
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewDate: new Date().toISOString().split('T')[0],
    rater: '',
    rating: '5',
    comments: '',
    strengths: '',
    areasForImprovement: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [revData, empData] = await Promise.all([
        getAllPerformanceReviews(),
        getEmployees(),
      ])
      setReviews(revData)
      setEmployees(empData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId) {
        await updatePerformanceReview(editingId, {
          rating: parseInt(formData.rating),
          comments: formData.comments,
          strengths: formData.strengths,
          areasForImprovement: formData.areasForImprovement,
        })
      } else {
        await createPerformanceReview({
          employeeId: parseInt(formData.employeeId),
          reviewDate: formData.reviewDate,
          rater: formData.rater,
          rating: parseInt(formData.rating),
          comments: formData.comments,
          strengths: formData.strengths,
          areasForImprovement: formData.areasForImprovement,
        })
      }
      setFormData({
        employeeId: '',
        reviewDate: new Date().toISOString().split('T')[0],
        rater: '',
        rating: '5',
        comments: '',
        strengths: '',
        areasForImprovement: '',
      })
      setShowForm(false)
      setEditingId(null)
      loadData()
    } catch (error) {
      console.error('Failed to save review:', error)
      alert('Error: ' + (error as any).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Performance Reviews</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Review'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Review' : 'Add Performance Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Review Date</label>
                <input
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rater</label>
                <input
                  type="text"
                  value={formData.rater}
                  onChange={(e) => setFormData({ ...formData, rater: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50"
                  placeholder="Your name or ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rating (1-5)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Strengths</label>
              <textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
                placeholder="Employee strengths..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Areas for Improvement</label>
              <textarea
                value={formData.areasForImprovement}
                onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
                placeholder="Areas to improve..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">General Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
                placeholder="Additional comments..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">{editingId ? 'Update Review' : 'Save Review'}</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">No performance reviews yet</p>
            </div>
          ) : (
            reviews.map((item: any) => (
              <div key={item.review.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.employee.firstName} {item.employee.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.review.reviewDate).toLocaleDateString()} • Rater: {item.review.rater}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{item.review.rating}</div>
                      <div className="text-xs text-muted-foreground">/5</div>
                    </div>
                  </div>
                </div>

                {item.review.strengths && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Strengths</h4>
                    <p className="text-sm text-muted-foreground">{item.review.strengths}</p>
                  </div>
                )}

                {item.review.areasForImprovement && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Areas for Improvement</h4>
                    <p className="text-sm text-muted-foreground">{item.review.areasForImprovement}</p>
                  </div>
                )}

                {item.review.comments && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Comments</h4>
                    <p className="text-sm text-muted-foreground">{item.review.comments}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        employeeId: item.review.employeeId.toString(),
                        reviewDate: item.review.reviewDate,
                        rater: item.review.rater,
                        rating: item.review.rating.toString(),
                        comments: item.review.comments || '',
                        strengths: item.review.strengths || '',
                        areasForImprovement: item.review.areasForImprovement || '',
                      })
                      setEditingId(item.review.id)
                      setShowForm(true)
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
