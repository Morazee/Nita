import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/server/auth"

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string
  }
}

export default async function Login({ searchParams }: LoginPageProps) {
  return <LoginForm callbackUrl={searchParams?.callbackUrl} />
}
