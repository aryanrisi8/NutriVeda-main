"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Leaf, Thermometer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Food, getFoods, getFoodCategories, searchFoodsWithGemini } from "@/lib/database/foods"

const constitutions = ["All", "Vata", "Pitta", "Kapha"]
const seasons = ["All", "Spring", "Summer", "Monsoon", "Autumn", "Winter"]

export function FoodDatabase() {
  const [foodItems, setFoodItems] = useState<Food[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedConstitution, setSelectedConstitution] = useState("All")
  const [selectedSeason, setSelectedSeason] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadFoodItems()
    loadCategories()
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSearch(searchTerm.trim())
    }
  }

  const loadFoodItems = async () => {
    try {
      setLoading(true)
      const data = await getFoods()
      setFoodItems(data)
    } catch (error) {
      console.error("Failed to load food items:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await getFoodCategories()
      setCategories(["All", ...data])
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setSearching(true)
      const searchResults = await searchFoodsWithGemini(query)
      
      // Merge search results with existing food items (avoid duplicates)
      setFoodItems(prevItems => {
        const existingIds = new Set(prevItems.map(item => item.id))
        const newItems = searchResults.filter(item => !existingIds.has(item.id))
        return [...prevItems, ...newItems]
      })
      
      // Update categories if new ones were found
      const newCategories = [...new Set([
        ...categories.filter(cat => cat !== "All"),
        ...searchResults.map(food => food.category)
      ])]
      setCategories(["All", ...newCategories])
    } catch (error) {
      console.error("Failed to search foods:", error)
    } finally {
      setSearching(false)
    }
  }

  const filteredFoods = foodItems.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.benefits?.some((benefit: string) => benefit.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || food.category === selectedCategory
    const matchesSeason = selectedSeason === "All" || (food.best_season && food.best_season.includes(selectedSeason))

    let matchesConstitution = true
    if (selectedConstitution !== "All") {
      const compatibilityKey = `${selectedConstitution.toLowerCase()}_effect` as keyof Food
      const effect = food[compatibilityKey] as string
      matchesConstitution = effect === "Decrease" || effect === "Neutral" || effect === "N/A"
    }

    return matchesSearch && matchesCategory && matchesSeason && matchesConstitution
  })

  const getCompatibilityColor = (effect: string | null) => {
    switch (effect) {
      case "Decrease":
        return "text-success bg-success/10"
      case "Neutral":
        return "text-primary bg-primary/10"
      case "Increase":
        return "text-destructive bg-destructive/10"
      default:
        return "text-muted-foreground bg-muted/10"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading food database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="p-6">
          <div className="mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Food Database</h1>
              <p className="text-muted-foreground">
                Discover foods with their Ayurvedic properties and nutritional values
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                {searching ? (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  placeholder="Search foods, benefits, or conditions... (Press Enter to search)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Dosha Effect</label>
                  <Select value={selectedConstitution} onValueChange={setSelectedConstitution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {constitutions.map((constitution) => (
                        <SelectItem key={constitution} value={constitution}>
                          {constitution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Season</label>
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Food Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <Card key={food.id} className="medical-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src={
                      food.image_url || "/placeholder.svg?height=200&width=200&query=" + encodeURIComponent(food.name)
                    }
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">{food.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {food.category}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-medium text-foreground">{food.calories_per_100g || 0}</div>
                    <div className="text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-medium text-foreground">{food.protein_g || 0}g</div>
                    <div className="text-muted-foreground">Protein</div>
                  </div>
                </div>

                {/* Ayurvedic Properties */}
                {(food.rasa || food.virya) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      Ayurvedic Properties
                    </h4>
                    <div className="space-y-1 text-xs">
                      {food.rasa && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rasa:</span>
                          <span className="text-foreground">{food.rasa.join(', ')}</span>
                        </div>
                      )}
                      {food.virya && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Virya:</span>
                          <span className="text-foreground flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {food.virya}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Constitution Compatibility */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Dosha Effects</h4>
                  <div className="flex gap-1">
                    <Badge className={`text-xs ${getCompatibilityColor(food.vata_effect)}`}>
                      V: {food.vata_effect || "N/A"}
                    </Badge>
                    <Badge className={`text-xs ${getCompatibilityColor(food.pitta_effect)}`}>
                      P: {food.pitta_effect || "N/A"}
                    </Badge>
                    <Badge className={`text-xs ${getCompatibilityColor(food.kapha_effect)}`}>
                      K: {food.kapha_effect || "N/A"}
                    </Badge>
                  </div>
                </div>

                {/* Benefits */}
                {food.benefits && food.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Key Benefits</h4>
                    <div className="flex flex-wrap gap-1">
                      {food.benefits.slice(0, 3).map((benefit: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" size="sm">
                  Add to Meal Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFoods.length === 0 && !searching && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              {searchTerm.trim() 
                ? "Try adjusting your search or filters" 
                : "No foods found matching your criteria"
              }
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
                setSelectedConstitution("All")
                setSelectedSeason("All")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {searching && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching for foods...</p>
          </div>
        )}
      </div>
    </div>
  )
}