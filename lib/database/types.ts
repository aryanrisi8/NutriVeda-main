// Database types for NutriVeda healthcare platform
export interface Profile {
  id: string
  first_name: string
  last_name: string
  specialization: string
  license_number?: string
  clinic_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  practitioner_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: "Male" | "Female" | "Other"
  height_cm?: number
  weight_kg?: number
  medical_conditions?: string[]
  allergies?: string[]
  current_medications?: string[]

  // Ayurvedic Constitution (Prakriti)
  vata_percentage: number
  pitta_percentage: number
  kapha_percentage: number

  // Current Imbalance (Vikriti)
  current_vata: number
  current_pitta: number
  current_kapha: number

  notes?: string
  created_at: string
  updated_at: string
}

export interface Food {
  id: string
  name: string
  category: string

  // Nutritional Information (per 100g)
  calories_per_100g: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number

  // Ayurvedic Properties
  rasa?: string[] // Six tastes
  virya?: "Hot" | "Cold" | "Neutral" // Heating/Cooling effect
  vipaka?: "Sweet" | "Sour" | "Pungent" // Post-digestive effect

  // Dosha Effects
  vata_effect?: "Increase" | "Decrease" | "Neutral"
  pitta_effect?: "Increase" | "Decrease" | "Neutral"
  kapha_effect?: "Increase" | "Decrease" | "Neutral"

  // Additional Properties
  qualities?: string[]
  best_season?: string[]
  best_time?: string[]

  // Health Benefits
  benefits?: string[]
  contraindications?: string[]

  image_url?: string
  created_at: string
  updated_at: string
}

export interface MealPlan {
  id: string
  practitioner_id: string
  patient_id: string
  plan_name: string
  plan_date: string

  // Meal structure
  breakfast_foods: FoodItem[]
  lunch_foods: FoodItem[]
  dinner_foods: FoodItem[]
  snacks_foods: FoodItem[]

  // Nutritional totals
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number

  // Ayurvedic Analysis
  dosha_balance_score: number
  taste_balance_score: number
  seasonal_alignment_score: number

  notes?: string
  status: "Draft" | "Active" | "Completed" | "Archived"

  created_at: string
  updated_at: string
}

export interface FoodItem {
  food_id: string
  food_name: string
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface PatientProgress {
  id: string
  practitioner_id: string
  patient_id: string

  // Progress metrics
  weight_kg?: number
  energy_level?: number // 1-10 scale
  digestion_quality?: number // 1-10 scale
  sleep_quality?: number // 1-10 scale
  stress_level?: number // 1-10 scale

  // Current constitution assessment
  current_vata: number
  current_pitta: number
  current_kapha: number

  // Symptoms and improvements
  symptoms?: string[]
  improvements?: string[]
  concerns?: string[]

  notes?: string
  assessment_date: string
  created_at: string
}

// Form types for creating/updating records
export interface CreatePatientData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: "Male" | "Female" | "Other"
  height_cm?: number
  weight_kg?: number
  medical_conditions?: string[]
  allergies?: string[]
  current_medications?: string[]
  vata_percentage: number
  pitta_percentage: number
  kapha_percentage: number
  current_vata: number
  current_pitta: number
  current_kapha: number
  notes?: string
}

export interface CreateMealPlanData {
  patient_id: string
  plan_name: string
  plan_date: string
  breakfast_foods: FoodItem[]
  lunch_foods: FoodItem[]
  dinner_foods: FoodItem[]
  snacks_foods: FoodItem[]
  notes?: string
}

export interface CreateProgressData {
  patient_id: string
  weight_kg?: number
  energy_level?: number
  digestion_quality?: number
  sleep_quality?: number
  stress_level?: number
  current_vata: number
  current_pitta: number
  current_kapha: number
  symptoms?: string[]
  improvements?: string[]
  concerns?: string[]
  notes?: string
  assessment_date: string
}
