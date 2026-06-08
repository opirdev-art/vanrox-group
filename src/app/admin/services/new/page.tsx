import { ServiceForm } from '../components/service-form'

export default function NewServicePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Add Service</h1>
        <p className="text-gray font-light mt-1">New offerings appear on /services and /schedule when active.</p>
      </header>
      <ServiceForm />
    </div>
  )
}
