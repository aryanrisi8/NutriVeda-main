-- NutriVeda Healthcare Management Database Schema
-- This script creates all necessary tables for the Ayurvedic diet planning platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for healthcare practitioners
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialization TEXT DEFAULT 'Ayurvedic Practitioner',
  license_number TEXT,
  clinic_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  medical_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  
  -- Ayurvedic Constitution (Prakriti)
  vata_percentage INTEGER DEFAULT 33 CHECK (vata_percentage >= 0 AND vata_percentage <= 100),
  pitta_percentage INTEGER DEFAULT 33 CHECK (pitta_percentage >= 0 AND pitta_percentage <= 100),
  kapha_percentage INTEGER DEFAULT 34 CHECK (kapha_percentage >= 0 AND kapha_percentage <= 100),
  
  -- Current Imbalance (Vikriti)
  current_vata INTEGER DEFAULT 33,
  current_pitta INTEGER DEFAULT 33,
  current_kapha INTEGER DEFAULT 34,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure constitution percentages add up to 100
  CONSTRAINT constitution_sum_check CHECK (vata_percentage + pitta_percentage + kapha_percentage = 100),
  CONSTRAINT current_constitution_sum_check CHECK (current_vata + current_pitta + current_kapha = 100)
);

-- Create foods table with Ayurvedic properties
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  
  -- Nutritional Information (per 100g)
  calories_per_100g INTEGER NOT NULL,
  protein_g DECIMAL(5,2) DEFAULT 0,
  carbs_g DECIMAL(5,2) DEFAULT 0,
  fat_g DECIMAL(5,2) DEFAULT 0,
  fiber_g DECIMAL(5,2) DEFAULT 0,
  
  -- Ayurvedic Properties
  rasa TEXT[] DEFAULT '{}', -- Six tastes: Sweet, Sour, Salty, Pungent, Bitter, Astringent
  virya TEXT CHECK (virya IN ('Hot', 'Cold', 'Neutral')), -- Heating/Cooling effect
  vipaka TEXT CHECK (vipaka IN ('Sweet', 'Sour', 'Pungent')), -- Post-digestive effect
  
  -- Dosha Effects
  vata_effect TEXT CHECK (vata_effect IN ('Increase', 'Decrease', 'Neutral')),
  pitta_effect TEXT CHECK (pitta_effect IN ('Increase', 'Decrease', 'Neutral')),
  kapha_effect TEXT CHECK (kapha_effect IN ('Increase', 'Decrease', 'Neutral')),
  
  -- Additional Properties
  qualities TEXT[], -- Light, Heavy, Dry, Oily, etc.
  best_season TEXT[], -- Spring, Summer, Monsoon, Autumn, Winter
  best_time TEXT[], -- Morning, Afternoon, Evening, Night
  
  -- Health Benefits
  benefits TEXT[],
  contraindications TEXT[],
  
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Meal structure
  breakfast_foods JSONB DEFAULT '[]',
  lunch_foods JSONB DEFAULT '[]',
  dinner_foods JSONB DEFAULT '[]',
  snacks_foods JSONB DEFAULT '[]',
  
  -- Nutritional totals
  total_calories INTEGER DEFAULT 0,
  total_protein DECIMAL(6,2) DEFAULT 0,
  total_carbs DECIMAL(6,2) DEFAULT 0,
  total_fat DECIMAL(6,2) DEFAULT 0,
  
  -- Ayurvedic Analysis
  dosha_balance_score INTEGER DEFAULT 0 CHECK (dosha_balance_score >= 0 AND dosha_balance_score <= 100),
  taste_balance_score INTEGER DEFAULT 0 CHECK (taste_balance_score >= 0 AND taste_balance_score <= 100),
  seasonal_alignment_score INTEGER DEFAULT 0 CHECK (seasonal_alignment_score >= 0 AND seasonal_alignment_score <= 100),
  
  notes TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Completed', 'Archived')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient progress tracking table
CREATE TABLE IF NOT EXISTS public.patient_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Progress metrics
  weight_kg DECIMAL(5,2),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  digestion_quality INTEGER CHECK (digestion_quality >= 1 AND digestion_quality <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  
  -- Current constitution assessment
  current_vata INTEGER DEFAULT 33,
  current_pitta INTEGER DEFAULT 33,
  current_kapha INTEGER DEFAULT 34,
  
  -- Symptoms and improvements
  symptoms TEXT[],
  improvements TEXT[],
  concerns TEXT[],
  
  notes TEXT,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT progress_constitution_sum_check CHECK (current_vata + current_pitta + current_kapha = 100)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for patients table
CREATE POLICY "Practitioners can view their own patients" ON public.patients
  FOR SELECT USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert patients" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their own patients" ON public.patients
  FOR UPDATE USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their own patients" ON public.patients
  FOR DELETE USING (auth.uid() = practitioner_id);

-- RLS Policies for foods table (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view foods" ON public.foods
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for meal_plans table
CREATE POLICY "Practitioners can view their own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = practitioner_id);

-- RLS Policies for patient_progress table
CREATE POLICY "Practitioners can view their patients' progress" ON public.patient_progress
  FOR SELECT USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert patient progress" ON public.patient_progress
  FOR INSERT WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update patient progress" ON public.patient_progress
  FOR UPDATE USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete patient progress" ON public.patient_progress
  FOR DELETE USING (auth.uid() = practitioner_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_practitioner_id ON public.patients(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_practitioner_id ON public.meal_plans(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_patient_id ON public.meal_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_progress_practitioner_id ON public.patient_progress(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patient_progress_patient_id ON public.patient_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON public.foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
