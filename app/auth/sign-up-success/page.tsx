import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Leaf } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">NutriVeda</h1>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-heading text-success">Account Created Successfully!</CardTitle>
            <CardDescription>Please check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We've sent a verification email to your registered email address. Please click the verification link to
              activate your NutriVeda account and start helping patients with personalized Ayurvedic diet plans.
            </p>

            <div className="bg-accent/10 border border-accent/20 p-4 rounded-md">
              <p className="text-sm text-accent font-medium">
                💡 Tip: Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href="/auth/login">Return to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
