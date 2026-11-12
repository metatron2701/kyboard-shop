// TODO(담당 2): 회원가입·회원탈퇴 API를 구현하고 signup/mypage 화면에 연결합니다.

export type CustomerSignupRequest = {
  email: string
  password: string
  name: string
  phone: string
  postalCode: string
  address: string
  detailAddress: string
}

export async function signUpCustomer(_input: CustomerSignupRequest): Promise<void> {
  throw new Error('TODO: 회원가입 API를 연결하세요.')
}

export async function deleteCustomerAccount(): Promise<void> {
  throw new Error('TODO: 회원탈퇴 API를 연결하세요.')
}
