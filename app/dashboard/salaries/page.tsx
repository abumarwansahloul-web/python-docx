'use client'

import { useState, useEffect } from 'react'
import { getSalariesByMonth, createSalaryRecord } from '@/app/actions/salaries'
import { getEmployees } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function SalariesPage() {
  const [salaries, setSalaries] = useState([])
  const [employees, setEmployees] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    baseSalary: '',
    allowances: '',
    deductions: '',
  })

  useEffect(() => {
    loadData()
  }, [month, year])

  async function loadData() {
    try {
      setLoading(true)
      const [salData, empData] = await Promise.all([
        getSalariesByMonth(year, month),
        getEmployees(),
      ])
      setSalaries(salData)
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
      await createSalaryRecord({
        employeeId: parseInt(formData.employeeId),
        month,
        year,
        baseSalary: formData.baseSalary,
        allowances: formData.allowances || '0',
        deductions: formData.deductions || '0',
      })
      setFormData({ employeeId: '', baseSalary: '', allowances: '', deductions: '' })
      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Failed to create salary record:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Salary Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {month}/{year}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Salary Record'}
        </Button>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
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
                <label className="block text-sm font-medium text-foreground mb-1">Base Salary</label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Allowances</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Deductions</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save Salary Record</Button>
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading salary data...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Base</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Allowances</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Deductions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Net</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      No salary records for this period
                    </td>
                  </tr>
                ) : (
                  salaries.map((item: any) => (
                    <tr key={item.salary.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {item.employee.firstName} {item.employee.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">${parseFloat(item.salary.baseSalary).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">${parseFloat(item.salary.allowances).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">${parseFloat(item.salary.deductions).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ${parseFloat(item.salary.netSalary).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.salary.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.salary.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
