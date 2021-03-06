import { EventEnvelope, UUID } from '@boostercloud/framework-types'

export function partitionKeyForEvent(
  entityTypeName: string,
  entityID: UUID,
  kind: EventEnvelope['kind'] = 'event'
): string {
  return `${entityTypeName}-${entityID}-${kind}`
}

export function partitionKeyForIndexByEntity(entityTypeName: string, kind: EventEnvelope['kind']): string {
  return `${entityTypeName}-${kind}`
}

export function sortKeyForSubscription(connectionID: string, subscriptionID: string): string {
  return `${connectionID}-${subscriptionID}`
}
