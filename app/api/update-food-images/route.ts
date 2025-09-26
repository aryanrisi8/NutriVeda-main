import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/universal"
import { getEnhancedFoodImageUrl } from "@/lib/utils/food-images"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all foods that don't have images
    const { data: foodsWithoutImages, error: fetchError } = await supabase
      .from('foods')
      .select('id, name')
      .is('image_url', null)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch foods' },
        { status: 500 }
      )
    }

    if (!foodsWithoutImages || foodsWithoutImages.length === 0) {
      return NextResponse.json({ 
        message: 'All foods already have images',
        updated: 0 
      })
    }

    let updatedCount = 0

    // Update each food with an image URL
    for (const food of foodsWithoutImages) {
      const imageUrl = await getEnhancedFoodImageUrl(food.name)
      
      const { error: updateError } = await supabase
        .from('foods')
        .update({ image_url: imageUrl })
        .eq('id', food.id)

      if (!updateError) {
        updatedCount++
      } else {
        console.error(`Failed to update image for ${food.name}:`, updateError)
      }
    }

    return NextResponse.json({
      message: `Updated ${updatedCount} foods with images`,
      updated: updatedCount,
      total: foodsWithoutImages.length
    })

  } catch (error) {
    console.error('Update food images API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}