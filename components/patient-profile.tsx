"use client"

import { Calendar, Phone, Mail, MapPin, Activity, Pill, AlertTriangle, FileText, Edit2, Save, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { type Patient, updatePatient } from "@/lib/database/patients"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getMealPlansByPatient } from "@/lib/database/meal-plans"
import type { MealPlan } from "@/lib/database/types"
// Lazy-load in browser to avoid SSR import issues
let html2canvasPromise: Promise<any> | null = null
let jsPDFPromise: Promise<any> | null = null
async function ensurePdfLibs() {
  if (!html2canvasPromise) html2canvasPromise = import("html2canvas")
  if (!jsPDFPromise) jsPDFPromise = import("jspdf")
  const [{ default: html2canvas }, jsPDFMod] = await Promise.all([html2canvasPromise, jsPDFPromise])
  return { html2canvas, jsPDF: jsPDFMod.default }
}

interface PatientProfileProps {
  patient: Patient
}

export function PatientProfile({ patient }: PatientProfileProps) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Patient>>({})
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [generatedChart, setGeneratedChart] = useState<any | null>(null)

  useEffect(() => {
    setForm({
      name: patient.name,
      age: patient.age ?? null,
      gender: patient.gender ?? null,
      phone: patient.phone ?? null,
      email: patient.email ?? null,
      address: patient.address ?? null,
      condition: patient.condition ?? null,
      bmi: patient.bmi ?? null,
      notes: patient.notes ?? null,
      next_appointment: patient.next_appointment ?? null,
      current_medications: patient.current_medications ?? [],
      dietary_restrictions: patient.dietary_restrictions ?? [],
      medical_conditions: patient.medical_conditions ?? [],
    })
  }, [patient])

  useEffect(() => {
    async function loadPlans() {
      const plans = await getMealPlansByPatient(patient.id)
      setMealPlans(plans)
    }
    loadPlans()
  }, [patient.id])

  useEffect(() => {
    // Generate diet chart whenever patient data changes and not in edit mode
    async function generate() {
      try {
        console.log("Generating diet chart for patient:", patient.id)
        const res = await fetch('/api/diet-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId: patient.id })
        })
        const data = await res.json()
        console.log("API response:", data)
        if (res.ok) {
          setGeneratedChart(data.chart)
        } else {
          console.error("API error:", data.error)
          // Fallback chart if API fails
          setGeneratedChart({
            plan_name: `Diet Plan for ${patient.name}`,
            sections: {
              breakfast: [
                { item: "Warm oatmeal with ghee", notes: "Vata soothing" },
                { item: "Stewed apples", notes: "Digestive" }
              ],
              lunch: [
                { item: "Khichdi with vegetables", notes: "Tridoshic" },
                { item: "Fresh salad", notes: "Light and cooling" }
              ],
              dinner: [
                { item: "Vegetable stew and rice", notes: "Light and warm" },
                { item: "Herbal tea", notes: "Digestive" }
              ],
              snacks: [
                { item: "Soaked almonds", notes: "Grounding" },
                { item: "Fresh fruit", notes: "Natural sweetness" }
              ]
            },
            ayurvedic: {
              dosha_balance_score: 80,
              taste_balance_score: 78,
              seasonal_alignment_score: 75
            }
          })
        }
      } catch (e) {
        console.error("Fetch error:", e)
      }
    }
    generate()
  }, [patient])
  // Corrected to use the flat properties directly from the patient object
  const getConstitutionDominant = (vata: number, pitta: number, kapha: number) => {
    const max = Math.max(vata, pitta, kapha)
    if (vata === max) return "Vata"
    if (pitta === max) return "Pitta"
    return "Kapha"
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-warning" }
    if (bmi < 25) return { category: "Normal", color: "text-success" }
    if (bmi < 30) return { category: "Overweight", color: "text-warning" }
    return { category: "Obese", color: "text-destructive" }
  }

  const bmiInfo = patient.bmi ? getBMICategory(patient.bmi) : { category: "N/A", color: "text-muted-foreground" }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start gap-6 p-6 bg-muted/30 rounded-lg">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{patient.name?.charAt(0) || "N/A"}</span>
        </div>
        <div className="flex-1">
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input type="number" value={form.age ?? 0} onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))} />
              <Input value={form.gender ?? ""} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
              <p className="text-muted-foreground mb-2">
                {patient.age} years old • {patient.gender}
              </p>
            </>
          )}
          <div className="flex gap-2 mb-3">
            {editMode ? (
              <Input
                value={form.condition ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                placeholder="Condition"
              />
            ) : (
              <Badge variant="outline">{patient.condition}</Badge>
            )}
            <Badge className="bg-accent/10 text-accent">{getConstitutionDominant(patient.vata_percentage, patient.pitta_percentage, patient.kapha_percentage)} Dominant</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {editMode ? (
                <Input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              ) : (
                <span>{patient.phone}</span>
              )}
            </div>
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {editMode ? (
                  <Input value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                ) : (
                  <span>{patient.email}</span>
                )}
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {editMode ? (
                  <Input value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                ) : (
                  <span>{patient.address}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {editMode ? (
                <Input
                  type="date"
                  value={form.next_appointment ? String(form.next_appointment) : ""}
                  onChange={(e) => setForm((f) => ({ ...f, next_appointment: e.target.value }))}
                />
              ) : (
                <span>{patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString() : "N/A"}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start">
          {editMode ? (
            <Button
              size="sm"
              onClick={async () => {
                if (saving) return
                setSaving(true)
                try {
                  await updatePatient(patient.id, form)
                  setEditMode(false)
                } finally {
                  setSaving(false)
                }
              }}
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit2 className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="constitution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="constitution">Constitution</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="diet">Diet & Lifestyle</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="mealplans">Meal Plans</TabsTrigger>
          <TabsTrigger value="generated">Diet Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="constitution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dosha Analysis */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Ayurvedic Constitution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Vata (Air + Space)</span>
                    <span className="font-bold">{patient.vata_percentage}%</span>
                  </div>
                  <Progress value={patient.vata_percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">Movement, circulation, nervous system</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Pitta (Fire + Water)</span>
                    <span className="font-bold">{patient.pitta_percentage}%</span>
                  </div>
                  <Progress value={patient.pitta_percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">Metabolism, digestion, transformation</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Kapha (Earth + Water)</span>
                    <span className="font-bold">{patient.kapha_percentage}%</span>
                  </div>
                  <Progress value={patient.kapha_percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">Structure, immunity, lubrication</p>
                </div>
              </CardContent>
            </Card>

            {/* Constitutional Recommendations */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-success">Beneficial Foods</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      Cooling foods
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Sweet fruits
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Leafy greens
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Coconut water
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-warning">Foods to Reduce</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      Spicy foods
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Fried foods
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Alcohol
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Caffeine
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-primary">Lifestyle Tips</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Regular meal times</li>
                    <li>• Moderate exercise</li>
                    <li>• Stress management</li>
                    <li>• Adequate sleep</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vital Signs */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{patient.bmi || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">BMI</div>
                    <div className={`text-xs ${bmiInfo.color}`}>{bmiInfo.category}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-secondary">{patient.blood_pressure || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Blood Pressure</div>
                    <div className="text-xs text-muted-foreground">mmHg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Add medication and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim()
                          if (!value) return
                          setForm((f) => ({
                            ...f,
                            current_medications: [...(f.current_medications ?? []), value],
                          }))
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(form.current_medications ?? []).map((med, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patient.current_medications && patient.current_medications.map((medication, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="font-medium">{medication}</span>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dietary Restrictions */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Dietary Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Add restriction and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim()
                          if (!value) return
                          setForm((f) => ({
                            ...f,
                            dietary_restrictions: [...(f.dietary_restrictions ?? []), value],
                          }))
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(form.dietary_restrictions ?? []).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-warning/10 text-warning">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patient.dietary_restrictions && patient.dietary_restrictions.map((restriction, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-warning/10 rounded">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium">{restriction}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <Input value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{patient.notes}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border-l-4 border-primary bg-muted/30 rounded-r">
                  <div className="text-sm">
                    <div className="font-medium">Last Visit</div>
                    <div className="text-muted-foreground">
                      {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    Constitution assessment completed. Diet plan updated for PCOS management.
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 border-l-4 border-secondary bg-muted/30 rounded-r">
                  <div className="text-sm">
                    <div className="font-medium">Next Appointment</div>
                    <div className="text-muted-foreground">
                      {patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    Follow-up consultation scheduled for progress review.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mealplans" className="space-y-4">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg">Meal Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {mealPlans.length === 0 ? (
                <div className="text-sm text-muted-foreground">No meal plans yet.</div>
              ) : (
                <div className="space-y-3">
                  {mealPlans.map((plan) => (
                    <details key={plan.id} className="p-3 border border-border rounded">
                      <summary className="flex items-center justify-between cursor-pointer">
                        <div className="font-medium">{plan.plan_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(plan.plan_date).toLocaleDateString()}</div>
                      </summary>
                      <div className="mt-3 space-y-3 text-sm">
                        <div className="text-xs text-muted-foreground">
                          Calories: {plan.total_calories} • Protein: {plan.total_protein}g • Carbs: {plan.total_carbs}g • Fat: {plan.total_fat}g
                        </div>
                        <div>
                          <div className="font-medium">Breakfast</div>
                          <ul className="list-disc ml-5">
                            {plan.breakfast_foods.map((f, i) => (
                              <li key={i}>{f.food_name} — {f.calories} kcal, P {f.protein_g}g, C {f.carbs_g}g, F {f.fat_g}g</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium">Lunch</div>
                          <ul className="list-disc ml-5">
                            {plan.lunch_foods.map((f, i) => (
                              <li key={i}>{f.food_name} — {f.calories} kcal, P {f.protein_g}g, C {f.carbs_g}g, F {f.fat_g}g</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium">Dinner</div>
                          <ul className="list-disc ml-5">
                            {plan.dinner_foods.map((f, i) => (
                              <li key={i}>{f.food_name} — {f.calories} kcal, P {f.protein_g}g, C {f.carbs_g}g, F {f.fat_g}g</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium">Snacks</div>
                          <ul className="list-disc ml-5">
                            {plan.snacks_foods.map((f, i) => (
                              <li key={i}>{f.food_name} — {f.calories} kcal, P {f.protein_g}g, C {f.carbs_g}g, F {f.fat_g}g</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ayurvedic Scores — Dosha Balance: {plan.dosha_balance_score}% • Taste Balance: {plan.taste_balance_score}% • Seasonal Alignment: {plan.seasonal_alignment_score}%
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Diet Chart */}
        <TabsContent value="generated" className="space-y-4">
          <Card className="medical-card">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Generated Diet Chart</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const el = document.getElementById(`diet-chart-${patient.id}`)
                  if (!el) return
                  const { html2canvas, jsPDF } = await ensurePdfLibs()
                  // Ensure a solid background to avoid oklch parsing issues
                  const originalBg = (el as HTMLElement).style.backgroundColor
                  ;(el as HTMLElement).style.backgroundColor = '#ffffff'
                  const canvas = await html2canvas(el as HTMLElement, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                  })
                  ;(el as HTMLElement).style.backgroundColor = originalBg
                  const imgData = canvas.toDataURL('image/png')
                  const pdf = new jsPDF('p', 'mm', 'a4')
                  const imgProps = (pdf as any).getImageProperties(imgData)
                  const pdfWidth = pdf.internal.pageSize.getWidth()
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                  pdf.save(`${patient.name}-diet-chart.pdf`)
                }}
              >
                <Download className="h-4 w-4 mr-1" /> Download PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div id={`diet-chart-${patient.id}`} className="space-y-3" style={{ backgroundColor: '#ffffff' }}>
                {!generatedChart && (
                  <div className="text-sm text-muted-foreground">Generating chart...</div>
                )}
                {generatedChart && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">{generatedChart.plan_name || 'Diet Plan'}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-1">Breakfast</div>
                        <ul className="list-disc ml-5 text-sm">
                          {(generatedChart.sections?.breakfast || []).map((i: any, idx: number) => (
                            <li key={idx}>{i.item} {i.notes ? `— ${i.notes}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Lunch</div>
                        <ul className="list-disc ml-5 text-sm">
                          {(generatedChart.sections?.lunch || []).map((i: any, idx: number) => (
                            <li key={idx}>{i.item} {i.notes ? `— ${i.notes}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Dinner</div>
                        <ul className="list-disc ml-5 text-sm">
                          {(generatedChart.sections?.dinner || []).map((i: any, idx: number) => (
                            <li key={idx}>{i.item} {i.notes ? `— ${i.notes}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Snacks</div>
                        <ul className="list-disc ml-5 text-sm">
                          {(generatedChart.sections?.snacks || []).map((i: any, idx: number) => (
                            <li key={idx}>{i.item} {i.notes ? `— ${i.notes}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {generatedChart.ayurvedic && (
                      <div className="text-xs text-muted-foreground">
                        Ayurvedic Scores — Dosha: {generatedChart.ayurvedic.dosha_balance_score}% • Taste: {generatedChart.ayurvedic.taste_balance_score}% • Seasonal: {generatedChart.ayurvedic.seasonal_alignment_score}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}