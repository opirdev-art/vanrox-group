import 'server-only'

export { notify } from './orchestrator'
export { processQueuedEmailDeliveries } from './worker'

export type { NotifyResult, DeliverySummary, DeliveryStatus } from './types'
export type { DomainEvent, DomainEventType } from './events'
export { validateDomainEvent } from './events'
