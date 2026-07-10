import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { ContentDashboard } from "@/components/admin/content-dashboard"
import { getAllReviews } from "@/app/opinie/actions"
import { getPortfolioImages } from "@/app/portfolio/actions"
import { serviceCategories } from "@/lib/services"

export const metadata: Metadata = {
  title: "Panel zarządzania",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function ZarzadzaniePage() {
  if (!(await isAuthenticated())) {
    redirect("/klienci/logowanie")
  }

  const [reviews, portfolioImages] = await Promise.all([
    getAllReviews(),
    getPortfolioImages(),
  ])

  return (
    <ContentDashboard
      initialReviews={reviews}
      initialPortfolioImages={portfolioImages}
      initialServiceCategories={serviceCategories}
    />
  )
}
