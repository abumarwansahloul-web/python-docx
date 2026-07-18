import { getEmployeeStats } from '@/app/actions/employees'
import { getAttendanceStats } from '@/app/actions/attendance'
import { getPerformanceStats } from '@/app/actions/performance'
import { Users, TrendingUp, Clock, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const [empStats, perfStats] = await Promise.all([
    getEmployeeStats(),
    getPerformanceStats(),
  ])

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const attendanceStats = await getAttendanceStats(currentYear, currentMonth)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-foreground mt-2">{empStats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-10" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Employees</p>
              <p className="text-3xl font-bold text-foreground mt-2">{empStats.active}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500 opacity-10" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Performance</p>
              <p className="text-3xl font-bold text-foreground mt-2">{perfStats.averageRating.toFixed(1)}/5</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-500 opacity-10" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Present Today</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {attendanceStats.find(s => s.status === 'present')?.count || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-orange-500 opacity-10" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/employees">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Add New Employee
              </Button>
            </Link>
            <Link href="/dashboard/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Record Attendance
              </Button>
            </Link>
            <Link href="/dashboard/salaries">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Salary Slips
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Reviews</span>
              <span className="font-medium">{perfStats.totalReviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attendance Records</span>
              <span className="font-medium">
                {attendanceStats.reduce((sum, s) => sum + Number(s.count), 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Month</span>
              <span className="font-medium">{currentMonth}/{currentYear}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DollarSign = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
)
