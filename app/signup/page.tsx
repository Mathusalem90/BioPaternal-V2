import { AuthCard } from '@/components/auth-card'

export const metadata = { title: 'Créer un compte' }

export default function SignupPage() {
  return <AuthCard defaultTab="register" />
}
