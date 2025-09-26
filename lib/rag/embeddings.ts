import { OpenAIEmbeddings } from "@langchain/openai"

let singleton: OpenAIEmbeddings | null = null

function getEmbeddings(): OpenAIEmbeddings {
  if (!singleton) {
    singleton = new OpenAIEmbeddings({
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      model: process.env.RAG_EMBEDDING_MODEL || "text-embedding-3-small",
    })
  }
  return singleton
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embedder = getEmbeddings()
  const vectors = await embedder.embedDocuments(texts)
  return vectors
}

export function getEmbeddingsInstance(): OpenAIEmbeddings {
  return getEmbeddings()
}


