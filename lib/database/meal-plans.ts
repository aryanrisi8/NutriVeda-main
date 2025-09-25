import { createClient } from "@/lib/supabase/universal"
import type { MealPlan, CreateMealPlanData } from "./types"

export async function getMealPlans(): Promise<MealPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      patients!inner(name, vata_percentage, pitta_percentage, kapha_percentage)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching meal plans:", error)
    throw new Error("Failed to fetch meal plans")
  }

  return data || []
}

export async function getMealPlanById(id: string): Promise<MealPlan | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      patients!inner(name, vata_percentage, pitta_percentage, kapha_percentage)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching meal plan:", error)
    return null
  }

  return data
}

export async function getMealPlansByPatient(patientId: string): Promise<MealPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("patient_id", patientId)
    .order("plan_date", { ascending: false })

  if (error) {
    console.error("Error fetching meal plans by patient:", error)
    throw new Error("Failed to fetch meal plans by patient")
  }

  return data || []
}

export async function createMealPlan(mealPlanData: CreateMealPlanData): Promise<MealPlan> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  // Calculate nutritional totals
  const allFoods = [
    ...mealPlanData.breakfast_foods,
    ...mealPlanData.lunch_foods,
    ...mealPlanData.dinner_foods,
    ...mealPlanData.snacks_foods,
  ]

  const totals = allFoods.reduce(
    (acc, food) => ({
      total_calories: acc.total_calories + food.calories,
      total_protein: acc.total_protein + food.protein_g,
      total_carbs: acc.total_carbs + food.carbs_g,
      total_fat: acc.total_fat + food.fat_g,
    }),
    { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 },
  )

  const { data, error } = await supabase
    .from("meal_plans")
    .insert({
      ...mealPlanData,
      practitioner_id: user.id,
      ...totals,
      dosha_balance_score: 85, // TODO: Calculate based on patient constitution and foods
      taste_balance_score: 80, // TODO: Calculate based on six tastes
      seasonal_alignment_score: 75, // TODO: Calculate based on current season
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating meal plan:", error)
    throw new Error("Failed to create meal plan")
  }

  return data
}

export async function updateMealPlan(id: string, mealPlanData: Partial<CreateMealPlanData>): Promise<MealPlan> {
  const supabase = await createClient()

  // Recalculate totals if foods are updated
  let updateData: any = { ...mealPlanData }

  if (
    mealPlanData.breakfast_foods ||
    mealPlanData.lunch_foods ||
    mealPlanData.dinner_foods ||
    mealPlanData.snacks_foods
  ) {
    const allFoods = [
      ...(mealPlanData.breakfast_foods || []),
      ...(mealPlanData.lunch_foods || []),
      ...(mealPlanData.dinner_foods || []),
      ...(mealPlanData.snacks_foods || []),
    ]

    const totals = allFoods.reduce(
      (acc, food) => ({
        total_calories: acc.total_calories + food.calories,
        total_protein: acc.total_protein + food.protein_g,
        total_carbs: acc.total_carbs + food.carbs_g,
        total_fat: acc.total_fat + food.fat_g,
      }),
      { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 },
    )

    updateData = { ...updateData, ...totals }
  }

  const { data, error } = await supabase.from("meal_plans").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating meal plan:", error)
    throw new Error("Failed to update meal plan")
  }

  return data
}

export async function deleteMealPlan(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("meal_plans").delete().eq("id", id)

  if (error) {
    console.error("Error deleting meal plan:", error)
    throw new Error("Failed to delete meal plan")
  }
}