'use client'

import { useState, useEffect } from 'react'
import { getEmployees } from '@/app/actions/employees'
import { recordAttendance, getAttendanceByDate } from '@/app/actions/attendance'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export default function AttendancePage() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  async function loadData() {
    try {
      setLoading(true)
      const empData = await getEmployees()
      const attData = await getAttendanceByDate(selectedDate)
      setEmployees(empData)
      setAttendance(attData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAttendanceChange(employeeId: number, status: string, checkInTime?: string) {
    try {
      await recordAttendance({
        employeeId,
        date: selectedDate,
        status,
        checkInTime: checkInTime || undefined,
      })
      loadData()
    } catch (error) {
      console.error('Failed to record attendance:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Attendance Management</h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading attendance data...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-In</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const empAttendance = attendance.find(a => a.attendance.employeeId === emp.id)
                  return (
                    <tr key={emp.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{emp.position}</td>
                      <td className="px-6 py-4 text-sm">
                        <input
                          type="time"
                          defaultValue={empAttendance?.attendance.checkInTime || '09:00'}
                          className="px-2 py-1 border border-input rounded-md bg-background text-foreground"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={empAttendance?.attendance.status || 'pending'}
                          onChange={(e) => handleAttendanceChange(emp.id, e.target.value)}
                          className="px-3 py-1 border border-input rounded-md bg-background text-foreground"
                        >
                          <option value="pending">Pending</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="leave">Leave</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          onClick={() => handleAttendanceChange(emp.id, empAttendance?.attendance.status || 'present')}
                        >
                          Mark
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
