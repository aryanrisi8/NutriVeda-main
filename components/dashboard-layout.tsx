"use client"

import type React from "react"
import { Leaf, Bell, Settings, User, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === "SIGNED_OUT") {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-border bg-primary px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
    <Link href="/protected" className="flex items-center gap-2 cursor-pointer">
      <Leaf className="h-8 w-8 text-primary-foreground" />
      <h1 className="text-2xl font-serif font-bold text-primary-foreground">NutriVeda</h1>
    </Link>
    <div className="h-6 w-px bg-border ml-4" />
    <span className="text-sm text-primary-foreground">Transform traditional knowledge into personalized care</span>
  </div>

  <div className="flex items-center gap-3">
    <Button variant="ghost" size="sm">
      <Bell className="h-4 w-4 text-primary-foreground" />
    </Button>
    <Button variant="ghost" size="sm">
      <Settings className="h-4 w-4 text-primary-foreground" />
    </Button>

    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
      <User className="h-4 w-4" />
      <span className="ml-2">{user?.email || "User"}</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56 z-50">
    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
  </div>
</header>
      {children}
    </div>
  )
}
