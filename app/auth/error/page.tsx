import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Leaf } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
              <AlertCircle className="h-16 w-16 text-error" />
            </div>
            <CardTitle className="text-2xl font-heading text-error">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {params?.error ? (
              <div className="bg-error/10 border border-error/20 p-4 rounded-md">
                <p className="text-sm text-error font-medium">Error Code: {params.error}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">An unspecified authentication error occurred.</p>
            )}

            <p className="text-sm text-muted-foreground">
              Please try signing in again or contact support if the problem persists.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/login">Try Again</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/sign-up">Create New Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
