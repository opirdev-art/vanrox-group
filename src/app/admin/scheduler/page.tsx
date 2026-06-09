import Link from 'next/link'
import { Clock, MapPin, User } from 'lucide-react'
import { getAppointmentsForMonth } from '@/lib/scheduler/queries'
import { getLeadById } from '@/lib/leads/queries'
import { formatLeadDate } from '@/lib/leads/format'
import { BlockoutForm } from './components/blockout-form'
import { ConfirmLeadPanel } from './components/confirm-lead-panel'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default async function AdminSchedulerPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; lead?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const year = Number(params.year) || now.getFullYear()
  const month = Number(params.month) || now.getMonth() + 1

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }

  let appointments: Awaited<ReturnType<typeof getAppointmentsForMonth>> = []
  let fetchError: string | null = null

  try {
    appointments = await getAppointmentsForMonth(year, month)
  } catch (error) {
    fetchError = error instanceof Error ? error.message : 'Failed to load appointments'
  }

  const leadForConfirm = params.lead ? await getLeadById(params.lead) : null

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Scheduler Management</h1>
        <p className="text-gray font-light mt-1">Manage survey appointments and block out unavailable dates.</p>
      </header>

      {leadForConfirm && leadForConfirm.preferred_start_time && leadForConfirm.preferred_end_time && (
        <ConfirmLeadPanel
          leadId={leadForConfirm.id}
          title={leadForConfirm.service?.name ?? 'Site visit'}
          startTime={leadForConfirm.preferred_start_time}
          endTime={leadForConfirm.preferred_end_time}
        />
      )}

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-navy-light border border-white/5 rounded-xl p-4 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h3 className="font-barlow-condensed text-lg sm:text-xl font-bold tracking-widest uppercase">
              {MONTH_NAMES[month - 1]} {year}
            </h3>
            <div className="flex gap-2">
              <Link
                href={`/admin/scheduler?year=${prevMonth.year}&month=${prevMonth.month}`}
                className="inline-flex items-center justify-center min-h-11 min-w-11 hover:bg-white/5 rounded-md text-gray hover:text-white text-sm"
              >
                ←
              </Link>
              <Link
                href={`/admin/scheduler?year=${nextMonth.year}&month=${nextMonth.month}`}
                className="inline-flex items-center justify-center min-h-11 min-w-11 hover:bg-white/5 rounded-md text-gray hover:text-white text-sm"
              >
                →
              </Link>
            </div>
          </div>

          {/* Mobile agenda */}
          <div className="lg:hidden space-y-3 mb-6">
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayAppointments = appointments.filter((a) => {
                const d = new Date(a.start_time)
                return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
              })
              if (dayAppointments.length === 0) return null

              return (
                <div key={`mobile-day-${day}`} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm font-barlow-condensed font-bold tracking-widest uppercase text-white mb-3">
                    {MONTH_NAMES[month - 1]} {day}
                  </p>
                  <div className="space-y-2">
                    {dayAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        className={`p-3 rounded-md border text-sm ${
                          appt.is_blockout
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <p className="text-white font-medium">{appt.title}</p>
                        <p className="text-xs text-gray mt-1">{formatLeadDate(appt.start_time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {appointments.length === 0 && (
              <p className="text-gray text-sm">No appointments or blockouts this month.</p>
            )}
          </div>

          <div className="hidden lg:grid grid-cols-7 gap-2 text-center text-xs font-bold tracking-widest text-gray uppercase mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="hidden lg:grid grid-cols-7 gap-2">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayAppointments = appointments.filter((a) => {
                const d = new Date(a.start_time)
                return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
              })
              const hasBlockout = dayAppointments.some((a) => a.is_blockout)
              const hasVisit = dayAppointments.some((a) => !a.is_blockout)

              return (
                <div
                  key={day}
                  className={`aspect-square border border-white/5 rounded-lg p-2 flex flex-col items-end transition-all ${
                    hasVisit ? 'bg-green/10 border-green/30' : hasBlockout ? 'bg-red-500/10 border-red-500/30' : ''
                  }`}
                >
                  <span className="text-sm text-gray">{day}</span>
                  {dayAppointments.length > 0 && (
                    <span className="text-[0.55rem] text-gray mt-auto mx-auto uppercase tracking-tighter">
                      {dayAppointments.length} item{dayAppointments.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-navy-light border border-white/5 rounded-xl p-6 shadow-lg">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white mb-4">
              Block out time
            </h3>
            <BlockoutForm />
          </section>

          <section className="bg-navy-light border border-white/5 rounded-xl p-6 shadow-lg">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white mb-4">
              This month
            </h3>
            {appointments.length === 0 ? (
              <p className="text-gray text-sm">No appointments or blockouts scheduled.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className={`p-4 rounded-lg border ${
                      appt.is_blockout
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white text-sm font-medium">{appt.title}</p>
                        <p className="text-xs text-gray mt-1 flex items-center gap-1">
                          <Clock size={12} className="text-green/60" />
                          {formatLeadDate(appt.start_time)}
                        </p>
                        {!appt.is_blockout && appt.lead?.customers && (
                          <p className="text-xs text-gray mt-1 flex items-center gap-1">
                            <User size={12} className="text-green/60" />
                            {appt.lead.customers.full_name}
                          </p>
                        )}
                        {!appt.is_blockout && appt.lead?.site_location && (
                          <p className="text-xs text-gray mt-1 flex items-center gap-1">
                            <MapPin size={12} className="text-green/60" />
                            {appt.lead.site_location}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[0.55rem] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${
                          appt.is_blockout ? 'bg-red-500/20 text-red-300' : 'bg-green/10 text-green'
                        }`}
                      >
                        {appt.is_blockout ? 'Blockout' : appt.status ?? 'scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
