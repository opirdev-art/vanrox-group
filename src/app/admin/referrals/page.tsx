import { Users, UserPlus, Link as LinkIcon, TrendingUp, Copy } from 'lucide-react'

export default function AdminReferralsPage() {
  const partners = [
    { name: 'Marcus Persad', company: 'Persad Real Estate', code: 'VAN-PERS-001', leads: 12, value: 'Won 8' },
    { name: 'K. James', company: 'James & Assoc. Law', code: 'VAN-JAME-002', leads: 5, value: 'Won 3' },
    { name: 'R. Alexis', company: 'Tobago Land Developers', code: 'VAN-ALEX-003', leads: 24, value: 'Won 15' },
  ]

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-bebas text-4xl tracking-[3px] text-white">Referral Network</h1>
          <p className="text-gray font-light mt-1">Manage professional partners and track word-of-mouth lead generation.</p>
        </div>
        <button className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-green/80 transition-all">
          <UserPlus size={18} />
          Add Partner
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-light border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-blue-400">
            <Users size={20} />
            <span className="text-[0.7rem] uppercase tracking-widest font-bold">Total Partners</span>
          </div>
          <div className="text-3xl font-bebas tracking-[2px] text-white">32</div>
        </div>
        <div className="bg-navy-light border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-green">
            <TrendingUp size={20} />
            <span className="text-[0.7rem] uppercase tracking-widest font-bold">Conversion Rate</span>
          </div>
          <div className="text-3xl font-bebas tracking-[2px] text-white">68%</div>
        </div>
        <div className="bg-navy-light border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-purple-400">
            <LinkIcon size={20} />
            <span className="text-[0.7rem] uppercase tracking-widest font-bold">Referral Leads</span>
          </div>
          <div className="text-3xl font-bebas tracking-[2px] text-white">142</div>
        </div>
      </div>

      {/* Partners List */}
      <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase">Active Partners</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                <th className="px-6 py-4">Partner Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Referral Code</th>
                <th className="px-6 py-4">Total Leads</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {partners.map((partner) => (
                <tr key={partner.code} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-medium text-white">{partner.name}</td>
                  <td className="px-6 py-5 text-gray">{partner.company}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 font-mono text-xs text-green bg-green/5 px-2 py-1 rounded border border-green/10 w-fit">
                      {partner.code}
                      <button className="text-gray hover:text-white transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-white font-bold">{partner.leads}</div>
                    <div className="text-[0.6rem] text-gray uppercase tracking-tighter">{partner.value}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[0.65rem] px-2 py-0.5 bg-green/10 text-green rounded-full font-bold tracking-widest uppercase">Active</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-gray hover:text-white transition-colors text-xs font-bold tracking-widest uppercase">Manage</button>
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
