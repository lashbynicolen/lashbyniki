"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/app/actions/admin"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Zaloguj się
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined)

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-border bg-card p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Login</Label>
        <Input id="username" name="username" autoComplete="username" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <SubmitButton />
    </form>
  )
}
