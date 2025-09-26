// Utility functions for generating food images
// Uses Unsplash API for high-quality food images

interface UnsplashImage {
  urls: {
    small: string;
    regular: string;
    thumb: string;
  };
  alt_description?: string;
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
}

export async function generateFoodImageUrl(foodName: string): Promise<string> {
  try {
    // Try to get a real image from Unsplash first
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      foodName + " food"
    )}&per_page=1&orientation=square`;

    const response = await fetch(unsplashUrl, {
      headers: {
        Authorization: "Client-ID YOUR_UNSPLASH_ACCESS_KEY", // You'll need to get this
      },
    });

    if (response.ok) {
      const data: UnsplashResponse = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
    }
  } catch (error) {
    console.log("Unsplash API not available, using fallback");
  }

  // Fallback to Foodish API (free food images)
  try {
    const foodishResponse = await fetch(
      "https://foodish-api.herokuapp.com/api/"
    );
    if (foodishResponse.ok) {
      const foodishData = await foodishResponse.json();
      if (foodishData.image) {
        return foodishData.image;
      }
    }
  } catch (error) {
    console.log("Foodish API not available, using placeholder");
  }

  // Final fallback to a food placeholder service
  return `https://source.unsplash.com/400x400/?${encodeURIComponent(
    foodName
  )},food`;
}

// Generate consistent placeholder URLs for specific foods
export function getFoodPlaceholderUrl(foodName: string): string {
  const cleanName = foodName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `https://source.unsplash.com/400x400/?${cleanName},food`;
}

// Map of common Indian foods to their specific image queries for better results
export const indianFoodImageMap: Record<string, string> = {
  "basmati rice": "basmati-rice-bowl",
  "brown rice": "brown-rice-bowl",
  wheat: "wheat-grains",
  quinoa: "quinoa-bowl",
  "mung dal": "mung-dal-curry",
  "toor dal": "toor-dal-curry",
  chickpeas: "chickpeas-curry",
  cucumber: "fresh-cucumber-slices",
  "bitter gourd": "bitter-gourd-vegetable",
  spinach: "fresh-spinach-leaves",
  carrot: "fresh-carrots",
  tomato: "fresh-tomatoes",
  apple: "red-apple-fresh",
  banana: "ripe-bananas",
  mango: "fresh-mango-fruit",
  pomegranate: "pomegranate-seeds",
  turmeric: "turmeric-powder-golden-spice",
  ginger: "fresh-ginger-root",
  cumin: "cumin-seeds-spice",
  coriander: "coriander-seeds-spice",
  "cow milk": "fresh-milk-glass",
  ghee: "clarified-butter-ghee",
  yogurt: "fresh-yogurt-bowl",
  almonds: "soaked-almonds-nuts",
  walnuts: "walnut-kernels",
  "sesame seeds": "sesame-seeds",
  "coconut water": "fresh-coconut-water-drink",
};

export function getEnhancedFoodImageUrl(foodName: string): string {
  const lowerName = foodName.toLowerCase();
  const mappedQuery =
    indianFoodImageMap[lowerName] || `${foodName.replace(/\s+/g, "-")}-food`;
  return `https://source.unsplash.com/400x400/?${mappedQuery}`;
}
