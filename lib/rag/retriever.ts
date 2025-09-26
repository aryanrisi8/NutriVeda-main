import { getVectorStore } from "@/lib/rag/chroma"
import { embedTexts } from "@/lib/rag/embeddings"

export type RetrievedChunk = {
  id: string
  text: string
  metadata: Record<string, any>
  distance?: number
}

export async function retrieveFoodContext(query: string, topK = 5): Promise<RetrievedChunk[]> {
  const store = await getVectorStore()
  if (store.length === 0) return []
  const [qvec] = await embedTexts([query])
  // cosine similarity
  const sims = store.map((d, i) => {
    const a = qvec
    const b = d.embedding
    let dot = 0
    let an = 0
    let bn = 0
    for (let j = 0; j < a.length && j < b.length; j++) {
      dot += a[j] * b[j]
      an += a[j] * a[j]
      bn += b[j] * b[j]
    }
    const denom = Math.sqrt(an) * Math.sqrt(bn) || 1
    return { idx: i, score: dot / denom }
  })
  sims.sort((x, y) => y.score - x.score)
  const picked = sims.slice(0, topK).map(s => store[s.idx])
  return picked.map(d => ({ id: d.id, text: d.text, metadata: d.metadata }))
}

export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (!chunks.length) return ""
  const lines: string[] = ["Relevant food facts:"]
  for (const c of chunks) {
    const name = c.metadata?.name || "Unknown"
    const calories = c.metadata?.calories || ""
    const protein = c.metadata?.protein || ""
    const carbs = c.metadata?.carbs || ""
    const fat = c.metadata?.fat || ""
    const fiber = c.metadata?.fiber || ""
    const attrs = [
      calories ? `Calories: ${calories}` : "",
      protein ? `Protein: ${protein}g` : "",
      carbs ? `Carbs: ${carbs}g` : "",
      fat ? `Fat: ${fat}g` : "",
      fiber ? `Fiber: ${fiber}g` : "",
    ].filter(Boolean).join(", ")
    lines.push(`- ${name}${attrs ? ` (${attrs})` : ""}`)
  }
  return lines.join("\n")
}


