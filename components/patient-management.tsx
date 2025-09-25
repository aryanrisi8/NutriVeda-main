"use client"

import { useState, useEffect } from "react"
import { Search, Plus, User, Calendar, Phone, Mail, MapPin, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PatientProfile } from "@/components/patient-profile"
import { AddPatientForm } from "@/components/add-patient-form"
import { type Patient, getAllPatients, updatePatient } from "@/lib/database/patients"
import { Input as TextInput } from "@/components/ui/input"

interface PatientStats {
  total: number
  active: number
  followUp: number
  dueToday: number
}

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<PatientStats>({ total: 0, active: 0, followUp: 0, dueToday: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showAddPatient, setShowAddPatient] = useState(false)
  // remove local scheduling dialog per request; scheduling will be done via editable profile

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    const handler = (e: any) => {
      const { id, status } = e.detail || {}
      if (!id) return
      setPatients((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, status } : p))
        const inactive = next.filter((pp: any) => pp.status === "inactive").length
        const active = next.length - inactive
        setStats({ total: next.length, active, followUp: 0, dueToday: 0 })
        return next
      })
    }
    window.addEventListener('patient-status-updated', handler as any)
    return () => window.removeEventListener('patient-status-updated', handler as any)
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await getAllPatients()
      setPatients(data)
      // derive stats from loaded list: active = total - inactive
      const inactive = data.filter((p: any) => p.status === "inactive").length
      const active = data.length - inactive
      setStats({ total: data.length, active, followUp: 0, dueToday: 0 })
    } catch (error) {
      console.error("Failed to load patients:", error)
    } finally {
      setLoading(false)
    }
  }

  // removed separate remote stats fetching; derived from current list

  const handlePatientAdded = () => {
    setShowAddPatient(false)
    loadPatients()
  }

  // scheduling moved to patient profile edit

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.condition && patient.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    const matchesCondition = conditionFilter === "all" || patient.condition === conditionFilter

    return matchesSearch && matchesStatus && matchesCondition
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success"
      case "follow-up":
        return "bg-warning/10 text-warning"
      case "inactive":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConstitutionDominant = (vata: number, pitta: number, kapha: number) => {
    const max = Math.max(vata, pitta, kapha)
    if (vata === max) return "Vata"
    if (pitta === max) return "Pitta"
    return "Kapha"
  }

  const uniqueConditions = [...new Set(patients.map((p) => p.condition).filter(Boolean))]

  const togglePatientActive = async (p: Patient) => {
    try {
      const newStatus = p.status === "active" ? "inactive" : "active"
      await updatePatient(p.id, { status: newStatus })
      setPatients((prev) => {
        const next = prev.map((x) => (x.id === p.id ? { ...x, status: newStatus } : x))
        // recompute stats locally for snappy UI: active = total - inactive
        const inactive = next.filter((pp: any) => pp.status === "inactive").length
        const active = next.length - inactive
        setStats({ total: next.length, active, followUp: 0, dueToday: 0 })
        return next
      })
    } catch (e) {
      console.error("Failed to toggle status", e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Patient Management</h1>
              <p className="text-muted-foreground">Manage patient profiles and track their Ayurvedic journey</p>
            </div>
            <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                </DialogHeader>
                <AddPatientForm onSuccess={handlePatientAdded} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, condition, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {uniqueConditions.map((condition) => (
                  <SelectItem key={condition} value={condition!}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats: show only Total / Active / Inactive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-success">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">{patients.filter((p) => p.status === "inactive").length}</div>
              <div className="text-sm text-muted-foreground">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="medical-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {patient.age} years • {patient.gender}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                </div>

                {/* Medical Info */}
                <div className="space-y-2">
                  {patient.condition && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Condition:</span>
                      <Badge variant="outline" className="text-xs">
                        {patient.condition}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Constitution:</span>
                    <Badge className="text-xs bg-accent/10 text-accent">
                      {getConstitutionDominant(
                        patient.vata_percentage,
                        patient.pitta_percentage,
                        patient.kapha_percentage,
                      )}{" "}
                      Dominant
                    </Badge>
                  </div>
                  {patient.bmi && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">BMI:</span>
                      <span className="text-sm font-medium">{patient.bmi}</span>
                    </div>
                  )}
                </div>

                {/* Constitution Bars */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Vata</span>
                    <span>{patient.vata_percentage}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${patient.vata_percentage}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span>Pitta</span>
                    <span>{patient.pitta_percentage}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${patient.pitta_percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span>Kapha</span>
                    <span>{patient.kapha_percentage}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${patient.kapha_percentage}%` }} />
                  </div>
                </div>

                {/* Appointments */}
                <div className="space-y-2 text-sm">
                  {patient.last_visit && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Visit:</span>
                      <span>{new Date(patient.last_visit).toLocaleDateString()}</span>
                    </div>
                  )}
                  {patient.next_appointment && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Appointment:</span>
                      <span className="font-medium">{new Date(patient.next_appointment).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1" onClick={() => setSelectedPatient(patient)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Patient Profile - {patient.name}</DialogTitle>
                      </DialogHeader>
                      {selectedPatient && <PatientProfile patient={selectedPatient} />}
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={() => setSelectedPatient(patient)}>
                    <Calendar className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center gap-2 ml-auto text-xs">
                    <span className="text-muted-foreground">Inactive</span>
                    <button
                      type="button"
                      onClick={() => togglePatientActive(patient)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        patient.status === "active" ? "bg-primary" : "bg-muted"
                      }`}
                      aria-label="Toggle active status"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                          patient.status === "active" ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-muted-foreground">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No patients found matching your criteria</div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setConditionFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
    </div>
  )
}
