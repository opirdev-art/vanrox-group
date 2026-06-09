const EXPORTS = [
  { label: 'Export Leads', href: '/api/admin/export/leads', description: 'Leads with customer contact details' },
  {
    label: 'Export Appointments',
    href: '/api/admin/export/appointments',
    description: 'Scheduled and confirmed appointments',
  },
  { label: 'Export Customers', href: '/api/admin/export/customers', description: 'Customer contact records' },
] as const

export function ExportButtons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {EXPORTS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="block bg-navy border border-white/10 rounded-xl p-6 hover:border-green/30 transition-colors no-underline group"
        >
          <h3 className="font-barlow-condensed text-sm font-bold tracking-widest uppercase text-white group-hover:text-green transition-colors">
            {item.label}
          </h3>
          <p className="text-gray text-xs font-light mt-2 leading-relaxed">{item.description}</p>
        </a>
      ))}
    </div>
  )
}
