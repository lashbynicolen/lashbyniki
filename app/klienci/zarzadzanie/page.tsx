import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { ContentDashboard } from "@/components/admin/content-dashboard"

export const metadata: Metadata = {
  title: "Panel zarządzania",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function ZarzadzaniePage() {
  if (!(await isAuthenticated())) {
    redirect("/klienci/logowanie")
  }

  return <ContentDashboard />
}
