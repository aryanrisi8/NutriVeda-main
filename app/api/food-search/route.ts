import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/universal"
import { getEnhancedFoodImageUrl } from "@/lib/utils/food-images"

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface FoodData {
  name: string
  category: string
  calories_per_100g: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  rasa: string[]
  virya: string
  vipaka: string
  vata_effect: string
  pitta_effect: string
  kapha_effect: string
  qualities: string[]
  best_season: string[]
  best_time: string[]
  benefits: string[]
  contraindications: string[]
}

async function fetchFoodDataFromGemini(foodName: string): Promise<FoodData | null> {
  try {
    const prompt = `Provide detailed nutritional and Ayurvedic information for "${foodName}" in JSON format. Include:
    {
      "name": "${foodName}",
      "category": "appropriate category (fruits, vegetables, grains, legumes, dairy, nuts, spices, meat, etc.)",
      "calories_per_100g": number,
      "protein_g": number per 100g,
      "carbs_g": number per 100g,
      "fat_g": number per 100g,
      "fiber_g": number per 100g,
      "rasa": ["taste1", "taste2"] (from: sweet, sour, salty, pungent, bitter, astringent),
      "virya": "Hot" or "Cold" or "Neutral",
      "vipaka": "Sweet" or "Sour" or "Pungent",
      "vata_effect": "Increase" or "Decrease" or "Neutral",
      "pitta_effect": "Increase" or "Decrease" or "Neutral", 
      "kapha_effect": "Increase" or "Decrease" or "Neutral",
      "qualities": ["quality1", "quality2"] (heavy, light, dry, oily, hot, cold, etc.),
      "best_season": ["season1", "season2"] (from: Spring, Summer, Monsoon, Autumn, Winter),
      "best_time": ["time1", "time2"] (morning, noon, evening, night),
      "benefits": ["benefit1", "benefit2", "benefit3"],
      "contraindications": ["condition1", "condition2"] if any
    }
    
    Respond ONLY with valid JSON, no additional text or explanation.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`)
    }

    const data: GeminiResponse = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error('No response from Gemini API')
    }

    // Extract JSON from the response (in case there's any extra text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : generatedText

    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error fetching from Gemini API:', error)
    return null
  }
}

async function addFoodToDatabase(foodData: FoodData): Promise<string | null> {
  try {
    const supabase = await createClient()
    
    // Generate image URL for the food using Gemini
    const imageUrl = await getEnhancedFoodImageUrl(foodData.name)
    
    const { data, error } = await supabase
      .from('foods')
      .insert([{
        name: foodData.name,
        category: foodData.category,
        calories_per_100g: foodData.calories_per_100g,
        protein_g: foodData.protein_g,
        carbs_g: foodData.carbs_g,
        fat_g: foodData.fat_g,
        fiber_g: foodData.fiber_g,
        rasa: foodData.rasa,
        virya: foodData.virya,
        vipaka: foodData.vipaka,
        vata_effect: foodData.vata_effect,
        pitta_effect: foodData.pitta_effect,
        kapha_effect: foodData.kapha_effect,
        qualities: foodData.qualities,
        best_season: foodData.best_season,
        best_time: foodData.best_time,
        benefits: foodData.benefits,
        contraindications: foodData.contraindications,
        image_url: imageUrl
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Error adding food to database:', error)
      return null
    }

    return data.id
  } catch (error) {
    console.error('Error adding food to database:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json()

    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json(
        { error: 'Search term is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First, search for existing foods
    const { data: existingFoods, error: searchError } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('name', { ascending: true })

    if (searchError) {
      return NextResponse.json(
        { error: 'Failed to search foods' },
        { status: 500 }
      )
    }

    // If we found existing foods, return them
    if (existingFoods && existingFoods.length > 0) {
      return NextResponse.json({ foods: existingFoods })
    }

    // If no existing foods found, try to fetch from Gemini API
    const foodData = await fetchFoodDataFromGemini(searchTerm)

    if (!foodData) {
      return NextResponse.json({ foods: [] })
    }

    // Add the new food to database
    const newFoodId = await addFoodToDatabase(foodData)

    if (!newFoodId) {
      return NextResponse.json({ foods: [] })
    }

    // Fetch the newly added food with its ID
    const { data: newFood, error: fetchError } = await supabase
      .from('foods')
      .select('*')
      .eq('id', newFoodId)
      .single()

    if (fetchError) {
      return NextResponse.json({ foods: [] })
    }

    return NextResponse.json({ foods: [newFood] })
    
  } catch (error) {
    console.error('Food search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}