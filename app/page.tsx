import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/universal"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  // If user is authenticated, redirect to protected dashboard
  if (!error && data?.user) {
    redirect("/protected")
  }

  return (
    <div className="min-h-screen bg-background botanical-pattern">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">NutriVeda</h1>
            <p className="text-xl text-muted-foreground mb-8">Professional Ayurvedic Diet Planning Software</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare management platform designed for Ayurvedic practitioners, dietitians, and
              wellness professionals to create personalized nutrition plans based on ancient wisdom and modern science.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Patient Management</CardTitle>
                <CardDescription>Comprehensive patient profiles with Ayurvedic constitution analysis</CardDescription>
              </CardHeader>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Food Database</CardTitle>
                <CardDescription>
                  Extensive database of foods with Ayurvedic properties and nutritional data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Meal Planning</CardTitle>
                <CardDescription>Create personalized meal plans based on individual constitution</CardDescription>
              </CardHeader>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>Track patient progress and analyze treatment effectiveness</CardDescription>
              </CardHeader>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Constitution Analysis</CardTitle>
                <CardDescription>Detailed Vata, Pitta, Kapha assessment and recommendations</CardDescription>
              </CardHeader>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Appointment Scheduling</CardTitle>
                <CardDescription>Integrated calendar and appointment management system</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Built for healthcare professionals who integrate traditional Ayurvedic principles with modern nutritional
              science.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}