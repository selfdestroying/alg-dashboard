import { protocol, rootDomain } from './utils'

export interface OrganizationInfo {
  slug: string | null
}

/**
 * Возвращает URL для редиректа после успешной аутентификации
 * @param organization - организация пользователя (или null)
 * @returns URL для редиректа
 */
export function getRedirectUrl(organization: OrganizationInfo | null): string {
  if (!organization || !organization.slug) {
    return `${protocol}://${rootDomain}`
  }

  return `${protocol}://${organization.slug}.${rootDomain}/dashboard`
}

/**
 * Строит URL для организации по её slug
 */
export function getOrganizationUrl(slug: string): string {
  return `${protocol}://${slug}.${rootDomain}/dashboard`
}
