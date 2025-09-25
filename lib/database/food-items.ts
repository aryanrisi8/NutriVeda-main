import { createClient } from "@/lib/supabase/universal"

export interface FoodItem {
  id: string
  name: string
  category: string
  image_url: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  rasa: string | null
  virya: string | null
  vipaka: string | null
  guna: string | null
  vata_compatibility: "excellent" | "good" | "moderate" | "poor" | null
  pitta_compatibility: "excellent" | "good" | "moderate" | "poor" | null
  kapha_compatibility: "excellent" | "good" | "moderate" | "poor" | null
  season: string | null
  benefits: string[]
  conditions: string[]
  created_at: string
  updated_at: string
}

export interface CreateFoodItemData {
  name: string
  category: string
  image_url?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  rasa?: string
  virya?: string
  vipaka?: string
  guna?: string
  vata_compatibility?: "excellent" | "good" | "moderate" | "poor"
  pitta_compatibility?: "excellent" | "good" | "moderate" | "poor"
  kapha_compatibility?: "excellent" | "good" | "moderate" | "poor"
  season?: string
  benefits?: string[]
  conditions?: string[]
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("foods").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching food items:", error)
    throw new Error("Failed to fetch food items")
  }

  return data || []
}

export async function getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("category", category)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching food items by category:", error)
    throw new Error("Failed to fetch food items")
  }

  return data || []
}

export async function searchFoodItems(searchTerm: string): Promise<FoodItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,benefits.cs.{${searchTerm}}`)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error searching food items:", error)
    throw new Error("Failed to search food items")
  }

  return data || []
}

export async function createFoodItem(foodData: CreateFoodItemData): Promise<FoodItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("foods")
    .insert([
      {
        ...foodData,
        benefits: foodData.benefits || [],
        conditions: foodData.conditions || [],
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating food item:", error)
    throw new Error("Failed to create food item")
  }

  return data
}

export async function updateFoodItem(id: string, updates: Partial<CreateFoodItemData>): Promise<FoodItem> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("foods").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating food item:", error)
    throw new Error("Failed to update food item")
  }

  return data
}

export async function deleteFoodItem(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("foods").delete().eq("id", id)

  if (error) {
    console.error("Error deleting food item:", error)
    throw new Error("Failed to delete food item")
  }
}

export async function getFoodCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("foods").select("category").order("category", { ascending: true })

  if (error) {
    console.error("Error fetching food categories:", error)
    return []
  }

  // Get unique categories
  const categories = [...new Set(data.map((item) => item.category))]
  return categories
}