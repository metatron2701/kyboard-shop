// 공개 환경 변수로 Spring Boot API 주소를 설정하며, 끝의 슬래시는 제거합니다.
// TODO: 기능별 API를 구현할 때 이 공통 요청기를 연결하세요. 현재 화면에서는 호출하지 않습니다.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
).replace(/\/$/, '')

// 서버 오류 응답에서 화면에 표시할 메시지를 읽을 때 사용하는 형식입니다.
export type ApiErrorBody = { message?: string; error?: string }

// HTTP 상태 코드와 서버 메시지를 함께 보관하는 API 오류입니다.
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

// 모든 API 요청에 JSON 헤더와 세션 쿠키를 공통 적용합니다.
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as ApiErrorBody
      detail = body.message || body.error || ''
    } catch {
      // 서버가 비어 있거나 JSON이 아닌 오류 응답을 보낼 수 있습니다.
    }
    throw new ApiRequestError(detail || `API request failed (${response.status})`, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}