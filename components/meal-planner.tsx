"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus, Trash2, Clock, Users, Calculator, Save, FileText, AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getFoods, searchFoodsWithGemini } from "@/lib/database/foods"
import type { Food } from "@/lib/database/types"
import { getAllPatients, type Patient } from "@/lib/database/patients"
import { createMealPlan } from "@/lib/database/meal-plans"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { FoodItem as MealPlanFoodItem } from "@/lib/database/types"

interface MealSlot {
  id: string
  name: string
  time: string
  foods: Food[]
  targetCalories: number
}

const initialMeals: MealSlot[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    time: "7:00 AM",
    foods: [],
    targetCalories: 400,
  },
  {
    id: "lunch",
    name: "Lunch",
    time: "12:30 PM",
    foods: [],
    targetCalories: 600,
  },
  {
    id: "dinner",
    name: "Dinner",
    time: "7:00 PM",
    foods: [],
    targetCalories: 500,
  },
]

export function MealPlanner() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [availableFoods, setAvailableFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meals, setMeals] = useState<MealSlot[]>(initialMeals)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsData, foodsData] = await Promise.all([getAllPatients(), getFoods()])
        setPatients(patientsData)
        setAvailableFoods(foodsData)
      } catch (e) {
        setError("Failed to load data for meal planner.")
        toast({
          title: "Error",
          description: "Failed to load meal planner data from the database.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setSearching(true)
      const results = await searchFoodsWithGemini(searchTerm.trim())
      
      // Set search results for display
      setSearchResults(results)
      
      if (results.length > 0) {
        toast({
          title: "Search Complete", 
          description: `Found ${results.length} food item(s). Click to add to available foods.`,
        })
      } else {
        toast({
          title: "No Results",
          description: "No food items found for your search",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to search foods:", error)
      toast({
        title: "Search Failed",
        description: "Unable to search for foods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSearch()
    }
  }

  const addFoodFromSearch = (food: Food) => {
    // Check if food already exists in available foods
    const exists = availableFoods.some(item => item.id === food.id)
    if (!exists) {
      setAvailableFoods(prev => [...prev, food])
    }
    
    // Remove from search results after adding
    setSearchResults(prev => prev.filter(item => item.id !== food.id))
    
    toast({
      title: "Food Added",
      description: `${food.name} has been added to available foods`,
    })
  }

  const clearSearchResults = () => {
    setSearchResults([])
    setSearchTerm("")
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Find the food item being dragged
    const draggedFood = availableFoods.find((food) => food.id === draggableId)
    if (!draggedFood) return

    // If dropping from food list to meal slot
    if (source.droppableId === "available-foods" && destination.droppableId !== "available-foods") {
      const targetMealId = destination.droppableId
      const newMeals = meals.map((meal) => {
        if (meal.id === targetMealId) {
          const newFoods = [...meal.foods]
          // Store the full food object in the meal slot
          newFoods.splice(destination.index, 0, draggedFood)
          return { ...meal, foods: newFoods }
        }
        return meal
      })
      setMeals(newMeals)
    }

    // If moving within meal slots or between meal slots
    if (source.droppableId !== "available-foods" && destination.droppableId !== "available-foods") {
      const sourceMealId = source.droppableId
      const destMealId = destination.droppableId

      if (sourceMealId === destMealId) {
        // Moving within the same meal
        const meal = meals.find((m) => m.id === sourceMealId)
        if (meal) {
          const newFoods = [...meal.foods]
          const [removed] = newFoods.splice(source.index, 1)
          newFoods.splice(destination.index, 0, removed)

          const newMeals = meals.map((m) => (m.id === sourceMealId ? { ...m, foods: newFoods } : m))
          setMeals(newMeals)
        }
      } else {
        // Moving between different meals
        const sourceMeal = meals.find((m) => m.id === sourceMealId)
        const destMeal = meals.find((m) => m.id === destMealId)

        if (sourceMeal && destMeal) {
          const sourceFoods = [...sourceMeal.foods]
          const destFoods = [...destMeal.foods]
          const [removed] = sourceFoods.splice(source.index, 1)
          destFoods.splice(destination.index, 0, removed)

          const newMeals = meals.map((m) => {
            if (m.id === sourceMealId) return { ...m, foods: sourceFoods }
            if (m.id === destMealId) return { ...m, foods: destFoods }
            return m
          })
          setMeals(newMeals)
        }
      }
    }
  }

  const removeFoodFromMeal = (mealId: string, foodIndex: number) => {
    const newMeals = meals.map((meal) => {
      if (meal.id === mealId) {
        const newFoods = meal.foods.filter((_, index) => index !== foodIndex)
        return { ...meal, foods: newFoods }
      }
      return meal
    })
    setMeals(newMeals)
  }

  const handleSavePlan = async () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient to save the meal plan.",
        variant: "destructive"
      })
      return;
    }
    setIsSubmitting(true)

    try {
      // Convert the full food objects into the simplified MealPlanFoodItem format
      const mealsToSave: Record<string, MealPlanFoodItem[]> = meals.reduce((acc, meal) => {
        acc[meal.id] = meal.foods.map(food => ({
          food_id: food.id,
          food_name: food.name,
          quantity_g: 100,
          calories: food.calories_per_100g || 0,
          protein_g: food.protein_g || 0,
          carbs_g: food.carbs_g || 0,
          fat_g: food.fat_g || 0,
        }))
        return acc
      }, {} as Record<string, MealPlanFoodItem[]>)

      const mealPlanData = {
        patient_id: selectedPatient.id,
        plan_name: `Diet Plan for ${new Date().toLocaleDateString()}`,
        plan_date: new Date().toISOString().split('T')[0],
        breakfast_foods: mealsToSave.breakfast || [],
        lunch_foods: mealsToSave.lunch || [],
        dinner_foods: mealsToSave.dinner || [],
        snacks_foods: mealsToSave.snacks || [],
        notes: "Generated by Meal Planner",
      }

      await createMealPlan(mealPlanData)
      toast({
        title: "Success!",
        description: "Meal plan saved successfully.",
      })
    } catch (e) {
      setError("Failed to save meal plan.")
      toast({
        title: "Error",
        description: "Failed to save the meal plan.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateMealNutrition = (foods: Food[]) => {
    return foods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories_per_100g || 0),
        protein: acc.protein + (food.protein_g || 0),
        carbs: acc.carbs + (food.carbs_g || 0),
        fat: acc.fat + (food.fat_g || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  const calculateDayNutrition = () => {
    return meals.reduce(
      (acc, meal) => {
        const mealNutrition = calculateMealNutrition(meal.foods)
        return {
          calories: acc.calories + mealNutrition.calories,
          protein: acc.protein + mealNutrition.protein,
          carbs: acc.carbs + mealNutrition.carbs,
          fat: acc.fat + mealNutrition.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  const getCompatibilityColor = (effect: string | null | undefined) => {
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

  const getConstitutionDoshaEffect = (food: Food, dosha: 'vata' | 'pitta' | 'kapha') => {
    const effect = food[`${dosha}_effect`]
    return effect || 'N/A'
  }

  const calculateDoshaBalance = () => {
    const allFoods = meals.flatMap((meal) => meal.foods)
    if (allFoods.length === 0 || !selectedPatient) return { vata: 33, pitta: 33, kapha: 34 }

    const doshaScores = allFoods.reduce(
      (acc, food) => {
        const getScore = (effect: string | undefined) => {
          switch (effect) {
            case "Decrease":
              return 3
            case "Neutral":
              return 2
            case "Increase":
              return 1
            default:
              return 2
          }
        }
        
        return {
          vata: acc.vata + getScore(food.vata_effect),
          pitta: acc.pitta + getScore(food.pitta_effect),
          kapha: acc.kapha + getScore(food.kapha_effect),
        }
      },
      { vata: 0, pitta: 0, kapha: 0 },
    )

    const total = doshaScores.vata + doshaScores.pitta + doshaScores.kapha
    if(total === 0) return { vata: 33, pitta: 33, kapha: 34 }

    return {
      vata: Math.round((doshaScores.vata / total) * 100),
      pitta: Math.round((doshaScores.pitta / total) * 100),
      kapha: Math.round((doshaScores.kapha / total) * 100),
    }
  }

  const dayNutrition = calculateDayNutrition()
  const doshaBalance = calculateDoshaBalance()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meal planner...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground p-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Meal Planner</h1>
              <p className="text-muted-foreground">
                Create personalized meal plans for {selectedPatient?.name || 'a patient'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSavePlan} disabled={isSubmitting || !selectedPatient}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Plan"}
              </Button>
              <Button disabled={!selectedPatient}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Diet Chart
              </Button>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Select onValueChange={handlePatientSelect} value={selectedPatient?.id || ""}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPatient && (
              <>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Target: {selectedPatient.bmi} cal (placeholder)</span>
                </div>
                <div className="flex gap-1">
                  <Badge className="text-xs bg-primary/10 text-primary">V: {selectedPatient.vata_percentage}%</Badge>
                  <Badge className="text-xs bg-secondary/10 text-secondary">P: {selectedPatient.pitta_percentage}%</Badge>
                  <Badge className="text-xs bg-accent/10 text-accent">K: {selectedPatient.kapha_percentage}%</Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-200px)]">
          {/* Available Foods Sidebar */}
          <div className="w-80 border-r border-border bg-accent p-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Available Foods</h3>
            
            {/* Search Section */}
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  {searching ? (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    placeholder="Search foods... (Press Enter to search)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                    disabled={searching}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={!searchTerm.trim() || searching}
                  size="sm"
                >
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">Search Results</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchResults}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-background">
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      className="p-2 rounded border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => addFoodFromSearch(food)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{food.name}</p>
                          <p className="text-xs text-muted-foreground">{food.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">{food.calories_per_100g} cal</p>
                          <Plus className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click any food item to add it to your available foods list
                </p>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
              <Droppable droppableId="available-foods">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 ${snapshot.isDraggingOver ? "bg-muted/50 rounded-lg p-2" : ""}`}
                  >
                    {availableFoods.map((food, index) => (
                      <Draggable key={food.id} draggableId={food.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`medical-card p-3 cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-sm">{food.name}</h4>
                                <p className="text-xs text-muted-foreground">{food.category}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {food.calories_per_100g} cal
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Badge className={`text-xs ${getCompatibilityColor(food.vata_effect)}`}>V</Badge>
                              <Badge className={`text-xs ${getCompatibilityColor(food.pitta_effect)}`}>P</Badge>
                              <Badge className={`text-xs ${getCompatibilityColor(food.kapha_effect)}`}>K</Badge>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Meal Planning Area */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {meals.map((meal) => {
                const mealNutrition = calculateMealNutrition(meal.foods)
                const calorieProgress = selectedPatient ? (mealNutrition.calories / (selectedPatient.bmi || 1500)) * 100 : 0;

                return (
                  <Card key={meal.id} className="medical-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{meal.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {meal.time}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(mealNutrition.calories)} / {meal.targetCalories} cal
                          </div>
                          <Progress value={Math.min(calorieProgress, 100)} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Droppable droppableId={meal.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[200px] space-y-2 p-3 rounded-lg border-2 border-dashed transition-colors ${
                              snapshot.isDraggingOver
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/20 bg-muted/10"
                            }`}
                          >
                            {meal.foods.length === 0 && (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                  <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Drag foods here</p>
                                </div>
                              </div>
                            )}

                            {meal.foods.map((food, index) => (
                              <Draggable key={`${food.id}-${index}`} draggableId={`${food.id}-${index}`} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-surface border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing ${
                                      snapshot.isDragging ? "shadow-lg rotate-1" : ""
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm">{food.name}</h5>
                                        <p className="text-xs text-muted-foreground">
                                          {/* Use a fixed quantity for calculation and display */}
                                          100g • {Math.round(food.calories_per_100g || 0)} cal
                                        </p>
                                        <div className="flex gap-1 mt-1">
                                          {/* Use actual dosha effects from the food object */}
                                          <Badge className={`text-xs ${getCompatibilityColor(food.vata_effect)}`}>V</Badge>
                                          <Badge className={`text-xs ${getCompatibilityColor(food.pitta_effect)}`}>P</Badge>
                                          <Badge className={`text-xs ${getCompatibilityColor(food.kapha_effect)}`}>K</Badge>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFoodFromMeal(meal.id, index)}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Analysis Dashboard */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Real-time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="nutrition" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="nutrition">Modern Nutrition</TabsTrigger>
                    <TabsTrigger value="ayurvedic">Ayurvedic Balance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="nutrition" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{Math.round(dayNutrition.calories)}</div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                        <Progress
                          value={selectedPatient ? (dayNutrition.calories / (selectedPatient.bmi || 1500)) * 100 : 0}
                          className="mt-2"
                        />
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">{Math.round(dayNutrition.protein)}</div>
                        <div className="text-sm text-muted-foreground">Protein (g)</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-accent">{Math.round(dayNutrition.carbs)}</div>
                        <div className="text-sm text-muted-foreground">Carbs (g)</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-warning">{Math.round(dayNutrition.fat)}</div>
                        <div className="text-sm text-muted-foreground">Fat (g)</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ayurvedic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Dosha Balance</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Vata</span>
                            <span className="text-sm font-medium">{doshaBalance.vata}%</span>
                          </div>
                          <Progress value={doshaBalance.vata} className="h-2" />

                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pitta</span>
                            <span className="text-sm font-medium">{doshaBalance.pitta}%</span>
                          </div>
                          <Progress value={doshaBalance.pitta} className="h-2" />

                          <div className="flex items-center justify-between">
                            <span className="text-sm">Kapha</span>
                            <span className="text-sm font-medium">{doshaBalance.kapha}%</span>
                          </div>
                          <Progress value={doshaBalance.kapha} className="h-2" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-3">Constitutional Compatibility</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                            <span className="text-sm">Perfect for Pitta</span>
                            <Badge className="text-xs bg-success/20 text-success">Excellent</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-warning/10 rounded">
                            <span className="text-sm">PCOS Support</span>
                            <Badge className="text-xs bg-warning/20 text-warning">Good</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}