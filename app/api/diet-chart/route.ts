import { NextRequest, NextResponse } from "next/server"
import { getPatientById } from "@/lib/database/patients"
import { spawn } from "child_process"
import path from "path"

function runPythonGenerate(input: any): Promise<any> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), "scripts", "generate_diet_chart.py")
    const modelPath = path.join(process.cwd(), "ayurvedic_model_pipeline.pkl")

    const py = spawn(process.platform === "win32" ? "python" : "python3", [scriptPath, modelPath], {
      env: { ...process.env },
    })

    let stdout = ""
    let stderr = ""

    py.stdout.on("data", (d) => (stdout += d.toString()))
    py.stderr.on("data", (d) => (stderr += d.toString()))

    py.on("close", () => {
      try {
        const parsed = JSON.parse(stdout)
        resolve({ ok: true, data: parsed, stderr })
      } catch {
        resolve({ ok: false, error: stderr || "Failed to parse generator output" })
      }
    })

    py.stdin.write(JSON.stringify(input))
    py.stdin.end()
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId, patient } = body || {}

    let patientData = patient
    if (!patientData && patientId) {
      patientData = await getPatientById(patientId)
    }

    if (!patientData) {
      return NextResponse.json({ error: "Missing patient data" }, { status: 400 })
    }

    console.log("Generating diet chart for patient:", patientData.name)

    // Map patient data to generator input schema
    const input = {
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      condition: patientData.condition,
      vata_percentage: patientData.vata_percentage,
      pitta_percentage: patientData.pitta_percentage,
      kapha_percentage: patientData.kapha_percentage,
      dietary_restrictions: patientData.dietary_restrictions || [],
      current_medications: patientData.current_medications || [],
      bmi: (patientData as any).bmi || null,
      notes: patientData.notes || null,
    }

    console.log("Input to Python script:", input)

    const result = await runPythonGenerate(input)
    console.log("Python script result:", result)
    
    if (!result.ok) {
      console.error("Python script error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    console.log("Generated chart:", result.data)
    return NextResponse.json({ chart: result.data })
  } catch (e: any) {
    console.error("API error:", e)
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


