import { FoodDetectionComponent } from "@/components/food-detection"

export default function FoodDetectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            AI Food Detection
          </h1>
          <p className="text-muted-foreground">
            Use your camera to detect food items and get instant nutritional information
          </p>
        </div>
        
        <FoodDetectionComponent />
      </div>
    </div>
  )
}
