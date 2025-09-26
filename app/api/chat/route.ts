import { NextResponse } from "next/server"
import { retrieveFoodContext, buildContextBlock } from "@/lib/rag/retriever"

export const runtime = "nodejs"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    const userText: string | undefined = body?.text

    const finalMessages: ChatMessage[] = []

    finalMessages.push({
      role: "system",
      content:
        "You are an expert Ayurvedic nutrition assistant. Be concise, practical, and supportive. When recommending foods, consider doshas (Vata, Pitta, Kapha) and standard nutrition."
    })

    let userPrompt: string | undefined
    if (messages.length > 0) {
      const lastUser = [...messages].reverse().find(m => m.role === "user")
      userPrompt = lastUser?.content
      finalMessages.push(...messages)
    } else if (typeof userText === "string" && userText.trim().length > 0) {
      userPrompt = userText.trim()
      finalMessages.push({ role: "user", content: userPrompt })
    } else {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // RAG: retrieve context from Chroma
    let ragContext = ""
    try {
      if (userPrompt) {
        const chunks = await retrieveFoodContext(userPrompt, 5)
        ragContext = buildContextBlock(chunks)
      }
    } catch (e) {
      // Fallback silently if retrieval fails
      ragContext = ""
    }

    if (ragContext) {
      finalMessages.push({
        role: "system",
        content: `Use the following factual context to ground your answer. If relevant items are missing, say so and answer conservatively.\n\n${ragContext}`,
      })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://localhost",
        "X-Title": "NutriVeda Chat"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: finalMessages,
        max_tokens: 600,
        temperature: 0.6
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "")
      return NextResponse.json({ error: "Upstream error", detail: errText }, { status: 502 })
    }

    const data = await response.json()
    const content: string = data?.choices?.[0]?.message?.content ?? ""
    return NextResponse.json({ content })
  } catch (error: unknown) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}


