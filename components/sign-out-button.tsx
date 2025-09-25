"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/universal"

export function SignOutButton() {
  const router = useRouter()

  const onClick = async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    router.replace("/auth/login")
  }

  return (
    <button onClick={onClick} className="text-sm text-muted-foreground hover:text-foreground">
      Sign out
    </button>
  )
}


