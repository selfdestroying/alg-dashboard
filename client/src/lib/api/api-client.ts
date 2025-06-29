import { apiRequest } from './api-server'

export const api = {
  get: <T>(url: string, revalidateUrl?: string) => apiRequest<T>(url, {}, revalidateUrl),
  post: <T>(url: string, body?: object, revalidateUrl?: string) =>
    apiRequest<T>(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      revalidateUrl
    ),
  update: <T>(url: string, body?: object, revalidateUrl?: string) =>
    apiRequest<T>(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      revalidateUrl
    ),
  delete: <T>(url: string, body?: object, revalidateUrl?: string) =>
    apiRequest<T>(
      url,
      {
        method: 'DELETE',
        body: JSON.stringify(body),
      },
      revalidateUrl
    ),
}
