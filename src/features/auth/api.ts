// TODO(담당 1): 로그인/로그아웃/현재 사용자 API를 구현하고 아래 화면에 연결합니다.

export type ApiUser = {
  id: string | number
  email: string
  role: 'admin' | 'user'
}

export async function getCurrentUser(): Promise<{ user: ApiUser | null }> {
  throw new Error('TODO: 현재 로그인 사용자 조회 API를 연결하세요.')
}

export async function logIn(_email: string, _password: string): Promise<{ user: ApiUser }> {
  throw new Error('TODO: 로그인 API를 연결하세요.')
}

export async function logOut(): Promise<void> {
  throw new Error('TODO: 로그아웃 API를 연결하세요.')
}
