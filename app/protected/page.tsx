import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientQueue } from "@/components/patient-queue"
import { QuickToolsPanel } from "@/components/quick-tools-panel"
import { MainContent } from "@/components/main-content"

export default function ProtectedDashboard() {
  return (
    //<DashboardLayout>
      <div className="bg-background grid min-h-svh grid-cols-[minmax(16rem,20rem)_1fr_minmax(16rem,20rem)]">
        {/* Left Sidebar - Patient Queue */}
        <aside className="border-r border-border bg-accent min-w-64 max-w-80 overflow-hidden">
          <PatientQueue />
        </aside>

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-col">
          <MainContent />
        </main>

        {/* Right Panel - Quick Tools */}
        <aside className="border-l border-border bg-surface min-w-64 max-w-80 overflow-hidden">
          <QuickToolsPanel />
        </aside>
      </div>
    //</DashboardLayout>
  )
}
