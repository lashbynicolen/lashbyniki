import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { LoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Logowanie",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/klienci")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Nicole Bosiacka
          </h1>
          <p className="font-script text-2xl text-primary/70">Panel</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
