import { Clock, Plus, MapPin, User, XCircle } from 'lucide-react'

export default function AdminScheduler() {
  const appointments = [
    { id: 1, type: 'Survey', customer: 'John Doe', location: 'Scarborough', date: 'May 26', time: '09:00 AM', status: 'Confirmed' },
    { id: 2, type: 'Consultation', customer: 'Jane Smith', location: 'Bacolet', date: 'May 26', time: '02:00 PM', status: 'Pending' },
    { id: 3, type: 'Blockout', customer: 'N/A', location: 'N/A', date: 'May 27', time: 'All Day', status: 'Blocked' },
  ]

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-[3px] text-white">Scheduler Management</h1>
          <p className="text-gray font-light mt-1">Manage survey appointments and block out unavailable dates.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase hover:bg-white/10 transition-all flex items-center gap-2">
            <XCircle size={18} />
            Block Out
          </button>
          <button className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-green/80 transition-all">
            <Plus size={18} />
            Add Appointment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Simple Calendar View Placeholder */}
        <div className="lg:col-span-2 bg-navy-light border border-white/5 rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-barlow-condensed text-xl font-bold tracking-widest uppercase">May 2026</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-md"><Plus size={18} className="rotate-45" /></button>
              <button className="p-2 hover:bg-white/5 rounded-md"><Plus size={18} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold tracking-widest text-gray uppercase mb-4">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => (
              <div 
                key={i} 
                className={`aspect-square border border-white/5 rounded-lg p-2 flex flex-col items-end transition-all cursor-pointer hover:border-green/30 ${
                  i + 1 === 26 ? 'bg-green/10 border-green' : ''
                }`}
              >
                <span className={`text-sm ${i + 1 === 26 ? 'text-green font-bold' : 'text-gray'}`}>{i + 1}</span>
                {i + 1 === 26 && <div className="w-1.5 h-1.5 bg-green rounded-full mt-auto mx-auto"></div>}
                {i + 1 === 27 && <div className="w-full h-1 bg-red-500/50 rounded-full mt-auto"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="bg-navy-light border border-white/5 rounded-xl flex flex-col shadow-lg">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase">Schedule: May 26</h3>
          </div>
          <div className="flex-grow p-6 space-y-6">
            {appointments.filter(a => a.date === 'May 26').map((apt) => (
              <div key={apt.id} className="relative pl-6 border-l-2 border-green/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green font-bebas tracking-widest text-lg">
                    <Clock size={16} />
                    {apt.time}
                  </div>
                  <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${
                    apt.status === 'Confirmed' ? 'bg-green/10 text-green' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <User size={14} className="text-gray" />
                    {apt.customer}
                  </div>
                  <div className="text-xs text-gray flex items-center gap-2 mt-1">
                    <MapPin size={12} />
                    {apt.location} • {apt.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
