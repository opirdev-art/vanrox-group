import { Shield, Bell, Database, Globe } from 'lucide-react'

export default function AdminSettings() {
  const sections = [
    { icon: Globe, title: 'General', desc: 'Site name, contact info, and global settings.' },
    { icon: Shield, title: 'Security', desc: 'Manage passwords, two-factor auth, and sessions.' },
    { icon: Bell, title: 'Notifications', desc: 'Configure email alerts for new leads and bookings.' },
    { icon: Database, title: 'Data Management', desc: 'Export project data, backups, and logs.' },
  ]

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">System Settings</h1>
        <p className="text-gray font-light mt-1">Configure your administrative preferences and site behavior.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-navy-light border border-white/5 rounded-xl p-8 hover:border-green/20 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-green/10 rounded-lg flex items-center justify-center text-green mb-6 group-hover:bg-green/20 transition-colors">
              <section.icon size={24} />
            </div>
            <h3 className="font-barlow-condensed text-xl font-bold tracking-widest uppercase text-white mb-2">{section.title}</h3>
            <p className="text-gray text-sm font-light leading-relaxed">{section.desc}</p>
          </div>
        ))}
      </div>

      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Business Phone</label>
            <input type="text" defaultValue="2721240" className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Business Email</label>
            <input type="email" defaultValue="info@vanrox-group.com" className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Address</label>
            <textarea className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm h-24">Scarborough, Tobago</textarea>
          </div>
        </div>
        <div className="pt-4">
          <button className="bg-green text-navy px-8 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase hover:bg-green/80 transition-all">Save Changes</button>
        </div>
      </section>
    </div>
  )
}
