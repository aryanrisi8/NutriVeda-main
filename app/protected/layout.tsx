// File: app/protected/layout.tsx

import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/universal"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Use the DashboardLayout component to wrap all protected pages.
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      {/* Client-only chat widget */}
      {(() => {
        const ChatWidget = dynamic(() => import("@/components/chat-widget"), { ssr: false })
        // @ts-expect-error Server Component wrapper rendering client component
        return <ChatWidget />
      })()}
    </>
  )
}