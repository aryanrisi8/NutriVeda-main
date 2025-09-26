"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, BarChart3, Users, Database, Utensils, Target, Camera } from "lucide-react"
import Link from "next/link"
import { getAllPatients, getPatientStats } from "@/lib/database/patients"
import { getMealPlans } from "@/lib/database/meal-plans"
import type { MealPlan } from "@/lib/database/types"
import { createClient } from "@/lib/supabase/client"

export function MainContent() {
  const [totalPatients, setTotalPatients] = useState(0)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [recent, setRecent] = useState<Array<{ type: string; title: string; when: string }>>([])

  useEffect(() => {
    async function load() {
      const [stats, plans, patients] = await Promise.all([
        getPatientStats(),
        getMealPlans(),
        getAllPatients(),
      ])
      setTotalPatients(stats.total)
      setMealPlans(plans)

      const events: Array<{ type: string; title: string; when: string; ts: number }> = []
      for (const p of patients) {
        if (p.created_at) events.push({ type: "Patient Added", title: p.name, when: new Date(p.created_at).toLocaleString(), ts: new Date(p.created_at).getTime() })
        if (p.updated_at) events.push({ type: "Patient Updated", title: p.name, when: new Date(p.updated_at).toLocaleString(), ts: new Date(p.updated_at).getTime() })
      }
      for (const m of plans) {
        const createdAt = (m as any).created_at
        if (createdAt) events.push({ type: "Meal Plan Added", title: m.plan_name, when: new Date(createdAt).toLocaleString(), ts: new Date(createdAt).getTime() })
      }
      events.sort((a, b) => b.ts - a.ts)
      setRecent(events.slice(0, 8).map(({ type, title, when }) => ({ type, title, when })))
    }
    load()

    const supabase = createClient()
    const chPatients = supabase
      .channel("front-patients")
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, async () => {
        const [stats, plans, patients] = await Promise.all([
          getPatientStats(),
          getMealPlans(),
          getAllPatients(),
        ])
        setTotalPatients(stats.total)
        setMealPlans(plans)
        const events: Array<{ type: string; title: string; when: string; ts: number }> = []
        for (const p of patients) {
          if (p.created_at) events.push({ type: "Patient Added", title: p.name, when: new Date(p.created_at).toLocaleString(), ts: new Date(p.created_at).getTime() })
          if (p.updated_at) events.push({ type: "Patient Updated", title: p.name, when: new Date(p.updated_at).toLocaleString(), ts: new Date(p.updated_at).getTime() })
        }
        for (const m of plans) {
          const createdAt = (m as any).created_at
          if (createdAt) events.push({ type: "Meal Plan Added", title: m.plan_name, when: new Date(createdAt).toLocaleString(), ts: new Date(createdAt).getTime() })
        }
        events.sort((a, b) => b.ts - a.ts)
        setRecent(events.slice(0, 8).map(({ type, title, when }) => ({ type, title, when })))
      })
      .subscribe()

    const chPlans = supabase
      .channel("front-meal_plans")
      .on("postgres_changes", { event: "*", schema: "public", table: "meal_plans" }, async () => {
        const plans = await getMealPlans()
        setMealPlans(plans)
        const patients = await getAllPatients()
        const events: Array<{ type: string; title: string; when: string; ts: number }> = []
        for (const p of patients) {
          if (p.created_at) events.push({ type: "Patient Added", title: p.name, when: new Date(p.created_at).toLocaleString(), ts: new Date(p.created_at).getTime() })
          if (p.updated_at) events.push({ type: "Patient Updated", title: p.name, when: new Date(p.updated_at).toLocaleString(), ts: new Date(p.updated_at).getTime() })
        }
        for (const m of plans) {
          const createdAt = (m as any).created_at
          if (createdAt) events.push({ type: "Meal Plan Added", title: m.plan_name, when: new Date(createdAt).toLocaleString(), ts: new Date(createdAt).getTime() })
        }
        events.sort((a, b) => b.ts - a.ts)
        setRecent(events.slice(0, 8).map(({ type, title, when }) => ({ type, title, when })))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(chPatients)
      supabase.removeChannel(chPlans)
    }
  }, [])
  return (
    <div className="flex-1 flex flex-col">
      {/* Breadcrumb Navigation */}
      <div className="h-12 border-b border-border bg-muted/30 px-6 flex items-center">
        <nav className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground">Patient Overview</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Ready to create healing plans with ancient wisdom</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/protected/patients">
                <Plus className="h-4 w-4 mr-2" />
                New Patient
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/protected/food-detection">
                <Camera className="h-4 w-4 mr-2" />
                AI Food Detection
              </Link>
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="medical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <p className="text-3xl font-bold text-primary">{totalPatients}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="medical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meal Plans Created</p>
                    <p className="text-3xl font-bold text-secondary">{mealPlans.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FCD7AD] text-foreground p-6 border border-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Patient Management</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage patient profiles with constitution tracking
                </p>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/protected/patients">Manage Patients</Link>
                </Button>
              </div>

              <div className="bg-[#F6C28B] text-foreground p-6 border border-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Database className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">Food Database</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse foods with Ayurvedic properties and nutritional data
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/protected/food-database">Browse Foods</Link>
                </Button>
              </div>

              <div className="bg-[#60935D] text-foreground p-6 border border-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-foreground/20 flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">Meal Planner</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Create personalized meal plans with drag-and-drop interface
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/protected/meal-planner">Plan Meals</Link>
                </Button>
              </div>

              <div className="bg-[#14342B] text-white p-6 border border-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-semibold text-white">Analytics</h3>
                </div>
                <p className="text-sm text-muted-white mb-4">
                  View comprehensive nutrition and Ayurvedic compliance reports
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/protected/analysis">View Analytics</Link>
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              {recent.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent activity.</div>
              ) : (
                <div className="space-y-3">
                  {recent.map((e, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="text-sm"><span className="font-medium">{e.type}</span>: {e.title}</div>
                      <span className="text-xs text-muted-foreground">{e.when}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Patient Management</h3>
                <Button asChild>
                  <Link href="/protected/patients">View All Patients</Link>
                </Button>
              </div>
              <p className="text-muted-foreground">
                Comprehensive patient management with Ayurvedic constitution tracking and medical history.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="nutrition">
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Nutrition Tools</h3>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/protected/food-database">Food Database</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/protected/meal-planner">Meal Planner</Link>
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">
                Access our comprehensive database of foods with Ayurvedic properties and create personalized meal plans.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Analytics & Reports</h3>
                <Button asChild>
                  <Link href="/protected/analysis">View Dashboard</Link>
                </Button>
              </div>
              <p className="text-muted-foreground">
                Comprehensive analytics combining modern nutrition tracking with Ayurvedic compliance monitoring.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
