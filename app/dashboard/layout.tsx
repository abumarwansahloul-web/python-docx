import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'
import { LogOut, Users, Clock, DollarSign, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-foreground">HR Management</h1>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/dashboard/employees" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <Users className="w-4 h-4" />
                Employees
              </Link>
              <Link href="/dashboard/attendance" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <Clock className="w-4 h-4" />
                Attendance
              </Link>
              <Link href="/dashboard/salaries" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <DollarSign className="w-4 h-4" />
                Salaries
              </Link>
              <Link href="/dashboard/performance" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <BarChart3 className="w-4 h-4" />
                Performance
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <form
              action={async () => {
                'use server'
                await auth.api.signOut({ headers: await headers() })
                redirect('/sign-in')
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
