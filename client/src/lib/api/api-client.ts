import { apiRequest } from './api-server'

export const api = {
  get: <T>(url: string, options?: object, revalidateUrl?: string) =>
    apiRequest<T>(
      url,
      {
        method: 'GET',
        ...options,
      },
      revalidateUrl
    ),
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
