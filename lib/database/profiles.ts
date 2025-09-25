import { createClient } from "@/lib/supabase/universal"
import type { Profile } from "./types"

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(
  profileData: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>,
): Promise<Profile> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", user.id).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error("Failed to update profile")
  }

  return data
}
