import { Calculator, Compass, Sun, Droplets, Flame, Mountain, Plus, FileText, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function QuickToolsPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Quick Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Constitution Wheel */}
        <Card className="medical-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Constitution Wheel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="dosha-wheel w-full h-full rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-surface rounded-full w-16 h-16 flex items-center justify-center border border-border">
                  <span className="text-xs font-medium text-foreground">Balance</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-3 w-3 text-primary" />
                  <span>Vata</span>
                </div>
                <span className="font-medium">40%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-secondary" />
                  <span>Pitta</span>
                </div>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mountain className="h-3 w-3 text-accent" />
                  <span>Kapha</span>
                </div>
                <span className="font-medium">35%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Calculator */}
        <Card className="medical-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4 text-secondary" />
              BMI Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">22.5</div>
                <div className="text-xs text-muted-foreground">Normal Weight</div>
              </div>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                Recalculate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Tips */}
        <Card className="medical-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sun className="h-4 w-4 text-accent" />
              Seasonal Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Winter Season:</strong>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Favor warm, cooked foods</li>
                <li>• Include warming spices</li>
                <li>• Reduce cold, raw foods</li>
                <li>• Stay hydrated with warm drinks</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button size="sm" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Create Healing Plan
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start bg-transparent" asChild>
            <Link href="/protected/food-detection">
              <Camera className="h-4 w-4 mr-2" />
              AI Food Detection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
