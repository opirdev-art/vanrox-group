import { Mail, Phone, MapPin, Calendar, CheckCircle2, Clock } from 'lucide-react'

export default function AdminLeads() {
  const leads = [
    { 
      id: 1, 
      name: 'Michael Chen', 
      email: 'm.chen@example.com', 
      phone: '272-5555', 
      service: 'Boundary Survey', 
      location: 'Signal Hill, Tobago', 
      date: 'May 24, 2026', 
      status: 'New' 
    },
    { 
      id: 2, 
      name: 'Sarah Williams', 
      email: 'sarah.w@example.com', 
      phone: '272-1111', 
      service: 'Topographic Survey', 
      location: 'Mount Irvine', 
      date: 'May 23, 2026', 
      status: 'Quoted' 
    },
    { 
      id: 3, 
      name: 'David Thompson', 
      email: 'dave.t@landcorp.tt', 
      phone: '272-9999', 
      service: 'Cadastral Survey', 
      location: 'Scarborough', 
      date: 'May 22, 2026', 
      status: 'Confirmed' 
    },
  ]

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Leads & Quote Requests</h1>
        <p className="text-gray font-light mt-1">Manage incoming requests and track customer conversions.</p>
      </header>

      <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service & Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Received</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="font-medium text-white mb-1">{lead.name}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[0.7rem] text-gray uppercase tracking-tighter">
                        <Mail size={12} className="text-green/60" /> {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-[0.7rem] text-gray uppercase tracking-tighter">
                        <Phone size={12} className="text-green/60" /> {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-white text-sm font-medium mb-1">{lead.service}</div>
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-gray uppercase tracking-tighter">
                      <MapPin size={12} className="text-green/60" /> {lead.location}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`text-[0.65rem] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase flex items-center gap-1.5 w-fit ${
                      lead.status === 'New' ? 'bg-blue-500/10 text-blue-400' :
                      lead.status === 'Quoted' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-green/10 text-green'
                    }`}>
                      {lead.status === 'New' && <Clock size={12} />}
                      {lead.status === 'Confirmed' && <CheckCircle2 size={12} />}
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-gray text-xs font-light">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-green/40" />
                      {lead.date}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="text-[0.7rem] text-green border border-green/30 px-3 py-1.5 rounded hover:bg-green/10 transition-all font-bold tracking-widest uppercase">Quote</button>
                      <button className="text-[0.7rem] text-white bg-white/5 px-3 py-1.5 rounded hover:bg-white/10 transition-all font-bold tracking-widest uppercase">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
