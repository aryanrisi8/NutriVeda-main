import { createClient } from "@/lib/supabase/universal"

export interface Patient {
  id: string
  practitioner_id: string
  name: string
  age: number | null
  gender: string | null
  phone: string | null
  email: string | null
  address: string | null
  condition: string | null
  status?: string | null
  last_visit?: string | null
  next_appointment?: string | null
  bmi?: number | null
  medical_conditions: string[] | null
  dietary_restrictions: string[] | null
  current_medications: string[] | null
  vata_percentage: number
  pitta_percentage: number
  kapha_percentage: number
  current_vata: number
  current_pitta: number
  current_kapha: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreatePatientData {
  name: string
  age?: number
  gender?: string
  phone?: string
  email?: string
  address?: string
  condition?: string
  medical_conditions?: string[]
  dietary_restrictions?: string[]
  current_medications?: string[]
  vata_percentage?: number
  pitta_percentage?: number
  kapha_percentage?: number
  current_vata?: number
  current_pitta?: number
  current_kapha?: number
  notes?: string
}

export async function getAllPatients(): Promise<Patient[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patients:", error)
    throw new Error("Failed to fetch patients")
  }

  return data || []
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching patient:", error)
    return null
  }

  return data
}

export async function createPatient(patientData: CreatePatientData): Promise<Patient> {
  const supabase = await createClient()

  // Get the current authenticated user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated to create a patient.")
  }

  const { data, error } = await supabase
    .from("patients")
    .insert([
      {
        ...patientData,
        practitioner_id: user.id, // Add the authenticated user's ID
        medical_conditions: patientData.medical_conditions || [],
        dietary_restrictions: patientData.dietary_restrictions || [],
        current_medications: patientData.current_medications || [],
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating patient:", error)
    throw new Error("Failed to create patient")
  }

  return data
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("patients").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating patient:", error)
    throw new Error("Failed to update patient")
  }

  return data
}

export async function deletePatient(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("patients").delete().eq("id", id)

  if (error) {
    console.error("Error deleting patient:", error)
    throw new Error("Failed to delete patient")
  }
}

export async function getPatientStats() {
  const supabase = await createClient()

  // Always get an exact total count via selecting only id
  const { count: totalCount, error: countError } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true })

  if (countError) {
    console.error("Error counting patients:", countError)
  }

  let active = 0
  let followUp = 0
  let dueToday = 0

  // Try to compute additional stats if optional columns exist
  const { data: extraData, error: extraError } = await supabase
    .from("patients")
    .select("status, next_appointment")

  if (!extraError && Array.isArray(extraData)) {
    const today = new Date().toISOString().split("T")[0]
    active = extraData.filter((p: any) => p.status === "active").length
    followUp = extraData.filter((p: any) => p.status === "follow-up").length
    dueToday = extraData.filter((p: any) => {
      if (!p.next_appointment) return false
      try {
        const appt = typeof p.next_appointment === "string" ? p.next_appointment : String(p.next_appointment)
        return appt <= today
      } catch {
        return false
      }
    }).length
  }

  return { total: totalCount ?? 0, active, followUp, dueToday }
}