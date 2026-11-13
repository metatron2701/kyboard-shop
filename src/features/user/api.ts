import { apiRequest } from '@/lib/api-client'

export type CustomerSignupRequest = {
  email: string
  password: string
  name: string
  phoneNumber?: string
  phone?: string
  postalCode?: string
  address?: string
  detailAddress?: string
}

export type ApiResponse<T> = {
  success: boolean
  message: string | null
  data: T
}

export type UserResponse = {
  userId: number
  email: string
  name: string
  phoneNumber?: string
  role: string
  createdAt: string
}

export async function signUpCustomer(input: CustomerSignupRequest): Promise<UserResponse> {
  const cleanPhone = (input.phoneNumber || input.phone || '').replace(/[^0-9]/g, '')

  const res = await apiRequest<ApiResponse<UserResponse>>('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      name: input.name,
      phoneNumber: cleanPhone,
    }),
  })

  return res.data
}

export async function getUserById(userId: number): Promise<UserResponse> {
  const res = await apiRequest<ApiResponse<UserResponse>>(`/api/users/${userId}`, {
    method: 'GET',
  })
  return res.data
}

export async function deleteCustomerAccount(): Promise<void> {
  // 회원 탈퇴는 백엔드에 아직 엔드포인트가 없으므로 로컬 세션 클리어
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mono_auth_user')
  }
}
