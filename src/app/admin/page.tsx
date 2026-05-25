import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'New Leads', value: '12', icon: Users, color: 'text-blue-400' },
    { label: 'Upcoming Surveys', value: '5', icon: Calendar, color: 'text-green' },
    { label: 'Active Referrals', value: '28', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Pending Actions', value: '3', icon: AlertCircle, color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Dashboard Overview</h1>
        <p className="text-gray font-light mt-1">Welcome back. Here is what is happening with VANROX today.</p>
      </header>

      {/* Stats Grid */}
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

      {/* Two Column Layout for Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Leads */}
        <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase">Recent Leads</h3>
            <button className="text-[0.7rem] text-green hover:underline tracking-widest uppercase font-bold">View All</button>
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Customer {i}</div>
                  <div className="text-xs text-gray uppercase tracking-tighter mt-0.5">Boundary Survey • Scarborough</div>
                </div>
                <div className="text-xs px-2.5 py-1 bg-yellow-500/10 text-yellow-400 rounded-full font-bold tracking-widest uppercase">Pending</div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Appointments */}
        <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase">Upcoming Surveys</h3>
            <button className="text-[0.7rem] text-green hover:underline tracking-widest uppercase font-bold">Manage Calendar</button>
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green/10 text-green p-3 rounded-lg text-center min-w-[60px]">
                    <div className="text-xs uppercase font-bold tracking-tighter">May</div>
                    <div className="text-xl font-bebas leading-none">{25 + i}</div>
                  </div>
                  <div>
                    <div className="text-white font-medium">Site Visit: Lot {100 + i}</div>
                    <div className="text-xs text-gray uppercase tracking-tighter mt-0.5">09:00 AM • Bacolet</div>
                  </div>
                </div>
                <div className="text-xs px-2.5 py-1 bg-green/10 text-green rounded-full font-bold tracking-widest uppercase">Confirmed</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
