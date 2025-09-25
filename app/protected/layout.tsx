import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/universal"
import { SignOutButton } from "@/components/sign-out-button"
import dynamic from "next/dynamic"

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-3 flex items-center justify-end">
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      {/* Client-only chat widget */}
      {(() => {
        const ChatWidget = dynamic(() => import("@/components/chat-widget"), { ssr: false })
        // @ts-expect-error Server Component wrapper rendering client component
        return <ChatWidget />
      })()}
    </div>
  )
}
