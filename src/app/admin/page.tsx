import Link from 'next/link'
import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { getLeadsList, getNewLeadsCount } from '@/lib/leads/queries'
import { getUpcomingAppointments, getUpcomingAppointmentsCount } from '@/lib/scheduler/queries'
import { LeadStatusBadge } from './leads/components/lead-status-badge'

export default async function AdminDashboard() {
  const [newLeadsCount, upcomingCount, recentLeads, upcomingAppointments] = await Promise.all([
    getNewLeadsCount(7),
    getUpcomingAppointmentsCount(),
    getLeadsList().then((leads) => leads.slice(0, 5)),
    getUpcomingAppointments(5),
  ])

  const referralLeadsCount = recentLeads.filter((l) => l.referral_partner).length
  const pendingActions = recentLeads.filter((l) => l.status === 'new' || l.status === 'quoted').length

  const stats = [
    { label: 'New Leads', value: String(newLeadsCount), icon: Users, color: 'text-blue-400' },
    { label: 'Upcoming Surveys', value: String(upcomingCount), icon: Calendar, color: 'text-green' },
    { label: 'Referral Leads (recent)', value: String(referralLeadsCount), icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Pending Actions', value: String(pendingActions), icon: AlertCircle, color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Dashboard Overview</h1>
        <p className="text-gray font-light mt-1">Welcome back. Here is what is happening with VANROX today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-navy-light border border-white/5 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <stat.icon size={24} className={stat.color} />
              <span className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Last 7 Days</span>
            </div>
            <div className="text-3xl font-bebas tracking-[2px] text-white">{stat.value}</div>
            <div className="text-sm font-barlow text-gray uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase">Recent Leads</h3>
            <Link
              href="/admin/leads"
              className="text-[0.7rem] text-green hover:underline tracking-widest uppercase font-bold"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentLeads.length === 0 ? (
              <div className="p-6 text-gray text-sm">No leads yet.</div>
            ) : (
              recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium">{lead.customer?.full_name ?? 'Unknown'}</div>
                    <div className="text-xs text-gray uppercase tracking-tighter mt-0.5">
                      {lead.service?.name ?? 'Service'} · {lead.site_location ?? 'Tobago'}
                    </div>
                  </div>
                  <LeadStatusBadge status={lead.status ?? 'new'} />
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase">Upcoming Surveys</h3>
            <Link
              href="/admin/scheduler"
              className="text-[0.7rem] text-green hover:underline tracking-widest uppercase font-bold"
            >
              Manage Calendar
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingAppointments.length === 0 ? (
              <div className="p-6 text-gray text-sm">No upcoming appointments.</div>
            ) : (
              upcomingAppointments
                .filter((a) => !a.is_blockout)
                .map((appt) => {
                  const start = new Date(appt.start_time)
                  const month = start.toLocaleString('en-TT', { month: 'short', timeZone: 'America/Port_of_Spain' })
                  const day = start.toLocaleString('en-TT', { day: 'numeric', timeZone: 'America/Port_of_Spain' })
                  const time = start.toLocaleString('en-TT', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Port_of_Spain',
                  })

                  return (
                    <div
                      key={appt.id}
                      className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-green/10 text-green p-3 rounded-lg text-center min-w-[60px]">
                          <div className="text-xs uppercase font-bold tracking-tighter">{month}</div>
                          <div className="text-xl font-bebas leading-none">{day}</div>
                        </div>
                        <div>
                          <div className="text-white font-medium">{appt.title}</div>
                          <div className="text-xs text-gray uppercase tracking-tighter mt-0.5">
                            {time} · {appt.lead?.site_location ?? 'Tobago'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs px-2.5 py-1 bg-green/10 text-green rounded-full font-bold tracking-widest uppercase">
                        {appt.status ?? 'scheduled'}
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
