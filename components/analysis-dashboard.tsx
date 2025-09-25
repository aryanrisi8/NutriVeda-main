"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Activity, Target, Calendar, Download, Share, FileText, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { getAllPatients, getPatientStats, type Patient } from "@/lib/database/patients"
import { getMealPlans } from "@/lib/database/meal-plans"
import type { MealPlan } from "@/lib/database/types"
import { createClient } from "@/lib/supabase/client"

// Hardcoded data for the requested charts
const hardcodedNutritionTrends = [
  { date: "Jan 1", calories: 1450, protein: 65, carbs: 180, fat: 55, target: 1500 },
  { date: "Jan 2", calories: 1520, protein: 70, carbs: 190, fat: 58, target: 1500 },
  { date: "Jan 3", calories: 1380, protein: 62, carbs: 175, fat: 52, target: 1500 },
  { date: "Jan 4", calories: 1600, protein: 75, carbs: 200, fat: 62, target: 1500 },
  { date: "Jan 5", calories: 1480, protein: 68, carbs: 185, fat: 56, target: 1500 },
  { date: "Jan 6", calories: 1550, protein: 72, carbs: 195, fat: 59, target: 1500 },
  { date: "Jan 7", calories: 1420, protein: 64, carbs: 178, fat: 54, target: 1500 },
];

const hardcodedDoshaBalance = [
  { date: "Week 1", vata: 45, pitta: 35, kapha: 20 },
  { date: "Week 2", vata: 42, pitta: 38, kapha: 20 },
  { date: "Week 3", vata: 40, pitta: 40, kapha: 20 },
  { date: "Week 4", vata: 38, pitta: 42, kapha: 20 },
];

const hardcodedSixTastes = [
  { taste: "Sweet", current: 35, ideal: 30, color: "#4caf50" },
  { taste: "Sour", current: 15, ideal: 20, color: "#ff8c42" },
  { taste: "Salty", current: 10, ideal: 15, color: "#2196f3" },
  { taste: "Pungent", current: 20, ideal: 15, color: "#f44336" },
  { taste: "Bitter", current: 12, ideal: 10, color: "#9c27b0" },
  { taste: "Astringent", current: 8, ideal: 10, color: "#607d8b" },
];

// Helper function to calculate average of a property from an array of objects
const getAverage = (data: any[], key: string) => {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (item[key] || 0), 0);
  return Math.round(sum / data.length);
};

