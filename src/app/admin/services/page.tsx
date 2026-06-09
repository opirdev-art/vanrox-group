import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllServicesForAdmin } from '@/lib/services/queries'
import { ServiceToggle } from './components/service-toggle'

export default async function AdminServicesPage() {
  let services: Awaited<ReturnType<typeof getAllServicesForAdmin>> = []
  let error: string | null = null

  try {
    services = await getAllServicesForAdmin()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load services'
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-bebas text-4xl tracking-[3px] text-white">Services Catalog</h1>
          <p className="text-gray font-light mt-1">
            Manage offerings shown on the public services page and booking scheduler.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="bg-green text-navy px-5 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} />
          Add service
        </Link>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">{error}</div>
      )}

      {services.length === 0 && !error ? (
        <div className="bg-navy-light border border-white/5 rounded-xl p-10 text-center">
          <p className="text-gray mb-4">No services in the database yet.</p>
          <p className="text-sm text-gray mb-6">
            Run the services seed migration, or add your first service manually.
          </p>
          <Link
            href="/admin/services/new"
            className="inline-block bg-green text-navy px-5 py-2.5 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm"
          >
            Add first service
          </Link>
        </div>
      ) : (
        <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-white/5">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{service.metadata?.icon ?? '•'}</span>
                      <div>
                        <div className="text-white font-medium">{service.name}</div>
                        <div className="text-xs text-gray line-clamp-1 max-w-md">{service.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray text-sm">{service.slug}</td>
                  <td className="px-6 py-5 text-gray text-sm">{service.sort_order ?? 0}</td>
                  <td className="px-6 py-5">
                    <ServiceToggle serviceId={service.id} isActive={service.is_active ?? false} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Link
                        href={`/admin/services/${service.id}/content`}
                        className="text-[0.7rem] text-gray border border-white/10 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:text-white"
                      >
                        Page
                      </Link>
                      <Link
                        href={`/admin/services/${service.id}/case-studies`}
                        className="text-[0.7rem] text-gray border border-white/10 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:text-white"
                      >
                        Cases
                      </Link>
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="text-[0.7rem] text-green border border-green/30 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:bg-green/10"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </div>
  )
}
