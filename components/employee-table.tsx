'use client'

import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmployeeTableProps {
  employees: any[]
  onEdit: (employee: any) => void
  onDelete: (id: number) => void
}

export default function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No employees found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Position</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Department</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Salary</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b hover:bg-muted/50">
              <td className="px-6 py-4 text-sm">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{employee.email}</td>
              <td className="px-6 py-4 text-sm">{employee.position}</td>
              <td className="px-6 py-4 text-sm">{employee.department}</td>
              <td className="px-6 py-4 text-sm">${parseFloat(employee.baseSalary).toFixed(2)}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(employee)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(employee.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