export function AnalysisDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recent, setRecent] = useState<Array<{ type: string; title: string; when: string }>>([]);
  const [patientStats, setPatientStats] = useState({
    total: 0,
    active: 0,
    followUp: 0,
    dueToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [patientsData, mealPlansData, statsData] = await Promise.all([
          getAllPatients(),
          getMealPlans(),
          getPatientStats(),
        ]);
        setPatients(patientsData);
        setMealPlans(mealPlansData);
        setPatientStats(statsData);
        // Build recent activity (latest 8 entries)
        const events: Array<{ type: string; title: string; when: string; ts: number }> = [];
        for (const p of patientsData) {
          if (p.created_at) events.push({ type: 'Patient Added', title: p.name, when: new Date(p.created_at).toLocaleString(), ts: new Date(p.created_at).getTime() });
          if (p.updated_at) events.push({ type: 'Patient Updated', title: p.name, when: new Date(p.updated_at).toLocaleString(), ts: new Date(p.updated_at).getTime() });
        }
        for (const m of mealPlansData) {
          // @ts-ignore created_at is present on meal_plans
          if ((m as any).created_at) events.push({ type: 'Meal Plan Added', title: m.plan_name, when: new Date((m as any).created_at).toLocaleString(), ts: new Date((m as any).created_at).getTime() });
        }
        events.sort((a, b) => b.ts - a.ts);
        setRecent(events.slice(0, 8).map(({ type, title, when }) => ({ type, title, when })));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Realtime updates
    const supabase = createClient();
    const patientsChannel = supabase
      .channel('realtime-patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, async () => {
        const [patientsData, statsData, plans] = await Promise.all([getAllPatients(), getPatientStats(), getMealPlans()]);
        setPatients(patientsData);
        setPatientStats(statsData);
        setMealPlans(plans);
        const events: Array<{ type: string; title: string; when: string; ts: number }> = [];
        for (const p of patientsData) {
          if (p.created_at) events.push({ type: 'Patient Added', title: p.name, when: new Date(p.created_at).toLocaleString(), ts: new Date(p.created_at).getTime() });
          if (p.updated_at) events.push({ type: 'Patient Updated', title: p.name, when: new Date(p.updated_at).toLocaleString(), ts: new Date(p.updated_at).getTime() });
        }
        for (const m of plans) {
          // @ts-ignore
          if ((m as any).created_at) events.push({ type: 'Meal Plan Added', title: m.plan_name, when: new Date((m as any).created_at).toLocaleString(), ts: new Date((m as any).created_at).getTime() });
        }
        events.sort((a, b) => b.ts - a.ts);
        setRecent(events.slice(0, 8).map(({ type, title, when }) => ({ type, title, when })));
      })
      .subscribe();

    const mealPlansChannel = supabase
      .channel('realtime-meal_plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans' }, async () => {
        const data = await getMealPlans();
        setMealPlans(data);
        const events: Array<{ type: string; title: string; when: string; ts: number }> = [];
        for (const p of patients) {
          if (p.created_at) events.push({ type: 'Patient Added', title: p.name, when: new Date(p.created_at).toLocaleString(), ts: new Date(p.created_at).getTime() });
          if (p.updated_at) events.push({ type: 'Patient Updated', title: p.name, when: new Date(p.updated_at).toLocaleString(), ts: new Date(p.updated_at).getTime() });
        }
        for (const m of data) {
          // @ts-ignore
          if ((m as any).created_at) events.push({ type: 'Meal Plan Added', title: m.plan_name, when: new Date((m as any).created_at).toLocaleString(), ts: new Date((m as any).created_at).getTime() });
        }
        events.sort((a, b) => b.ts - a.ts);
        setRecent(events.slice(0, 8).map(({ type, title, when }) => ({ type, title, when })));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(patientsChannel);
      supabase.removeChannel(mealPlansChannel);
    }
  }, []);

  const displayedMealPlans = selectedPatientId === "all" ? mealPlans : mealPlans.filter(p => p.patient_id === selectedPatientId);

  // Calculate dynamic data
  const averageDoshaBalanceScore = getAverage(displayedMealPlans, 'dosha_balance_score');
  const averageTasteBalanceScore = getAverage(displayedMealPlans, 'taste_balance_score');
  const totalMealPlans = mealPlans.length;
  
  const constitutionData = patients.length > 0 ? [
    { name: "Vata", value: getAverage(patients, 'vata_percentage'), color: "#2d5016" },
    { name: "Pitta", value: getAverage(patients, 'pitta_percentage'), color: "#3e7b27" },
    { name: "Kapha", value: getAverage(patients, 'kapha_percentage'), color: "#f4a261" },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-success bg-success/10";
      case "good":
        return "text-primary bg-primary/10";
      case "needs-attention":
        return "text-warning bg-warning/10";
      default:
        return "text-muted-foreground bg-muted/10";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Analysis Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive nutrition and Ayurvedic compliance analytics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value="7d" onValueChange={() => {}}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Analysis</TabsTrigger>
            <TabsTrigger value="ayurvedic">Ayurvedic Compliance</TabsTrigger>
            <TabsTrigger value="patients">Patient Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">85%</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +2.5% from last week
                  </p>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meal Plans Created</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{mealPlans.length}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Increased creation
                  </p>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{patientStats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    {patientStats.active} Active Patients
                  </p>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{patientStats.dueToday}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Patients requiring follow-up
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Nutrition Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hardcodedNutritionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="calories" stroke="#2d5016" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" stroke="#f4a261" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Constitution Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={constitutionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {constitutionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity moved to front page */}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            {/* Detailed Nutrition Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Macronutrient Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={hardcodedNutritionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="protein" stackId="1" stroke="#2d5016" fill="#2d5016" />
                      <Area type="monotone" dataKey="carbs" stackId="1" stroke="#3e7b27" fill="#3e7b27" />
                      <Area type="monotone" dataKey="fat" stackId="1" stroke="#f4a261" fill="#f4a261" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Daily Nutrition Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calories</span>
                      <span className="text-sm">1480 / 1500</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Protein</span>
                      <span className="text-sm">68g / 75g</span>
                    </div>
                    <Progress value={90.7} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Carbohydrates</span>
                      <span className="text-sm">185g / 200g</span>
                    </div>
                    <Progress value={92.5} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fat</span>
                      <span className="text-sm">56g / 60g</span>
                    </div>
                    <Progress value={93.3} className="h-2" />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">94%</div>
                      <div className="text-sm text-muted-foreground">Overall Compliance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Micronutrients */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Micronutrient Analysis</CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { name: "Vitamin D", value: 85, unit: "IU" },
                      { name: "Iron", value: 92, unit: "mg" },
                      { name: "Calcium", value: 78, unit: "mg" },
                      { name: "B12", value: 95, unit: "mcg" },
                      { name: "Folate", value: 88, unit: "mcg" },
                      { name: "Magnesium", value: 82, unit: "mg" },
                    ].map((nutrient) => (
                      <div key={nutrient.name} className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-primary">{nutrient.value}%</div>
                        <div className="text-sm text-muted-foreground">{nutrient.name}</div>
                        <Progress value={nutrient.value} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="ayurvedic" className="space-y-6">
            {/* Ayurvedic Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Dosha Balance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hardcodedDoshaBalance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="vata" stroke="#2d5016" strokeWidth={2} name="Vata" />
                      <Line type="monotone" dataKey="pitta" stroke="#3e7b27" strokeWidth={2} name="Pitta" />
                      <Line type="monotone" dataKey="kapha" stroke="#f4a261" strokeWidth={2} name="Kapha" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Six Tastes Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hardcodedSixTastes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="taste" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current" fill="#2d5016" name="Current" />
                      <Bar dataKey="ideal" fill="#f4a261" name="Ideal" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Ayurvedic Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Constitutional Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-success">Excellent Choices</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs bg-success/10 text-success">
                        Cooling foods
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-success/10 text-success">
                        Sweet fruits
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-success/10 text-success">
                        Coconut water
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-warning">Reduce Intake</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                        Spicy foods
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                        Fried items
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                        Caffeine
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-primary">Seasonal Adjustments</h4>
                    <p className="text-sm text-muted-foreground">
                      Winter season: Include more warming spices and cooked foods. Reduce cold, raw foods.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <CardTitle>Compliance Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-success">85%</div>
                    <div className="text-sm text-muted-foreground">Ayurvedic Compliance</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Constitutional Match</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taste Balance</span>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            {/* Patient Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hardcoded patient progress data */}
              {patients.map((patient) => (
                <Card key={patient.id} className="medical-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <Badge>{patient.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vata</span>
                        <span className="text-sm font-medium">{patient.vata_percentage}%</span>
                      </div>
                      <Progress value={patient.vata_percentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pitta</span>
                        <span className="text-sm font-medium">{patient.pitta_percentage}%</span>
                      </div>
                      <Progress value={patient.pitta_percentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Kapha</span>
                        <span className="text-sm font-medium">{patient.kapha_percentage}%</span>
                      </div>
                      <Progress value={patient.kapha_percentage} className="h-2" />
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">Last updated: {patient.updated_at ? new Date(patient.updated_at).toLocaleString() : 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Patient Analytics */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Patient Progress Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={hardcodedNutritionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke="#2d5016" strokeWidth={2} name="Meera Patel" />
                    <Line type="monotone" dataKey="protein" stroke="#3e7b27" strokeWidth={2} name="Rajesh Kumar" />
                    <Line type="monotone" dataKey="carbs" stroke="#f4a261" strokeWidth={2} name="Priya Singh" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}