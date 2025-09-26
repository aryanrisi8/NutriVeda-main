// Utility functions for generating food images using Gemini Image Generation

interface GeminiImageResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        inlineData?: {
          mimeType: string
          data: string
        }
      }>
    }
  }>
}

export async function generateFoodImageDescriptionWithGemini(foodName: string): Promise<string | null> {
  try {
    const prompt = `Describe ${foodName} in detail for finding the best food photograph. Include:
- Physical appearance (color, texture, shape)
- Traditional presentation style
- Key visual characteristics
- Cultural context if relevant
Provide just 3-5 descriptive keywords separated by commas that would help find the best photo.`

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
      console.error(`Gemini API request failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!description) {
      console.error('No description returned from Gemini')
      return null
    }

    return description.trim()

  } catch (error) {
    console.error('Error getting description from Gemini:', error)
    return null
  }
}

export async function generateFoodImageUrl(foodName: string): Promise<string> {
  // Create a food-specific image using a reliable pattern
  const cleanName = foodName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
  
  // Use Picsum with a deterministic seed based on food name
  const seed = foodName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  // Use Lorem Picsum with seed for consistent images
  return `https://picsum.photos/seed/${Math.abs(seed)}/400/400`
}

// Generate consistent placeholder URLs for specific foods
export function getFoodPlaceholderUrl(foodName: string): string {
  const cleanName = foodName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return `https://source.unsplash.com/400x400/?${cleanName},food`
}

// Map of common Indian foods to their specific image queries for better results
export const indianFoodImageMap: Record<string, string> = {
  'basmati rice': 'basmati-rice-bowl',
  'brown rice': 'brown-rice-bowl', 
  'wheat': 'wheat-grains',
  'quinoa': 'quinoa-bowl',
  'mung dal': 'mung-dal-curry',
  'toor dal': 'toor-dal-curry',
  'chickpeas': 'chickpeas-curry',
  'cucumber': 'fresh-cucumber-slices',
  'bitter gourd': 'bitter-gourd-vegetable',
  'spinach': 'fresh-spinach-leaves',
  'carrot': 'fresh-carrots',
  'tomato': 'fresh-tomatoes',
  'apple': 'red-apple-fresh',
  'banana': 'ripe-bananas',
  'mango': 'fresh-mango-fruit',
  'pomegranate': 'pomegranate-seeds',
  'turmeric': 'turmeric-powder-golden-spice',
  'ginger': 'fresh-ginger-root',
  'cumin': 'cumin-seeds-spice',
  'coriander': 'coriander-seeds-spice',
  'cow milk': 'fresh-milk-glass',
  'ghee': 'clarified-butter-ghee',
  'yogurt': 'fresh-yogurt-bowl',
  'almonds': 'soaked-almonds-nuts',
  'walnuts': 'walnut-kernels',
  'sesame seeds': 'sesame-seeds',
  'coconut water': 'fresh-coconut-water-drink'
}

// Predefined high-quality food images
const foodImageUrls: Record<string, string> = {
  // Default food categories with reliable images
  'fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
  'grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'legumes': 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=400&h=400&fit=crop',
  'dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
  'nuts': 'https://images.unsplash.com/photo-1508747702445-c3c7b2e5005a?w=400&h=400&fit=crop',
  'spices': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
  'seeds': 'https://images.unsplash.com/photo-1627213292687-7ad89efab3c5?w=400&h=400&fit=crop'
}

// Specific food images
const specificFoodImages: Record<string, string> = {
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
  'banana': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop',
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'basmati rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'cucumber': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop',
  'tomato': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop',
  'carrot': 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
  'almonds': 'https://images.unsplash.com/photo-1508747702445-c3c7b2e5005a?w=400&h=400&fit=crop',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
  'yogurt': 'https://images.unsplash.com/photo-1571212515416-57a87e98fe3d?w=400&h=400&fit=crop',
  'turmeric': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
  'ginger': 'https://images.unsplash.com/photo-1607533809178-8bce8c15fb96?w=400&h=400&fit=crop'
}

export async function getEnhancedFoodImageUrl(foodName: string): Promise<string> {
  const lowerName = foodName.toLowerCase().trim()
  
  // Check for specific food images first (high quality Unsplash images)
  if (specificFoodImages[lowerName]) {
    return specificFoodImages[lowerName]
  }
  
  // Check for partial matches
  for (const [key, url] of Object.entries(specificFoodImages)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return url
    }
  }
  
  // Use category-based high-quality images
  if (lowerName.includes('rice') || lowerName.includes('wheat') || lowerName.includes('quinoa')) {
    return foodImageUrls['grains']
  }
  if (lowerName.includes('dal') || lowerName.includes('lentil') || lowerName.includes('bean')) {
    return foodImageUrls['legumes']
  }
  if (lowerName.includes('apple') || lowerName.includes('mango') || lowerName.includes('fruit')) {
    return foodImageUrls['fruits']
  }
  if (lowerName.includes('vegetable') || lowerName.includes('gourd') || lowerName.includes('leaf')) {
    return foodImageUrls['vegetables']
  }
  if (lowerName.includes('milk') || lowerName.includes('ghee') || lowerName.includes('yogurt')) {
    return foodImageUrls['dairy']
  }
  if (lowerName.includes('almond') || lowerName.includes('walnut') || lowerName.includes('nut')) {
    return foodImageUrls['nuts']
  }
  if (lowerName.includes('seed')) {
    return foodImageUrls['seeds']
  }
  if (lowerName.includes('spice') || lowerName.includes('turmeric') || lowerName.includes('cumin')) {
    return foodImageUrls['spices']
  }
  
  // For new/unknown foods, generate a consistent placeholder image
  return await generateFoodImageUrl(foodName)
}

// Synchronous version for backward compatibility
export function getEnhancedFoodImageUrlSync(foodName: string): string {
  const lowerName = foodName.toLowerCase().trim()
  
  // Check for specific food image first
  if (specificFoodImages[lowerName]) {
    return specificFoodImages[lowerName]
  }
  
  // Check for partial matches
  for (const [key, url] of Object.entries(specificFoodImages)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return url
    }
  }
  
  // Fallback to category-based images (same logic as above)
  if (lowerName.includes('rice') || lowerName.includes('wheat') || lowerName.includes('quinoa')) {
    return foodImageUrls['grains']
  }
  if (lowerName.includes('dal') || lowerName.includes('lentil') || lowerName.includes('bean')) {
    return foodImageUrls['legumes']
  }
  if (lowerName.includes('apple') || lowerName.includes('mango') || lowerName.includes('fruit')) {
    return foodImageUrls['fruits']
  }
  if (lowerName.includes('vegetable') || lowerName.includes('gourd') || lowerName.includes('leaf')) {
    return foodImageUrls['vegetables']
  }
  if (lowerName.includes('milk') || lowerName.includes('ghee') || lowerName.includes('yogurt')) {
    return foodImageUrls['dairy']
  }
  if (lowerName.includes('almond') || lowerName.includes('walnut') || lowerName.includes('nut')) {
    return foodImageUrls['nuts']
  }
  if (lowerName.includes('seed')) {
    return foodImageUrls['seeds']
  }
  if (lowerName.includes('spice') || lowerName.includes('turmeric') || lowerName.includes('cumin')) {
    return foodImageUrls['spices']
  }
  
  // Final fallback - generic healthy food image
  return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop'
}