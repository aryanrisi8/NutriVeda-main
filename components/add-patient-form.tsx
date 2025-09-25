"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createPatient, type CreatePatientData } from "@/lib/database/patients"

interface AddPatientFormProps {
  onSuccess: () => void
}

const constitutionQuestions = [
  {
    id: 1,
    category: "Physical Build",
    question: "What's your body size?",
    options: ["Medium", "Slim", "Large"],
    doshaMapping: [1, 2, 0] // Pitta, Vata, Kapha
  },
  {
    id: 2,
    category: "Physical Build", 
    question: "How would you describe your body weight?",
    options: ["Moderate - no difficulties in gaining or losing weight", "Low - difficulties in gaining weight", "Heavy - difficulties in losing weight"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 3,
    category: "Physical Build",
    question: "What's your height category?",
    options: ["Average", "Short", "Tall"],
    doshaMapping: [1, 0, 2]
  },
  {
    id: 4,
    category: "Physical Build",
    question: "How would you describe your bone structure?",
    options: ["Large, broad shoulders, heavy bone structure", "Medium bone structure", "Light, Small bones, prominent joints"],
    doshaMapping: [0, 1, 2]
  },
  {
    id: 5,
    category: "Physical Build",
    question: "What's your complexion?",
    options: ["White, pale, tans easily", "Fair-skin sunburns easily", "Dark-Complexion, tans easily"],
    doshaMapping: [0, 2, 1]
  },
  {
    id: 6,
    category: "Hair & Facial Features",
    question: "What's your hair color?",
    options: ["Black/Brown, dull", "Red, light brown, yellow", "Brown"],
    doshaMapping: [0, 1, 2]
  },
  {
    id: 7,
    category: "Hair & Facial Features",
    question: "How would you describe your hair appearance?",
    options: ["Straight, oily", "Dry, black, knotted, brittle", "Thick, curly"],
    doshaMapping: [0, 2, 1]
  },
  {
    id: 8,
    category: "Hair & Facial Features",
    question: "What's your face shape?",
    options: ["Long, angular, thin", "Large, round, full", "Heart-shaped, pointed chin"],
    doshaMapping: [2, 0, 1]
  },
  {
    id: 9,
    category: "Hair & Facial Features",
    question: "How would you describe your eyes?",
    options: ["Medium-sized, penetrating, light-sensitive eyes", "Small, active, darting, dark eyes", "Big, round, beautiful, glowing eyes"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 10,
    category: "Hair & Facial Features",
    question: "How are your eyelashes?",
    options: ["Moderate eyelashes", "Scanty eyelashes", "Thick/Fused eyelashes"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 11,
    category: "Hair & Facial Features",
    question: "How often do you blink?",
    options: ["Moderate Blinking", "Excessive Blinking", "More or less stable"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 12,
    category: "Hair & Facial Features",
    question: "How would you describe your cheeks?",
    options: ["Wrinkled, Sunken", "Smooth, Flat", "Rounded, Plump"],
    doshaMapping: [2, 1, 0]
  },
  {
    id: 13,
    category: "Hair & Facial Features",
    question: "What's your nose shape?",
    options: ["Rounded, Large open nostrils", "Crooked, Narrow", "Pointed, Average"],
    doshaMapping: [0, 2, 1]
  },
  {
    id: 14,
    category: "Oral & Nail Features",
    question: "How are your teeth and gums?",
    options: ["Big, White, Strong teeth, Healthy gums", "Medium-sized teeth, Reddish gums", "Irregular, Protruding teeth, Receding gums"],
    doshaMapping: [0, 1, 2]
  },
  {
    id: 15,
    category: "Oral & Nail Features",
    question: "How would you describe your lips?",
    options: ["Tight, thin, dry lips which chaps easily", "Lips are soft, medium-sized", "Lips are large, soft, pink, and full"],
    doshaMapping: [2, 1, 0]
  },
  {
    id: 16,
    category: "Oral & Nail Features",
    question: "How are your nails?",
    options: ["Thick, Oily, Smooth, Polished", "Dry, Rough, Brittle, Break", "Sharp, Flexible, Pink, Lustrous"],
    doshaMapping: [0, 2, 1]
  },
  {
    id: 17,
    category: "Digestive & Metabolic",
    question: "How is your appetite?",
    options: ["Slow but steady", "Strong, Unbearable", "Irregular, Scanty"],
    doshaMapping: [0, 1, 2]
  },
  {
    id: 18,
    category: "Digestive & Metabolic",
    question: "Which tastes do you prefer?",
    options: ["Sweet / Sour / Salty", "Sweet / Bitter / Astringent", "Pungent / Bitter / Astringent"],
    doshaMapping: [0, 2, 1]
  },
  {
    id: 19,
    category: "Digestive & Metabolic",
    question: "What's your metabolism type?",
    options: ["fast", "moderate", "slow"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 20,
    category: "Digestive & Metabolic",
    question: "How is your digestion?",
    options: ["moderate", "strong", "weak"],
    doshaMapping: [0, 1, 2]
  },
  {
    id: 21,
    category: "Digestive & Metabolic",
    question: "How much water do you drink?",
    options: ["moderate", "high", "low"],
    doshaMapping: [0, 1, 2]
  },
  {
    id: 22,
    category: "Environmental & Lifestyle",
    question: "Which climate do you prefer?",
    options: ["warm", "cool", "moderate"],
    doshaMapping: [2, 1, 0]
  },
  {
    id: 23,
    category: "Environmental & Lifestyle", 
    question: "What's your activity level?",
    options: ["moderate", "sedentary", "high"],
    doshaMapping: [1, 0, 2]
  },
  {
    id: 24,
    category: "Environmental & Lifestyle",
    question: "What are your sleep patterns?",
    options: ["moderate", "short", "long"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 25,
    category: "Environmental & Lifestyle",
    question: "What are your dietary preferences?",
    options: ["vegan", "vegetarian", "omnivorous"],
    doshaMapping: [2, 1, 0]
  },
  {
    id: 26,
    category: "Stress & Sensitivity",
    question: "How do you handle stress?",
    options: ["moderate", "low", "high"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 27,
    category: "Stress & Sensitivity",
    question: "How sensitive is your skin?",
    options: ["sensitive", "normal", "insensitive"],
    doshaMapping: [1, 2, 0]
  },
  {
    id: 28,
    category: "Additional Characteristics",
    question: "What is your general feel of skin?",
    options: ["Dry and thin, cool to touch, rough", "Smooth and warm, oily T-zone", "Thick and moist/greasy, cold"],
    doshaMapping: [2, 1, 0]
  },
  {
    id: 29,
    category: "Additional Characteristics",
    question: "What is your texture of skin?",
    options: ["Dry, pigments and aging", "Oily", "Freckles, many moles, redness and rashes"],
    doshaMapping: [2, 0, 1]
  }
]

export function AddPatientForm({ onSuccess }: AddPatientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    condition: "",
    bmi: "",
    bloodPressure: "",
    medications: "",
    dietaryRestrictions: "",
    notes: "",
  })

  const [constitutionAnswers, setConstitutionAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateDoshaPercentages = () => {
    const doshaScores = [0, 0, 0] // Kapha, Pitta, Vata
    let totalAnswers = 0

    Object.entries(constitutionAnswers).forEach(([questionId, answerIndex]) => {
      const question = constitutionQuestions.find(q => q.id === parseInt(questionId))
      if (question && question.doshaMapping[answerIndex] !== undefined) {
        doshaScores[question.doshaMapping[answerIndex]]++
        totalAnswers++
      }
    })

    if (totalAnswers === 0) return { vata: 33, pitta: 33, kapha: 34 }

    const percentages = doshaScores.map(score => Math.round((score / totalAnswers) * 100))
    
    // Ensure percentages sum to 100
    const sum = percentages.reduce((a, b) => a + b, 0)
    if (sum !== 100) {
      percentages[0] += (100 - sum)
    }

    return {
      kapha: percentages[0],
      pitta: percentages[1], 
      vata: percentages[2]
    }
  }

  const handleConstitutionAnswer = (questionId: number, answerIndex: number) => {
    setConstitutionAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.name || !formData.age || !formData.gender || !formData.phone) {
        setError("Please fill out all required fields: Name, Age, Gender, and Phone Number.")
        setIsSubmitting(false)
        return;
    }

    try {
      const doshaPercentages = calculateDoshaPercentages()
      
      const patientData: CreatePatientData = {
        name: formData.name,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        condition: formData.condition || undefined,
        vata_percentage: doshaPercentages.vata,
        pitta_percentage: doshaPercentages.pitta,
        kapha_percentage: doshaPercentages.kapha,
        bmi: formData.bmi ? Number.parseFloat(formData.bmi) : undefined,
        blood_pressure: formData.bloodPressure || undefined,
        current_medications: formData.medications
          ? formData.medications
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean)
          : [],
        dietary_restrictions: formData.dietaryRestrictions
          ? formData.dietaryRestrictions
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)
          : [],
        notes: formData.notes || undefined,
      }

      await createPatient(patientData)
      onSuccess()
    } catch (err) {
      console.error("Error creating patient:", err)
      setError("Failed to create patient. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const groupedQuestions = constitutionQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, typeof constitutionQuestions>)

  const doshaPercentages = calculateDoshaPercentages()

  return (
    <div className="max-h-screen overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="condition">Primary Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PCOS">PCOS</SelectItem>
                  <SelectItem value="Diabetes Type 2">Diabetes Type 2</SelectItem>
                  <SelectItem value="Digestive Issues">Digestive Issues</SelectItem>
                  <SelectItem value="Hypertension">Hypertension</SelectItem>
                  <SelectItem value="Obesity">Obesity</SelectItem>
                  <SelectItem value="Anxiety">Anxiety</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                placeholder="List current medications, separated by commas"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietaryRestrictions"
                placeholder="List dietary restrictions, separated by commas"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ayurvedic Constitution Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Ayurvedic Constitution Assessment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Answer all questions to determine your constitutional type. Current percentages: 
              Vata: {doshaPercentages.vata}% | Pitta: {doshaPercentages.pitta}% | Kapha: {doshaPercentages.kapha}%
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedQuestions).map(([category, questions]) => (
              <div key={category} className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">{category}</h4>
                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {question.id}/29. {question.question}
                    </Label>
                    <RadioGroup
                      value={constitutionAnswers[question.id]?.toString() || ""}
                      onValueChange={(value) => handleConstitutionAnswer(question.id, parseInt(value))}
                      disabled={isSubmitting}
                    >
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`q${question.id}-${index}`} />
                          <Label htmlFor={`q${question.id}-${index}`} className="text-sm cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Clinical Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes about the patient..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => onSuccess()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Patient..." : "Add Patient"}
          </Button>
        </div>
      </form>
    </div>
  )
}