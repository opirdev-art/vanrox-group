'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import { slugifyServiceName } from '@/lib/services/slug'
import { createClient } from '@/utils/supabase/server'

export type ServiceActionResult = { ok: true } | { ok: false; error: string }

function parseServiceForm(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim() || slugifyServiceName(name)
  const description = String(formData.get('description') ?? '').trim()
  const icon = String(formData.get('icon') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0)
  const isActive = formData.get('is_active') === 'on'

  return { name, slug, description, icon, sortOrder, isActive }
}

export async function createService(formData: FormData): Promise<ServiceActionResult> {
  await requireAdmin()

  const { name, slug, description, icon, sortOrder, isActive } = parseServiceForm(formData)

  if (!name) return { ok: false, error: 'Name is required' }
  if (!slug) return { ok: false, error: 'Slug is required' }

  const supabase = await createClient()
  const { error } = await supabase.from('services').insert({
    name,
    slug,
    description: description || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_active: isActive,
    metadata: icon ? { icon } : {},
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/schedule')
  redirect('/admin/services')
}

export async function updateService(id: number, formData: FormData): Promise<ServiceActionResult> {
  await requireAdmin()

  const { name, slug, description, icon, sortOrder, isActive } = parseServiceForm(formData)

  if (!name) return { ok: false, error: 'Name is required' }
  if (!slug) return { ok: false, error: 'Slug is required' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({
      name,
      slug,
      description: description || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
      metadata: icon ? { icon } : {},
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/services')
  revalidatePath(`/admin/services/${id}`)
  revalidatePath('/services')
  revalidatePath('/schedule')
  redirect('/admin/services')
}

export async function toggleServiceActive(id: number, isActive: boolean): Promise<ServiceActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('services').update({ is_active: isActive }).eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/schedule')

  return { ok: true }
}
