'use client'

import { useState, useEffect } from 'react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import EmployeeForm from '@/components/employee-form'
import EmployeeTable from '@/components/employee-table'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('Failed to load employees:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: any) {
    try {
      if (editingId) {
        await updateEmployee(editingId, data)
      } else {
        await createEmployee(data)
      }
      setShowForm(false)
      setEditingId(null)
      setEditingData(null)
      loadEmployees()
    } catch (error) {
      console.error('Failed to save employee:', error)
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id)
        loadEmployees()
      } catch (error) {
        console.error('Failed to delete employee:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Employees</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <EmployeeForm
            initialData={editingData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
              setEditingData(null)
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading employees...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <EmployeeTable
            employees={employees}
            onEdit={(employee) => {
              setEditingData(employee)
              setEditingId(employee.id)
              setShowForm(true)
            }}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
