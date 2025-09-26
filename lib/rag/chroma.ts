import fs from "fs"
import path from "path"
import { embedTexts } from "@/lib/rag/embeddings"

const RAG_DIR = process.env.RAG_STORE_DIR || path.join(process.cwd(), ".rag")
const STORE_PATH = path.join(RAG_DIR, "foods.json")

type StoredDoc = {
  id: string
  text: string
  metadata: Record<string, any>
  embedding: number[]
}

function ensureDir() {
  if (!fs.existsSync(RAG_DIR)) {
    fs.mkdirSync(RAG_DIR, { recursive: true })
  }
}

export async function getVectorStore(): Promise<StoredDoc[]> {
  ensureDir()
  if (!fs.existsSync(STORE_PATH)) {
    return []
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8")
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveVectorStore(docs: StoredDoc[]) {
  ensureDir()
  fs.writeFileSync(STORE_PATH, JSON.stringify(docs), "utf-8")
}

export async function buildOrUpdateStore(
  docs: { id: string; text: string; metadata: Record<string, any> }[],
) {
  const existing = await getVectorStore()
  const existingById = new Map(existing.map(d => [d.id, d]))
  const toEmbed: { id: string; text: string; metadata: Record<string, any> }[] = []
  for (const d of docs) {
    if (!existingById.has(d.id)) toEmbed.push(d)
  }
  if (toEmbed.length > 0) {
    const vectors = await embedTexts(toEmbed.map(d => d.text))
    toEmbed.forEach((d, i) => {
      existingById.set(d.id, { ...d, embedding: vectors[i] })
    })
  }
  const merged = Array.from(existingById.values())
  await saveVectorStore(merged)
}



