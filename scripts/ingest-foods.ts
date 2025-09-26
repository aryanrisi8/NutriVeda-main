/* eslint-disable no-console */
import fs from "fs"
import path from "path"
import { parse } from "csv-parse"
import { buildOrUpdateStore } from "@/lib/rag/chroma"

type FoodRow = Record<string, string>

function readCsv(filePath: string): Promise<FoodRow[]> {
  return new Promise((resolve, reject) => {
    const rows: FoodRow[] = []
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row: FoodRow) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject)
  })
}

function rowToDoc(row: FoodRow): { id: string; text: string; metadata: Record<string, any> } {
  const name = row["food"] || row["name"] || "Unknown"
  const calories = row["Caloric Value"] || row["calories"] || row["calories_per_100g"] || ""
  const protein = row["Protein"] || row["protein_g"] || ""
  const carbs = row["Carbohydrates"] || row["carbs_g"] || ""
  const fat = row["Fat"] || row["fat_g"] || ""
  const fiber = row["Dietary Fiber"] || row["fiber_g"] || ""

  const parts = [
    `Food: ${name}`,
    calories ? `Calories: ${calories}` : "",
    protein ? `Protein: ${protein}g` : "",
    carbs ? `Carbs: ${carbs}g` : "",
    fat ? `Fat: ${fat}g` : "",
    fiber ? `Fiber: ${fiber}g` : "",
  ].filter(Boolean)

  const text = parts.join(" | ")
  const id = `${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return {
    id,
    text,
    metadata: {
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      source: "foods_csv",
    },
  }
}

async function main() {
  const datasetDir = process.env.RAG_DATA_DIR || path.join(process.cwd(), "public", "final food dataset")
  if (!fs.existsSync(datasetDir)) {
    console.error(`Dataset directory not found: ${datasetDir}`)
    process.exit(1)
  }

  const entries = fs.readdirSync(datasetDir)
  const csvFiles = entries.filter(f => f.toLowerCase().endsWith(".csv")).map(f => path.join(datasetDir, f))
  if (csvFiles.length === 0) {
    console.error("No CSV files found in dataset directory")
    process.exit(1)
  }

  console.log(`Found ${csvFiles.length} CSV files. Reading...`)
  const allRows: FoodRow[] = []
  for (const file of csvFiles) {
    const rows = await readCsv(file)
    console.log(`Loaded ${rows.length} rows from ${path.basename(file)}`)
    allRows.push(...rows)
  }

  const docs = allRows.map(rowToDoc)
  console.log(`Preparing ${docs.length} documents...`)

  console.log("Building/updating local HNSWLib vector store...")
  await buildOrUpdateStore(docs)

  console.log("Ingestion complete.")
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


