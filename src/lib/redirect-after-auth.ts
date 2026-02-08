import { protocol, rootDomain } from "./utils";

export interface MemberWithOrganization {
  organization: {
    slug: string | null;
  };
}

/**
 * Возвращает URL для редиректа после успешной аутентификации
 * @param members - список членств пользователя в организациях
 * @returns URL для редиректа
 */
export function getRedirectUrl(members: MemberWithOrganization[]): string {
  // Если пользователь не состоит ни в одной организации
  if (!members || members.length === 0) {
    return `${protocol}://auth.${rootDomain}/no-organization`;
  }

  // Берём первую организацию пользователя
  const firstOrg = members[0];

  if (!firstOrg.organization.slug) {
    return `${protocol}://auth.${rootDomain}/no-organization`;
  }

  // Редиректим на поддомен организации
  return `${protocol}://${firstOrg.organization.slug}.${rootDomain}/dashboard`;
}

/**
 * Строит URL для организации по её slug
 */
export function getOrganizationUrl(slug: string): string {
  return `${protocol}://${slug}.${rootDomain}/dashboard`;
}
