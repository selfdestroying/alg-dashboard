export type ApiResponse<T = null> = SuccessResponse<T> | ErrorResponse

export interface SuccessResponse<T> {
  success: true
  data: T
}

export interface ErrorResponse {
  success: false
  message: string
}
