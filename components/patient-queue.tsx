// File: components/patient-queue.tsx

"use client"

import { Search, Clock, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { getAllPatients, type Patient } from "@/lib/database/patients"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PatientProfile } from "@/components/patient-profile"

export function PatientQueue() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [open, setOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true)
        const patientsData = await getAllPatients()
        setPatients(patientsData)
      } catch (e) {
        console.error(e)
        setError("Failed to load patient queue.")
        toast({
          title: "Error",
          description: "Failed to load patient queue.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
    const supabase = createClient()
    const ch = supabase
      .channel('queue-patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, async () => {
        const patientsData = await getAllPatients()
        setPatients(patientsData)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [toast])

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Patient Queue</h2>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Patient Queue</h2>
        <div className="text-center text-muted-foreground p-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // NOTE: This is placeholder data for the constitution bars, you may need to fetch more detailed data or calculate it
  const getConstitutionDominant = (vata: number, pitta: number, kapha: number) => {
    const max = Math.max(vata, pitta, kapha)
    if (vata === max) return "Vata"
    if (pitta === max) return "Pitta"
    return "Kapha"
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Patient Queue</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {patients.length > 0 ? (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="p-4 cursor-pointer rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedPatient(patient);
                setOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-foreground">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">Age {patient.age}</p>
                </div>
                <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Visit: {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : "N/A"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  <span className="text-warning">{patient.condition}</span>
                </div>

                {/* Constitution Indicator */}
                <div className="flex gap-1 mt-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${patient.vata_percentage}%` }}
                    title={`Vata: ${patient.vata_percentage}%`}
                  />
                  <div
                    className="h-2 rounded-full bg-secondary"
                    style={{ width: `${patient.pitta_percentage}%` }}
                    title={`Pitta: ${patient.pitta_percentage}%`}
                  />
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${patient.kapha_percentage}%` }}
                    title={`Kapha: ${patient.kapha_percentage}%`}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground p-6">No patients added yet.</div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground text-center">{patients.length} patients in queue</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Profile{selectedPatient ? ` - ${selectedPatient.name}` : ""}</DialogTitle>
          </DialogHeader>
          {selectedPatient && <PatientProfile patient={selectedPatient} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}